import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useWallet } from "~/context/WalletContext";
import EmbeddedWalletModal, { truncateAddress } from "./WalletModal";
//@ts-ignore
import Identicon from "react-identicons";
import { RequireUserLoggedIn } from "./RequireUserLoggedIn";
import { useHydrated } from "./InternalIframeDemo";
interface INavbar {}

const Navbar: React.FC<INavbar> = ({}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    address,
    wallet,
    isSignedIn,
    isConnectionModal,
    connectWallet,
    setIsConnectionModal,
  } = useWallet();
  console.log("🚀 ~ file: Navbar.tsx:12 ~ isSignedIn:", isSignedIn);
  const truncatedAddress = isSignedIn ? truncateAddress(wallet?.address!) : "";
  return (
    <nav className="flex w-screen items-center justify-between p-4 bg-fuchsia-200/50">
      <h5 className="tracking-tighter text-xl">Embedded Wallet Demo</h5>
      {isSignedIn ? (
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          variant="outline"
          className="tracking-wider text-base font-semibold   flex gap-2"
        >
          {<Identicon string={truncatedAddress} size={24} />}
          {truncateAddress(wallet?.address!)}
        </Button>
      ) : (
        <Button
          onClick={() => {
            console.log("isconnection", isConnectionModal);
            setIsConnectionModal(true);
          }}
          variant="outline"
          className="tracking-wider font-semibold   flex gap-2"
        >
          Login
        </Button>
      )}

      {isModalOpen && <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />}
      {isConnectionModal && <RequireUserLoggedIn />}
    </nav>
  );
};
export default Navbar;
