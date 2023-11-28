import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";
import { SessionContext } from "~/context/SessionContext";
import { redirect } from "@remix-run/node";
import { truncateAddress } from "~/lib/embeddedWalletLib";

const Navbar: React.FC = () => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const { address, isSignedIn, isConnectionModal, setIsConnectionModal } =
  //   useWallet();

  const { session, wallet } = useContext(SessionContext);

  console.log("navBarsession", session);

  return (
    <nav className="flex w-screen items-center justify-between p-4 bg-fuchsia-200/50">
      <h5 className="tracking-tighter text-xl">Embedded Wallet Demo</h5>
      {wallet && (
        <Button
          // onClick={() => {
          //   setIsModalOpen(true);
          // }}
          variant="outline"
          className="tracking-wider text-base font-semibold flex gap-2"
        >
          {<Identicon string={truncateAddress(wallet.address)} size={24} />}
          {truncateAddress(wallet.address)}
        </Button>
      )}
      {session ? (
        <Button
          variant="outline"
          className="tracking-wider font-semibold flex gap-2"
        >
          Logout
        </Button>
      ) : (
        <Button
          onClick={() => {
            redirect("/login");
          }}
          variant="outline"
          className="tracking-wider font-semibold flex gap-2"
        >
          Login
        </Button>
      )}

      {/*{isModalOpen && <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />}*/}
      {/*{isConnectionModal && <RequireUserLoggedIn />}*/}
    </nav>
  );
};
export default Navbar;
