import { useContext, useEffect, useState } from "react";
import { DeviceKeyContext } from "~/components/RequireUserLoggedIn";
import { TextareaAutosize, Typography } from "@mui/material";
import { verifyMessage } from "ethers";

export const InternalEmbeddedWalletDemo = () => {
  const { wallet } = useContext(DeviceKeyContext);
  const [messageToSign, setMessageToSign] = useState("");
  const [messageVerified, setMessageVerified] = useState(false);
  const [messageSignature, setMessageSignature] = useState("");

  useEffect(() => {
    if (!wallet) {
      console.log("No wallet found");
      return;
    }
    const fetchData = async () => {
      const messageSignature = await wallet.signMessage(messageToSign);
      setMessageSignature(messageSignature);
      const recoveredAddress = verifyMessage(messageToSign, messageSignature);
      setMessageVerified(recoveredAddress === wallet.address);
    };

    fetchData();
  }, [messageToSign, wallet]);

  if (!wallet) {
    return <div>Wallet not initialized</div>;
  }

  return (
    <div>
      {/*  LIST OF CREDENTIALS ISSUED TO USER */}
      {/*  TRUST SCORE APPEARS HERE */}
      <Typography>Signed in with wallet address: {wallet?.address}</Typography>
      <Typography>Signing message with embedded wallet</Typography>
      <TextareaAutosize
        aria-label="Message to sign"
        minRows={3}
        placeholder="Message to sign"
        value={messageToSign}
        onChange={(e) => setMessageToSign(e.target.value)}
      />
      <Typography>Message signature:</Typography>
      <Typography>{messageSignature}</Typography>
      <Typography>
        Message verified: {messageVerified ? "true" : "false"}
      </Typography>
    </div>
  );
};
