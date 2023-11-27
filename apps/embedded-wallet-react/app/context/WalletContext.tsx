import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Wallet, ethers } from "ethers";

export type WalletContextValue = {
  address: string | undefined;
  setLocalAccount: (val: string) => void;
  isSignedIn: boolean;
  setIsSignedIn: (val: boolean) => void;
  isConnectionModal: boolean;
  setIsConnectionModal: (val: boolean) => void;
  connectWallet: () => void;
  wallet: Wallet | null | ethers.JsonRpcSigner;
  setWallet: (val: Wallet | null | ethers.JsonRpcSigner) => void;
};

export const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  setLocalAccount: () => {},
  isSignedIn: false,
  isConnectionModal: false,
  setIsSignedIn: () => {},
  setIsConnectionModal: () => {},
  connectWallet: () => {},
  setWallet: () => {},
  wallet: null,
});

export const WalletProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [localAccount, setLocalAccount] = useState("");
  const [isConnectionModal, setIsConnectionModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  console.log("🚀 ~ file: WalletContext.tsx:48 ~ localAccount:", localAccount);
  const [wallet, setWallet] = useState<Wallet | null | ethers.JsonRpcSigner>(
    null
  );

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
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

  // useEffect(() => {
  //   if (localAccount !== "") {
  //     const localWallet = new Wallet(localAccount);
  //     setWallet(localWallet);
  //   }
  // }, [localAccount]);

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

  const connectWallet = async () => {
    const accounts = await provider!.send("eth_requestAccounts", []);
    const signer = await provider?.getSigner();
    console.log(
      "🚀 ~ file: WalletModal.tsx:47 ~ getBalance ~ accounts:",
      accounts,
      wallet
    );
    if (wallet) {
      setAddress(wallet?.address);
      setIsSignedIn(true);
      setIsConnectionModal(false);
    } else {
      setIsSignedIn(true);
      setAddress(accounts[0]);
      setIsConnectionModal(false);
      setWallet(signer!);
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
      wallet,
      setWallet,
      connectWallet,
      isConnectionModal,
      setIsConnectionModal,
    }),
    [address, localAccount, isSignedIn, wallet, isConnectionModal]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
