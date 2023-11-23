import type {FC, PropsWithChildren} from "react";
import {createContext, useState} from "react";
import type {SubmitHandler} from "react-hook-form";
import {useForm} from "react-hook-form";
import {supabaseClient} from "~/components/InternalIframeDemo";
import {Button, TextField, Typography} from "@mui/material";
import {ethers, Wallet, Wallet as WalletType} from "ethers";
import {
  arrayBufferToBase64,
  convertStringToCryptoKey,
  decryptPrivateKeyGetWallet,
  encryptData,
  isEmpty, uint8ArrayToBase64,
} from "~/lib/cryptoLib";
import {AuthApiError, User} from "@supabase/supabase-js";

//TODO Remix has loaders, which can break up this code into smaller, easier to manage/test parts
type VerifyEmailPasswordFormProps = {
  email: string;
  password: string;
};
type VerifyOtpFormProps = {
  email: string;
  otp: string;
};
type DeviceKeyContextProps = {
  wallet?: WalletType;
  deviceKey?: string;
  pin: string;
};

type UserMetadata = {
  pin_encrypted_private_key?: string;
  device_encrypted_private_key?: string;
  iv?: Uint8Array;
};

export const DeviceKeyContext = createContext<DeviceKeyContextProps>({
  deviceKey: undefined,
  pin: "",
  wallet: undefined,
});

// Get a user, and decrypt their private key
export const getUserEmbeddedWallet = async (
  pin?: string,
  deviceKey?: string
): Promise<Wallet> => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser(); //TODO should this be getSession()?
  if (!user || !user.user_metadata) {
    throw new Error("User does not appear to be signed in");
  }
  const { pin_encrypted_private_key, device_encrypted_private_key, iv } =
    user.user_metadata;

  console.log("logged in user:", user);
  //Basic validation
  if (!pin_encrypted_private_key && !device_encrypted_private_key) {
    throw new Error("user has no embedded wallet"); //TODO, carve exception when user logged in with web3 wallet
  } else if (!iv) {
    throw new Error("legacy user has no iv, delete user and recreate");
  }

  if (pin && pin_encrypted_private_key) {
    console.log(
      "pin set, decrypting pin encrypted private key",
      pin_encrypted_private_key
    );
    return await decryptPrivateKeyGetWallet(pin_encrypted_private_key, pin, iv);
  } else if (deviceKey && device_encrypted_private_key) {
    console.log(
      "device key set, decrypting device encrypted private key",
      deviceKey
    );
    return await decryptPrivateKeyGetWallet(
      device_encrypted_private_key,
      deviceKey,
      iv
    );
  }
  throw new Error(
    `user has not submitted a valid combination of pin and pin_encrypted_private_key or devicePrivateKey and device_encrypted_private_key, ${{
      pin: pin,
      deviceKey,
      pin_encrypted_private_key,
      device_encrypted_private_key,
    }}`,

  );
};

const createNewEmbeddedWalletForUser = async (
  pin: string,
  deviceKey?: string
) => {
  const session = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error("No session found");
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const newEmbeddedWallet = ethers.Wallet.createRandom();

  const updateUserData = {
    iv: uint8ArrayToBase64(iv),
    pin_encrypted_private_key: "",
    device_encrypted_private_key: "",
  };
  console.log("Creating new embedded wallet for user", session);
  if (pin) {
    const pinCryptoKey = await convertStringToCryptoKey(pin);
    const pinEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      pinCryptoKey,
      iv
    );
    updateUserData.pin_encrypted_private_key = arrayBufferToBase64(
      pinEncryptedPrivateKey
    );
  }
  if (deviceKey) {
    const deviceCryptoKey = await convertStringToCryptoKey(deviceKey);
    const deviceEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      deviceCryptoKey,
      iv
    );
    updateUserData.device_encrypted_private_key = arrayBufferToBase64(
      deviceEncryptedPrivateKey
    );
  }

  console.log("Updating user with: ", updateUserData);
  await supabaseClient.auth.updateUser({
    data: updateUserData,
  });
  console.log("Finished updating user");
};

export const userHasEmbeddedWallet = ({
  pin_encrypted_private_key,
  device_encrypted_private_key,
}: {
  pin_encrypted_private_key?: Object;
  device_encrypted_private_key?: Object;
}): boolean => {
  return (
    (!!pin_encrypted_private_key && !isEmpty(pin_encrypted_private_key)) ||
    (!!device_encrypted_private_key && !isEmpty(device_encrypted_private_key))
  );
};

export const RequireUserLoggedIn: FC<PropsWithChildren> = ({ children }) => {
  const [devicePrivateKey, setDevicePrivateKey] = useState("");
  const [pin, setPin] = useState("testing");
  const [wallet, setWallet] = useState<WalletType | undefined>(undefined);
  const [additionalError, setAdditionalError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const {
    register: emailPassRegister,
    handleSubmit: emailPassHandleSubmit,
    formState: { errors: emailPassErrors },
  } = useForm<VerifyEmailPasswordFormProps>();
  const {
    register: verifyOtpRegister,
    handleSubmit: verifyOtpHandleSubmit,
    formState: { errors: verifyOtpErrors },
  } = useForm<VerifyOtpFormProps>();

  const [initializedLogin, setInitializedLogin] = useState(false);

  const logUserIntoApp = async (userMetadata: UserMetadata, pin: string) => {
    try {
      //TODO currently only supports pin, not device key
      if (!userHasEmbeddedWallet(userMetadata)) {
        console.log("user doesn't have an embedded wallet, creating one now");
        await createNewEmbeddedWalletForUser(pin, undefined);
      }
      const localWallet = await getUserEmbeddedWallet(
        pin,
        devicePrivateKey || ""
      );
      console.log("localWallet", localWallet);
      window.localStorage.setItem("pin", pin);
      setWallet(localWallet);
      setLoggedIn(true);
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };

  const emailPassSubmit: SubmitHandler<VerifyEmailPasswordFormProps> = async (
    formData
  ) => {
    try {
      console.log("Signing in with email and pass", formData);
      let user: User;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      console.log("emailPassSubmit", data);

      if (error && !(error instanceof AuthApiError)) {
        setAdditionalError(error.message);
        return;
      }
      if (!data.user) {
        console.log("user not found, signing up");
        const { data: signupData, error: signupError } =
          await supabaseClient.auth.signUp({
            email: formData.email,
            password: formData.password,
          });
        if (signupError) {
          setAdditionalError(signupError.message);
          return
        } else if (!signupData.user) {
          setAdditionalError("No user found after signup");
          return
        }
        console.log("user signed up", signupData);
        user = signupData.user;
      } else {
        console.log("user with email", formData.email, "found");
        user = data.user;
      }

      await logUserIntoApp(user.user_metadata, pin);
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };
  //TODO Function is far too complex and encourages duplication, break into smaller parts
  const verifyOtpSubmit: SubmitHandler<VerifyOtpFormProps> = async (
    formData
  ) => {
    try {
      console.log("Signing in with", formData);

      // First "submit" sends OTP to user's email. Second "submit" verifies OTP and logs in user.
      if (!initializedLogin) {
        const { data, error } = await supabaseClient.auth.signInWithOtp({
          //This also signs up users if they have not yet created an account.
          email: formData.email,
          options: {
            shouldCreateUser: true,
          },
          //password:document.getElementById('login-password').value,  //we will use the password for encrypting like the pin before
        });
        console.log("start login data", data);
        console.log("start login errors", error);
        setInitializedLogin(true);
        return;
      }

      // Second "submit" starts here
      console.log("Verifying OTP");
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: "email",
      });

      console.log("session", session);
      console.log("error", error);

      if (session) {
        await logUserIntoApp(session.user.user_metadata, pin);
      } else {
        console.log("No session found");
        setAdditionalError("No session found");
      }
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }

  };

  console.log("Outermost wallet:", wallet);
  if (!loggedIn) {
    return (
      <>
        <Typography variant={"h5"}>PIN (Always required)</Typography>
        <TextField
          label={"Decrypt Pin"}
          type={"password"}
          onChange={(e) => setPin(e.target.value)}
          defaultValue={localStorage.getItem("pin")}
          value={pin}
        />
        <Typography variant={"h5"}>Password login</Typography>
        <form onSubmit={emailPassHandleSubmit(emailPassSubmit)}>
          <TextField
            {...emailPassRegister("email", { required: true })}
            label={"Email"}
            type={"email"}
            helperText={emailPassErrors.email?.message}
            error={!!emailPassErrors.email}
            defaultValue={"test3@test.com"}
          />
          <TextField
            {...emailPassRegister("password", { required: true })}
            label={"Password"}
            type={"password"}
            helperText={emailPassErrors.email?.message}
            error={!!emailPassErrors.email}
            defaultValue={"password"}
          />
          <Button type="submit" variant="contained">
            Login
          </Button>
          <Typography color={"error"}>{additionalError}</Typography>
        </form>
        <Typography variant={"h5"}>OTP/Magic Link Signin</Typography>
        <form onSubmit={verifyOtpHandleSubmit(verifyOtpSubmit)}>
          <TextField
            {...verifyOtpRegister("email", { required: true })}
            label={"Email"}
            type={"email"}
            helperText={verifyOtpErrors.email?.message}
            error={!!verifyOtpErrors.email}
          />
          <TextField
            {...verifyOtpRegister("otp", { required: initializedLogin })}
            label={"OTP"}
            type={"text"}
            disabled={!initializedLogin}
            helperText={verifyOtpErrors.otp?.message}
            error={!!verifyOtpErrors.otp}
          />
          <Button type="submit" variant="contained">
            Login
          </Button>
          <Typography color={"error"}>{additionalError}</Typography>
        </form>
      </>
    );
  }
  return (
    <DeviceKeyContext.Provider
      value={{
        deviceKey: devicePrivateKey,
        pin,
        wallet,
      }}
    >
      {children}
    </DeviceKeyContext.Provider>
  );
};
