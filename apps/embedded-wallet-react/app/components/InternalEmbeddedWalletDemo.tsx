import { useContext, useEffect, useState } from "react";
import { DeviceKeyContext } from "~/components/RequireUserLoggedIn";
import { TextareaAutosize, Typography } from "@mui/material";
import { JsonRpcProvider, JsonRpcSigner, verifyMessage } from "ethers";
import { Button } from "../../@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "~/context/WalletContext";
import { useDebounce } from "react-use";
export const InternalEmbeddedWalletDemo = () => {
  // const { wallet } = useContext(DeviceKeyContext);
  // console.log(
  //   "🚀 ~ file: InternalEmbeddedWalletDemo.tsx:13 ~ InternalEmbeddedWalletDemo ~ wallet:",
  //   wallet
  // );
  //  const {address} = useWallet()
  const [messageToSign, setMessageToSign] = useState("");
  const [messageVerified, setMessageVerified] = useState(false);
  const [messageSignature, setMessageSignature] = useState("");
  const [recievedMessage, setRecievedMessage] = useState("");
  const [debouncedMessage, setDebouncedMessage] = useState("");

  useDebounce(() => setDebouncedMessage(messageToSign), 1500, [messageToSign]);

  const { address, wallet } = useWallet();
  console.log("account", wallet);
  useEffect(() => {
    if (!wallet?.address) {
      console.log("No wallet found");
      return;
    }

    window.parent.postMessage(address, "http://localhost:3000");

    const fetchData = async () => {
      let messageSignature: string;
      console.log("walletttt", typeof wallet, debouncedMessage);
      if (wallet instanceof JsonRpcSigner) {
        messageSignature = await wallet.signMessage(debouncedMessage);
      } else {
        messageSignature = await wallet.signMessage(messageToSign);
      }
      setMessageSignature(messageSignature);
      const recoveredAddress = verifyMessage(messageToSign, messageSignature);
      setMessageVerified(recoveredAddress === wallet!.address);
    };

    fetchData();
  }, [debouncedMessage, wallet]);
  if (!wallet!.address) {
    return <div>Wallet not initialized</div>;
  }

  return (
    <Card className="flex flex-col w-[464px]  items-center gap-6  p-6">
      {/*  LIST OF CREDENTIALS ISSUED TO USER */}
      {/*  TRUST SCORE APPEARS HERE */}
      <h3 className="text-2xl font-semibold tracking-tighter">
        Signing message with embedded wallet
      </h3>
      <div className="flex flex-col gap-2 mx-6">
        <p className="tracking-tight">
          Signed in with wallet address:{" "}
          <span className="font-bold">{wallet?.address}</span>{" "}
        </p>
      </div>
      {/* <TextareaAutosize
        aria-label="Message to sign"
        minRows={3}
        placeholder="Message to sign"
        value={messageToSign}
        onChange={(e) => setMessageToSign(e.target.value)}
      /> */}

      <div className="flex flex-col gap-2.5 text-end items-center space-y-1 w-full">
        {/* <Label htmlFor="message" className="text-lg">
          Message
        </Label> */}
        <textarea
          className="flex  w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
          rows={4}
          id="message"
          placeholder="Message to sign"
          value={messageToSign}
          onChange={(e) => setMessageToSign(e.target.value)}
        />
      </div>
      <p className="tracking-tight">Message signature:</p>
      <CardContent className="w-2/3 py-4 bg-slate-400 text-slate-100 rounded-lg break-words ">
        {messageSignature}
      </CardContent>
      {/* <div className="flex gap-2 items-center justify-center "> */}
      {/* <p className="mb-0.5">Message verified:</p> */}
      <Badge variant={"outline"}>
        Message verified: {messageVerified ? "true" : "false"}
      </Badge>
      {/* </div> */}
    </Card>
  );
};
