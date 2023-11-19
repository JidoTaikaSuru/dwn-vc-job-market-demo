import type {FC, PropsWithChildren} from "react";
import {createContext, useState} from "react";
import type {SubmitHandler} from "react-hook-form";
import {useForm} from "react-hook-form";
import {supabaseClient} from "~/components/InternalIframeDemo";
import {Button, TextField, Typography} from "@mui/material";
import {ethers, Wallet, Wallet as WalletType} from "ethers";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  base64ToUint8Array,
  convertStringToCryptoKey,
  decryptData,
  encryptData,
  isEmpty, uint8ArrayToBase64,
} from "~/lib/cryptoLib";

//TODO Remix has loaders, which can break up this code into smaller, easier to manage/test parts

type InitializeLoginFormProps = {
  email: string;
};
type VerifyOtpFormProps = {
  email: string;
  pin: string;
  otp: string;
};
type DeviceKeyContextProps = {
  devicePrivateKey?: CryptoKey;
  wallet?: WalletType;
  pin: string;
};
const iv = crypto.getRandomValues(new Uint8Array(12)); // random initialization vector

console.log("IV, whatever, make this constant");
console.log(iv);

export const DeviceKeyContext = createContext<DeviceKeyContextProps>({
  devicePrivateKey: undefined,
  pin: "",
  wallet: undefined,
});

// Get a user, and decrypt their private key
// TODO Split user fetch from decrypt
export const getUserEmbeddedWallet = async (
  pin?: string,
  devicePrivateKey?: CryptoKey
): Promise<Wallet> => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (user && user.user_metadata) {
    const {pin_encrypted_private_key, device_encrypted_private_key, iv} = user.user_metadata;
    console.log("loggedin user:", user);
    console.log("user.user_metadata:",user.user_metadata);
    if (
      !pin_encrypted_private_key &&
      !device_encrypted_private_key
    ) {
      throw new Error("user has no embedded wallet"); //TODO, carve exception when user logged in with web3 wallet
    } else if (!iv) {
      // TODO, delete me when everyone has recreated user
      throw new Error("legacy user has no iv, delete user and recreate");
    }
    if (pin) {
      console.log(
        "device key not set, pin set, decrypting pin encrypted private key",
        pin_encrypted_private_key,
        pin_encrypted_private_key.buffer
      );
      const privateKeyEncryptionPin = await convertStringToCryptoKey(pin);
      const privateKey = await decryptData(
        base64ToArrayBuffer(pin_encrypted_private_key),
        privateKeyEncryptionPin,
        // base64ToUint8Array(user.user_metadata.iv)
        iv
      );
      console.log("pin decrypted private key from db :" + privateKey);
      const wallet = new Wallet(privateKey);
      console.log("wallet:" + wallet);
      return wallet;
    } else if (devicePrivateKey) {
      console.log("device key set, decrypting device encrypted private key");
      // const deviceKeyCryptoKey = await convertStringToCryptoKey(devicePrivateKey);
      const privateKey = await decryptData(
        device_encrypted_private_key,
        devicePrivateKey,
        iv
      );
      console.log("device key decrypted private key from db :" + privateKey);
      const wallet = new Wallet(privateKey);
      console.log("wallet:" + wallet);
      return wallet;
    }
    throw new Error(
      "no devicePrivateKey or pin provided, at least one is required"
    );
  }
  throw new Error("user is not signed in");
};

export const RequireUserLoggedIn: FC<PropsWithChildren> = ({ children }) => {
  const [devicePrivateKey, setDevicePrivateKey] = useState<
    CryptoKey | undefined
  >(undefined);
  const [pin, setPin] = useState(""); //TODO, this is not used yet, but will be used to encrypt the private key
  const [wallet, setWallet] = useState<WalletType | undefined>(undefined);
  const [additionalError, setAdditionalError] = useState("");
  const [initializeLoginEmail, setInitializeLoginEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const {
    register: initializeLoginRegister,
    handleSubmit: initializeLoginHandleSubmit,
    formState: { errors: initializeLoginErrors },
  } = useForm<InitializeLoginFormProps>();
  const {
    register: verifyOtpRegister,
    handleSubmit: verifyOtpHandleSubmit,
    formState: { errors: verifyOtpErrors },
  } = useForm<VerifyOtpFormProps>();

  const [initializedLogin, setInitializedLogin] = useState(false);
  const initializeLoginSubmit: SubmitHandler<InitializeLoginFormProps> = async (
    formData
  ) => {
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
    setInitializeLoginEmail(formData.email);
  };

  //TODO Function is far too complex and encourages duplication, break into smaller parts
  const verifyOtpSubmit: SubmitHandler<VerifyOtpFormProps> = async (
    formData
  ) => {
    try {
      console.log("Signing in with", formData);
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.verifyOtp({
        email: initializeLoginEmail,
        token: formData.otp,
        type: "email",
      });

      console.log("session", session);
      console.log("error", error);

      if (session) {
        console.log(!session.user.user_metadata.pin_encrypted_private_key);
        console.log(
          isEmpty(session.user.user_metadata.device_encrypted_private_key)
        );
        const {pin_encrypted_private_key, device_encrypted_private_key} = session.user.user_metadata;
        //TODO below can have mutations for device key when we figure that one out
        try {
          if (isEmpty(pin_encrypted_private_key)) {
            console.log(
              "no pin_encrypted_private_key, assuming user doesn't have wallet, creating one now"
            );
            const newEmbeddedWallet = ethers.Wallet.createRandom();
            const pinCryptoKey = await convertStringToCryptoKey(formData.pin);
            const { iv, encryptedData: pinEncryptedPrivateKey } =
              await encryptData(newEmbeddedWallet.privateKey, pinCryptoKey);
            const updateData = {
              pin_encrypted_private_key: arrayBufferToBase64(pinEncryptedPrivateKey),
              iv: uint8ArrayToBase64(iv),
            };
            console.log("Updating user with: ", updateData);
            await supabaseClient.auth.updateUser({
              data: updateData,
            });
            console.log("Finished updating user");
          }
          const localWallet = await getUserEmbeddedWallet(
            formData.pin,
            devicePrivateKey
          );
          setPin(formData.pin);
          setWallet(localWallet);
          setLoggedIn(true);
        } catch (error: any) {
          console.log("error", error);
          setAdditionalError(error.message);
        }
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
    return !initializedLogin ? (
      <form onSubmit={initializeLoginHandleSubmit(initializeLoginSubmit)}>
        <TextField
          {...initializeLoginRegister("email", { required: true })}
          label={"Email"}
          type={"email"}
          helperText={initializeLoginErrors.email?.message}
          error={!!initializeLoginErrors.email}
        />
        <Button type="submit" variant="contained">
          Login
        </Button>
      </form>
    ) : (
      <form onSubmit={verifyOtpHandleSubmit(verifyOtpSubmit)}>
        <TextField
          {...verifyOtpRegister("email", { required: true })}
          label={"Email"}
          type={"email"}
          helperText={verifyOtpErrors.email?.message}
          error={!!verifyOtpErrors.email}
          defaultValue={initializeLoginEmail}
        />
        <TextField
          {...verifyOtpRegister("pin", { required: true })}
          label={"Decrypt Pin"}
          type={"password"}
          helperText={verifyOtpErrors.pin?.message}
          error={!!verifyOtpErrors.pin}
          defaultValue={localStorage.getItem("pin")}
        />
        <TextField
          {...verifyOtpRegister("otp", { required: true })}
          label={"OTP"}
          type={"text"}
          helperText={verifyOtpErrors.otp?.message}
          error={!!verifyOtpErrors.otp}
        />
        <Button type="submit" variant="contained">
          Login
        </Button>
        <Typography color={"error"}>{additionalError}</Typography>
      </form>
    );
  }
  return (
    <DeviceKeyContext.Provider
      value={{
        devicePrivateKey,
        pin,
        wallet,
      }}
    >
      {children}
    </DeviceKeyContext.Provider>
  );
};
