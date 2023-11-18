import type { FC } from "react";
import { createContext, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Frame from "react-frame-component";
import { InternalEmbeddedWalletDemo } from "~/components/InternalEmbeddedWalletDemo";
import { createClient } from "@supabase/supabase-js";
import type { Wallet as WalletType } from "ethers";
import { Wallet } from "ethers";
import { convertStringToCryptoKey } from "~/lib/cryptoLib";

type DeviceKeyContextProps = {
  devicePrivateKey: CryptoKey;
  setDevicePrivateKey: (privateKey: CryptoKey) => void;
  devicePrivateKeyStr: string;
  devicePublicKey: string;
  setDevicePublicKey: (publicKey: string) => void;
  wallet: WalletType;
  setWallet: (wallet: WalletType) => void;
};

export const DeviceKeyContext = createContext<DeviceKeyContextProps>({
  devicePrivateKey: new CryptoKey(),
  setDevicePrivateKey: () => {},
  devicePrivateKeyStr: "",
  devicePublicKey: "",
  setDevicePublicKey: () => {},
  wallet: new Wallet(""),
  setWallet: () => {},
});

export const supabaseClient = createClient(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0"
);

export const InternalIframeDemo: FC = () => {
  const [devicePrivateKey, setDevicePrivateKey] = useState(new CryptoKey());
  const [devicePrivateKeyStr, setDevicePrivateKeyStr] = useState("");
  const [devicePublicKey, setDevicePublicKey] = useState("");
  const [wallet, setWallet] = useState<WalletType>(new Wallet(""));

  // Listen for changes to localStorage, and update state accordingly
  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      console.log("storage event", event);
      if (event.key === "deviceprivatekey") {
        const strPrivateKey = localStorage.getItem("deviceprivatekey");
        if (strPrivateKey) {
          console.log(
            "deviceprivatekey found in localstorage after change",
            strPrivateKey
          ); //TODO, don't log me later
          const cryptoPrivateKey = await convertStringToCryptoKey(
            strPrivateKey
          );
          setDevicePrivateKey(cryptoPrivateKey);
          setDevicePrivateKeyStr(strPrivateKey);
          setWallet(new Wallet(strPrivateKey));
        } else {
          console.log(
            "deviceprivatekey not found in localstorage after change"
          );
        }
      } else if (event.key === "devicepublickey") {
        const strPublicKey = localStorage.getItem("deviceprivatekey");
        if (strPublicKey) {
          console.log(
            "devicepublickey found in localstorage after change",
            strPublicKey
          ); //TODO, don't log me later
          setDevicePublicKey(strPublicKey);
        } else {
          console.log("devicepublickey not found in localstorage after change");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Box>
      <Typography>Parent container</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 800,
          maxHeight: 800,
          border: "1px solid black",
        }}
      >
        <Frame>
          <DeviceKeyContext.Provider
            value={{
              devicePrivateKey,
              devicePublicKey,
              devicePrivateKeyStr,
              setDevicePrivateKey,
              setDevicePublicKey,
              wallet,
              setWallet,
            }}
          >
            <InternalEmbeddedWalletDemo />
          </DeviceKeyContext.Provider>
        </Frame>
        <div style={{ display: "flex" }}></div>
      </Box>
    </Box>
  );
};
