import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Wallet, ethers } from "ethers";

export type WalletContextValue = {
  address: string | undefined;
  setLocalAccount: (val: string) => void;
  isSignedIn: boolean;
  setIsSignedIn: (val: boolean) => void;
  account: Wallet | undefined;
};

export const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  setLocalAccount: () => {},
  isSignedIn: false,
  setIsSignedIn: () => {},
  account: undefined,
});

export const WalletProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [localAccount, setLocalAccount] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const account = localAccount === "" ? undefined : new Wallet(localAccount);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
    const getAddress = async () => {
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log(
        "🚀 ~ file: WalletModal.tsx:47 ~ getBalance ~ accounts:",
        accounts,
        account
      );
      if (account) {
        setAddress(account?.address);
        setIsSignedIn(true);
      } else {
        setIsSignedIn(true);
        setAddress(accounts[0]);
      }
    };
    getAddress();
    console.log("address51", address);
  }, []);

  const changeNetwork = async () => {
    console.log(
      "🚀 ~ file: WalletContext.tsx:57 ~ changeNetwork ~ provider:",
      provider
    );

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x5",
          },
        ],
      });
      window.location.reload();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const checkIfAccountChanged = async () => {
    try {
      const { ethereum } = window;
      ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("Account changed to:", accounts[0]);
        setAddress(accounts[0]);
      });
    } catch (error) {
      console.log(error);
    }
  };
  const checkNetworkChanged = async () => {
    try {
      const { ethereum } = window;
      ethereum.on("chainChanged", (accounts: string[]) => {
        changeNetwork();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const checkDisconnect = async () => {
    try {
      const { ethereum } = window;
      ethereum.on("disconnect", () => {
        setAddress("");
        setIsSignedIn(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfAccountChanged();
    checkNetworkChanged();
    checkDisconnect;
  }, []);

  // memo-ize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      address,
      setLocalAccount,
      setIsSignedIn,
      isSignedIn,
      account,
    }),
    [address, localAccount, isSignedIn, account]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
