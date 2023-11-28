import { PropsWithChildren, useContext, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { IoKey } from "react-icons/io5";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { AuthApiError, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { SessionContext } from "@/contexts/SessionContext";
import {
  createNewEmbeddedWalletForUser,
  getUserEmbeddedWallet,
} from "@/lib/embeddedWalletLib";
import { credentialStore, supabaseClient } from "@/lib/common";

type VerifyEmailPasswordFormProps = {
  email: string;
  password: string;
};

export const RequireUserLoggedIn: React.FC<PropsWithChildren> = ({
  children
}) => {
  const [additionalError, setAdditionalError] = useState("");
  const { session, setSession, setWallet } = useContext(SessionContext);

  const {
    register: emailPassRegister,
    handleSubmit: emailPassHandleSubmit,
    // formState: { errors: emailPassErrors }, //TODO Add this to the form
  } = useForm<VerifyEmailPasswordFormProps>();

  const logUserIntoApp = async (
    sessionData: Session | null,
    pin: string,
  ) => {
    try {
      if (!sessionData || !sessionData.user.id) {
        setAdditionalError("Attempt to sign in without having a session");
        return;
      }

      const { data: user, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", sessionData.user.id)
        .maybeSingle();
      if (error) {
        setAdditionalError(error.message);
        return;
      }
      if (!user) {
        setAdditionalError("No user found");
        return;
      }

      let deviceKey = localStorage.getItem("devicekey");
      if (!user) {
        console.log("user doesn't have an embedded wallet, creating one now");
        const deviceWallet = ethers.Wallet.createRandom();
        localStorage.setItem("devicekey", deviceWallet.privateKey);
        deviceKey = deviceWallet.privateKey;
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:144 ~ deviceKey:",
          deviceKey,
        );
      }

      // This should ALWAYS return a wallet, since we just created one if it didn't exist
      const localWallet = await getUserEmbeddedWallet(pin, deviceKey || "");
      console.log("fetched user wallet", localWallet);
      window.localStorage.setItem("pin", pin);
      setWallet(localWallet);
      setSession(sessionData);
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };

  const emailPassSubmit: SubmitHandler<VerifyEmailPasswordFormProps> = async (
    formData,
  ) => {
    try {
      console.log("Signing in with email and pass", formData);

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error && !(error instanceof AuthApiError)) {
        console.log("error on signInWithPassword", error);
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
          return;
        } else if (!signupData.user) {
          setAdditionalError("No user found after signup");
          return;
        }

        console.log("user signed up", signupData);
        console.log("asking the issuer to provide basic credentials");
        await createNewEmbeddedWalletForUser(formData.password, undefined);
        await logUserIntoApp(signupData.session, formData.password);
        const vcs = await credentialStore.requestIssueBasicCredentials({
          jwt: signupData.session?.access_token || "",
        });
        console.log("Issuer issued the following credentials", vcs);
        await logUserIntoApp(signupData.session, formData.password);
        return;
      } else {
        console.log("user with email", formData.email, "found");
        await logUserIntoApp(data.session, formData.password);
      }
    } catch (error: any) {
      console.log("error", error);
      setAdditionalError(error.message);
    }
  };

  return !session
      ? (<div
        id="bg"
        className="fixed inset-0 flex  bg-opacity-40 items-center justify-center z-10 divide-y divide-gray-200 bg-[#b2b2b2]"
      >
        <Card id="modal" className=" p-8  bg-slate-100">
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
                        defaultValue={localStorage.getItem("pin") ?? "password"}
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
            <Accordion type="single" collapsible className="w-full border-none">
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
                    // onClick={connectWallet}
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
            {additionalError && (
              <div className="text-red-500 text-center">{additionalError}</div>
            )}
          </div>
        </Card>
      </div>
  ) : <>{children}</>
};
