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
  const { session, setSession, wallet } = useContext(SessionContext);
  const [startLogout, setStartLogout] = useState(false);
  const [strgPercent, setStrgPercent] = useState(0);



  const storage_capacity = 10485758; //10MB is the known defualt limit for Chrome and firefox, safari mobile in some cases will give only 5MB 
  let data_used   = 0;
  let last_usage  = 0; 
  let last_max_storage_usage = 0; 
  let max_storage_usage = 0; 
  let last_storage_add_diff = 0; 
  let callcounter = 0;


  function printStorageUsage(newused:number) {
      callcounter++
      if(newused){
          last_usage = data_used;
          data_used =newused

          const cur_diff =  last_usage-data_used;
          const percentused = Math.round(100*data_used/storage_capacity);
          if(callcounter%100===0)
            console.info(`Storage usage: ${data_used} bytes, ${percentused}%  change ${cur_diff/(1024*1024)}`)
          setStrgPercent(percentused)
          if( data_used > max_storage_usage || max_storage_usage===0  ){
              last_max_storage_usage= max_storage_usage; 
              max_storage_usage=data_used;
              last_storage_add_diff = max_storage_usage-last_max_storage_usage; 
              if(callcounter%100===0)
               console.info(`## Storage usage: ${data_used} bytes, ${percentused}% added ${last_storage_add_diff/(1024*1024)}`)
          }
        // if(data_used && last_usage!==0&&callcounter%1===0)
          //console.info(`Storage usage: ${data_used} bytes, ${percentused}% added${last_storage_add_diff/1024/1024}`)
      }

    }



  
    setTimeout(() => {  navigator.storage.estimate().then(u=> printStorageUsage(u.usageDetails.indexedDB)) }, 2000)





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
          
         { strgPercent>0 ? `Local DWN Storage `+strgPercent+`%`: "" }
          {wallet && (
            <Button
              variant="outline"
              className="tracking-wider text-base font-semibold flex gap-2"
            >
              {<Identicon string={wallet.address} size={24} />}
              {truncateAddress(wallet.address)}
            </Button>
          )}
          {session && (
            <Button
              onClick={() => {
                setStartLogout(true);
              }}
              variant="outline"
              className="tracking-wider font-semibold flex gap-2"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
