import type {FC, PropsWithChildren} from "react";
import {createContext, useState} from "react";
import type {SubmitHandler} from "react-hook-form";
import {useForm} from "react-hook-form";
import {credentialStore, supabaseClient} from "~/components/Home";
import type {Wallet, Wallet as WalletType} from "ethers";
import {ethers} from "ethers";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {IoKey} from "react-icons/io5";
import {FaDiscord, FaTwitter} from "react-icons/fa";
import {Label} from "@/components/ui/label";
import {
  arrayBufferToBase64,
  convertStringToCryptoKey,
  decryptPrivateKeyGetWallet,
  encryptData,
  isEmpty,
  uint8ArrayToBase64,
} from "~/lib/cryptoLib";
import {AuthApiError} from "@supabase/supabase-js";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import OTPCard from "./OTPCard";
import {ScrollArea} from "@/components/ui/scroll-area";

//TODO Remix has loaders, which can break up this code into smaller, easier to manage/test parts
type VerifyEmailPasswordFormProps = {
  email: string;
  password: string;
};
type VerifyOtpFormProps = {
  email: string;
  otp: string;
};
type PrivateKeyContextProps = {
  wallet?: WalletType;
  deviceKey?: string;
  pin: string;
};

export const PrivateKeyContext = createContext<PrivateKeyContextProps>({
  deviceKey: undefined,
  pin: "",
  wallet: undefined,
});

// Get a user, and decrypt their private key
export const getUserEmbeddedWallet = async (
  pin?: string,
  deviceKey?: string,
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
  console.log("userRow", userRow);
  if (!password_encrypted_private_key) {
    throw new Error("user has no embedded wallet"); //TODO, carve exception when user logged in with web3 wallet
  } else if (!iv) {
    throw new Error("legacy user has no iv, delete user and recreate");
  }

  if (pin && password_encrypted_private_key) {
    console.log(
      "pin set, decrypting pin encrypted private key",
      password_encrypted_private_key,
    );
    return await decryptPrivateKeyGetWallet(
      password_encrypted_private_key,
      pin,
      iv,
    );
  }

  throw new Error(
    `user has not submitted a valid combination of pin and pin_encrypted_private_key or devicePrivateKey and device_encrypted_private_key, ${{
      pin: pin,
      deviceKey,
      password_encrypted_private_key,
      device_encrypted_private_key: undefined,
    }}`,
  );
};

const createNewEmbeddedWalletForUser = async (
  pin: string,
  deviceKey?: string,
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
    console.log("Pin provided, encrypting private key with", pin);
    const pinCryptoKey = await convertStringToCryptoKey(pin);
    const pinEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      pinCryptoKey,
      iv,
    );
    updateUserData.password_encrypted_private_key = arrayBufferToBase64(
      pinEncryptedPrivateKey,
    );
  }
  if (deviceKey) {
    const deviceCryptoKey = await convertStringToCryptoKey(deviceKey);
    const deviceEncryptedPrivateKey = await encryptData(
      newEmbeddedWallet.privateKey,
      deviceCryptoKey,
      iv,
    );
    updateUserData.password_encrypted_private_key = arrayBufferToBase64(
      deviceEncryptedPrivateKey,
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
  pin_encrypted_private_key?: object;
  device_encrypted_private_key?: object;
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
      if (!user?.password_encrypted_private_key) {
        console.log("user doesn't have an embedded wallet, creating one now");
        await createNewEmbeddedWalletForUser(pin, undefined);
      }
      const localWallet = await getUserEmbeddedWallet(
        pin,
        devicePrivateKey || "",
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
    formData,
  ) => {
    try {
      console.log("Signing in with email and pass, formdata", formData);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      console.log("emailPassSubmit", data);

      //TODO Below won't fire if the user doesn't exist (desired) OR if the user exists but provided bad credentials (not desired)
      if (error && !(error instanceof AuthApiError)) {
        setAdditionalError(error.message);
        return;
      }

      console.log("userData after clicking sign in:", data);
      if (!data.user) {
        console.log("user not found, signing up");
        const { data: signupData, error: signupError } =
          await supabaseClient.auth.signUp({
            email: formData.email,
            password: formData.password,
          });
        if (signupError) {
          setAdditionalError(signupError.message);
          return;
        } else if (!signupData.user) {
          setAdditionalError("No user found after signup");
          return;
        }

        console.log("user signed up", signupData);
        console.log("asking the issuer to provide basic credentials");
        await logUserIntoApp(pin);
        const vcs = await credentialStore.requestIssueBasicCredentials({
          jwt: signupData.session?.access_token || "",
        });
        console.log("Issuer issued the following credentials", vcs);
      } else {
        console.log("user with email", formData.email, "found");
      }
      await logUserIntoApp(pin);
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };

  console.log("Outermost wallet:", wallet);
  if (!loggedIn) {
    return (
      <>
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
                            defaultValue={"test15@test.com"}
                            type="email"
                            id="email"
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
              {additionalError && (
                <div className="text-red-500">{additionalError}</div>
              )}
            </Card>
          </ScrollArea>
        )}
      </>
    );
  }
  return (
    <PrivateKeyContext.Provider
      value={{
        deviceKey: devicePrivateKey,
        pin,
        // wallet,
      }}
    >
      {children}
    </PrivateKeyContext.Provider>
  );
};
