import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useWallet } from "~/context/WalletContext";
import EmbeddedWalletModal, { truncateAddress } from "./WalletModal";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";

const Navbar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isSignedIn } = useWallet();
  const truncatedAddress = isSignedIn && address ? truncateAddress(address) : "";
  return (
    <nav className="flex w-screen items-center justify-between p-4 bg-fuchsia-200/50">
      <h5 className="tracking-tighter text-xl">Embedded Wallet Demo</h5>
      {isSignedIn ? (
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          variant="outline"
          className="tracking-wider font-semibold flex gap-2"
        >
          {<Identicon string={truncatedAddress} size={24} />}
          {address && truncateAddress(address)}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
          variant="outline"
          className="tracking-wider font-semibold flex gap-2"
        >
          Login
        </Button>
      )}

      {isModalOpen && <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />}
    </nav>
  );
};
export default Navbar;
