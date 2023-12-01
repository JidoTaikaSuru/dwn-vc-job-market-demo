import { Button } from "@/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";
import { SessionContext } from "@/contexts/SessionContext";
import { truncateAddress } from "@/lib/embeddedWalletLib";
import { supabaseClient } from "@/lib/common.ts";

export const APP_NAME = "Embedded Wallet Demo";
const Navbar: React.FC = () => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const { address, isSignedIn, isConnectionModal, setIsConnectionModal } =
  //   useWallet();

  const { session, setSession, wallet } = useContext(SessionContext);
  const [startLogout, setStartLogout] = useState(false);

  useEffect(() => {
    if (!startLogout) return;
    setStartLogout(false);
    const logout = async () => {
      await supabaseClient.auth.signOut();
      setSession(undefined);
    };

    logout();
  }, [startLogout]);

  return (
    <nav className="sticky top-0 z-50 bg-fuchsia-200/50">
      <div className="flex w-screen items-center justify-between p-4">
        <h5 className="tracking-tighter text-xl">{APP_NAME}</h5>
        <div className="flex items-center gap-4">
          {wallet && (
            <Button
              // onClick={() => {
              //   setIsModalOpen(true);
              // }}
              variant="outline"
              className="tracking-wider text-base font-semibold flex gap-2"
            >
              {<Identicon string={wallet.address} size={24} />}
              {truncateAddress(wallet.address)}
            </Button>
          )}
          {
            session && (
              <Button
                onClick={() => {
                  setStartLogout(true);
                }}
                variant="outline"
                className="tracking-wider font-semibold flex gap-2"
              >
                Logout
              </Button>
            )
            //     : (
            //     <Button
            //         // onClick={() => {
            //         //   redirect("/login");
            //         // }}
            //         variant="outline"
            //         className="tracking-wider font-semibold flex gap-2"
            //     >
            //         Login
            //     </Button>
            // )
          }
        </div>
        {/*{isModalOpen && <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />}*/}
        {/*{isConnectionModal && <RequireUserLoggedIn />}*/}
      </div>
    </nav>
  );
};
export default Navbar;
