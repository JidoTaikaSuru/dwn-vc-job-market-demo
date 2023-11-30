import type { FC, PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import { Wallet } from "ethers";
import { Session } from "@supabase/supabase-js";
import { credentialStore, supabaseClient } from "@/lib/common.ts";
import { IVerifiableCredential } from "@sphereon/ssi-types";
import { convertVeramoVcToPexFormat } from "@/lib/credentialLib.ts";
import { getUserEmbeddedWallet } from "@/lib/embeddedWalletLib.ts";

type SessionContextProps = {
  session?: Session;
  setSession: (val?: Session) => void; //Session can be set on signin, or on signup
  wallet?: Wallet;
  setWallet: (val: Wallet) => void; //Set in routes/login
  credentials: IVerifiableCredential[];
};

export const SessionContext = createContext<SessionContextProps>({
  session: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSession: () => {},
  wallet: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWallet: () => {},
  credentials: [],
});

export const SessionContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session>();
  const [wallet, setWallet] = useState<Wallet>();
  const [credentials, setCredentials] = useState<IVerifiableCredential[]>([]);

  // Refresh sessio?n context every 10s, could redirect to login later.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session: sessionData },
          error,
        } = await supabaseClient.auth.getSession();
        if (error) {
          console.error("Error fetching session", error);
          return;
        }
        if (!sessionData) {
          console.error("No session data found");
          return;
        }
        setSession(sessionData);
        // console.log("session", session);
        const fwallet = await getUserEmbeddedWallet(
          localStorage.getItem("pin") || "",
          undefined,
        );
        setWallet(fwallet);

        console.log("Fetching user's credentials");
        const credentials = await credentialStore.getCredentials({
          jwt: sessionData?.access_token || "",
        });
        const compliantCredentials = convertVeramoVcToPexFormat(credentials);
        console.log("compliantCredentials", compliantCredentials);
        setCredentials(compliantCredentials);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        wallet,
        setWallet,
        credentials,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
