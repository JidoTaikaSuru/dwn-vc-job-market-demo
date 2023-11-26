import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useWallet } from "~/context/WalletContext";
import EmbeddedWalletModal, { truncateAddress } from "./WalletModal";
//@ts-ignore
import Identicon from "react-identicons";
interface INavbar {}

const Navbar: React.FC<INavbar> = ({}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isSignedIn } = useWallet();
  console.log("🚀 ~ file: Navbar.tsx:12 ~ isSignedIn:", isSignedIn);
  const truncatedAddress = isSignedIn ? truncateAddress(address!) : "";
  return (
    <nav className="flex w-screen items-center justify-between p-4 bg-fuchsia-200/50">
      <h5 className="tracking-tighter text-xl">Embedded Wallet Demo</h5>
      {isSignedIn ? (
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          variant="outline"
          className="tracking-wider font-semibold   flex gap-2"
        >
          {<Identicon string={truncatedAddress} size={24} />}
          {truncateAddress(address!)}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          variant="outline"
          className="tracking-wider font-semibold   flex gap-2"
        >
          Login
        </Button>
      )}

      {isModalOpen && <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />}
    </nav>
  );
};
export default Navbar;
