import type { FC, PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  credentialStore,
  supabaseClient,
} from "~/components/InternalIframeDemo";
import { ethers, Wallet, Wallet as WalletType } from "ethers";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { IoKey } from "react-icons/io5";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import {
  arrayBufferToBase64,
  convertStringToCryptoKey,
  decryptData,
  decryptPrivateKeyGetWallet,
  encryptData,
  isEmpty,
  uint8ArrayToBase64,
} from "~/lib/cryptoLib";
import { AuthApiError, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OTPCard from "./OTPCard";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  console.log("pin", pin, deviceKey);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser(); //TODO should this be getSession()?
  if (!user || !user.user_metadata) {
    throw new Error("User does not appear to be signed in");
  }

  const { data: userRow } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!userRow) {
    throw new Error("No user found");
  }
  console.log("logged in user:", user);
  //Basic validation
  const { password_encrypted_private_key, iv } = userRow;
  // if (!password_encrypted_private_key && !device_encrypted_private_key) {
  if (!password_encrypted_private_key) {
    throw new Error("user has no embedded wallet"); //TODO, carve exception when user logged in with web3 wallet
  } else if (!iv) {
    throw new Error("legacy user has no iv, delete user and recreate");
  }

  if (pin && password_encrypted_private_key) {
    console.log(
      "pin set, decrypting pin encrypted private key",
      password_encrypted_private_key
    );
    return await decryptPrivateKeyGetWallet(
      password_encrypted_private_key,
      pin,
      iv
    );
  }
  // else if (deviceKey && device_encrypted_private_key) {
  //   console.log(
  //     "device key set, decrypting device encrypted private key",
  //     deviceKey
  //   );
  //   return await decryptPrivateKeyGetWallet(
  //     device_encrypted_private_key,
  //     deviceKey,
  //     iv
  //   );
  // }
  throw new Error(
    `user has not submitted a valid combination of pin and pin_encrypted_private_key or devicePrivateKey and device_encrypted_private_key, ${{
      pin: pin,
      deviceKey,
      password_encrypted_private_key,
      device_encrypted_private_key: undefined,
    }}`
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
    id: session.data.session?.user?.id || "",
    iv: uint8ArrayToBase64(iv),
    password_encrypted_private_key: "",
  };

  console.log("Creating new embedded wallet for user", session);

  if (pin) {
    const pinCryptoKey = await convertStringToCryptoKey(pin);
    const pinEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      pinCryptoKey,
      iv
    );
    updateUserData.password_encrypted_private_key = arrayBufferToBase64(
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
    updateUserData.password_encrypted_private_key = arrayBufferToBase64(
      deviceEncryptedPrivateKey
    );
  }

  console.log("Updating user with: ", updateUserData);
  await supabaseClient.auth.updateUser({
    data: updateUserData,
  });
  await supabaseClient.from("users").upsert({
    id: session.data.session?.user?.id || "",
    public_key: newEmbeddedWallet.address,
    password_encrypted_private_key:
      updateUserData.password_encrypted_private_key,
    iv: updateUserData.iv,
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
  const [user, setUser] = useState<User | null>(null);
  const [isOTPScreen, setIsOTPScreen] = useState(false);
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

  const logUserIntoApp = async (pin: string) => {
    try {
      const { data: userMetadata } = await supabaseClient.auth.getSession();
      if (!userMetadata || !userMetadata.session?.user.id) {
        throw new Error("No user data found");
      }
      const { data: user } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", userMetadata.session?.user.id)
        .maybeSingle();

      //TODO currently only supports pin, not device key
      let deviceKey;
      if (!user) {
        console.log("user doesn't have an embedded wallet, creating one now");

        const deviceWallet = ethers.Wallet.createRandom();
        localStorage.setItem("devicekey", deviceWallet!.privateKey);
        deviceKey = deviceWallet!.privateKey;
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:144 ~ deviceKey:",
          deviceKey
        );
        await createNewEmbeddedWalletForUser(pin, deviceKey);
      }
      const localWallet = await getUserEmbeddedWallet(pin, deviceKey);
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
      //TODO use random password because only OTP sign in should be available
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: "random" + Math.random(),
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
            password: "random" + Math.random(),
          });
        if (signupError) {
          setAdditionalError(signupError.message);
          return;
        } else if (!signupData.user) {
          setAdditionalError("No user found after signup");
          return;
        }

        console.log("user signed up", signupData);
        user = signupData.user;
        console.log("asking the issuer to provide basic credentials");
        await logUserIntoApp(pin);
        const vcs = await credentialStore.requestIssueBasicCredentials({
          jwt: signupData.session?.access_token || "",
        });
        console.log("Issuer issued the following credentials", vcs);
      } else {
        console.log("user with email", formData.email, "found");
        user = data.user;
      }
      await logUserIntoApp(pin);
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
        await logUserIntoApp(pin);
      } else {
        console.log("No session found");
        setAdditionalError("No session found");
      }
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };

  // const [recievedMessage, setRecievedMessage] = useState("");

  // const sendMessage = () => {
  //   console.log("window1", window.parent);

  //   window.parent.postMessage("wallet", "http://localhost:3000");
  // };

  // useEffect(() => {
  //   window.addEventListener("message", function (e) {
  //     console.log("child", e);

  //     if (e.origin !== "http://localhost:3000") return;
  //     setRecievedMessage("Got this message from parent: " + e.data);
  //   });
  // }, []);

  useEffect(() => {
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
      console.log("user nav", session);

      if (session) {
        console.log("navb", localStorage.getItem("deviceprivatekey"));
        // const user = session.user;
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();
        const { data: userRow } = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", user!.id)
          .maybeSingle();
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:344 ~ supabaseClient.auth.getSession ~ user:",
          userRow
        );
        // const iv = crypto.getRandomValues(new Uint8Array(12));
        const deviceKey = localStorage.getItem("devicekey");
        const encryptedKey = await convertStringToCryptoKey(deviceKey!);
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:356 ~ supabaseClient.auth.getSession ~ encryptedKey:",
          encryptedKey
        );
        const exampleData = await decryptPrivateKeyGetWallet(
          userRow?.password_encrypted_private_key!,
          encryptedKey,
          userRow?.iv!
        );
        // const  await logUserIntoApp
        setDevicePrivateKey(localStorage.getItem("devicekey")!);
        console.log(
          "🚀 ~ file: LoginWithEmail.tsx:30 ~ login ~ exampleData:",
          exampleData
        );
        setWallet(exampleData);
        // setLocalAccount(exampleData);
        setUser(user!);
        setLoggedIn(true);
      } else {
        // alert("Error Accessing User");
      }
    });
  }, []);

  console.log("Outermost wallet:", wallet);
  if (!loggedIn) {
    return (
      <>
        {/* <div>
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
            <Button type="submit">Login</Button>
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
            <Button type="submit">Login</Button>
            <Typography color={"error"}>{additionalError}</Typography>
          </form>
        </div> */}
        {/* <button onClick={sendMessage}>Send message to parent</button> */}
        {/* <p>received from parent: {recievedMessage}</p> */}
        {isOTPScreen ? (
          <OTPCard />
        ) : (
          <ScrollArea className="h-[100vh] rounded-md ">
            <Card className=" p-8  bg-slate-100">
              <Tabs defaultValue="password" className="h-full w-[435px]">
                <form onSubmit={emailPassHandleSubmit(emailPassSubmit)}>
                  <TabsContent value="password">
                    <Card>
                      <CardHeader>
                        <CardTitle>Password Login</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            {...emailPassRegister("email", { required: true })}
                            defaultValue={"test3@test.com"}
                            type="email"
                            id="email"
                            placeholder="test3@test.com"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="email">Pin</Label>
                          <Input
                            type={"password"}
                            {...emailPassRegister("password", {
                              required: true,
                            })}
                            onChange={(e) => setPin(e.target.value)}
                            defaultValue={
                              localStorage.getItem("pin") ?? "password"
                            }
                            value={pin}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex w-full items-center justify-center">
                        <Button
                          type="submit"
                          variant="outline"
                          className="px-4 w-full text-lg font-semibold tracking-wide"
                        >
                          Submit
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </form>
              </Tabs>
              <div className="flex mt-2 gap-4 w-full">
                <Button
                  variant="outline"
                  className="border flex items-center justify-center px-8 w-1/3  rounded-md"
                >
                  <IoKey className="w-8 h-8" />
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="border cursor-not-allowed flex items-center justify-center px-8 w-1/3  rounded-md"
                >
                  <FaTwitter className="w-7 h-7 fill-current " />
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="border flex cursor-not-allowed items-center justify-center px-8 w-1/3  rounded-md"
                >
                  <FaDiscord className="w-8 h-8" />
                </Button>
              </div>
              <div className="w-full mt-3">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full border-none"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      {" "}
                      <Button
                        variant="outline"
                        className="border  font-semibold text-lg tracking-tighter flex items-center justify-center px-8 w-full  rounded-md"
                      >
                        Connect Wallet
                      </Button>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        className="w-full flex justify-between"
                      >
                        <div className="flex gap-2">
                          <img
                            width={24}
                            height={24}
                            src="/metamask.svg"
                            alt="metamask"
                          />
                          <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                            MetaMask
                          </span>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
                          Popular
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex justify-between"
                      >
                        <div className="flex gap-2">
                          <img
                            width={24}
                            height={24}
                            src="/coinbase.svg"
                            className="rounded-lg"
                            alt="coinbase"
                          />
                          <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                            Coinbase Wallet
                          </span>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex justify-between"
                      >
                        <div className="flex gap-2">
                          <img
                            width={24}
                            height={24}
                            src="/wallet-connect.svg"
                            className="rounded-lg"
                            alt="wallet-connect"
                          />
                          <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                            WalletConnect
                          </span>
                        </div>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </Card>
          </ScrollArea>
        )}
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
