import type { FC, PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';
import { Wallet } from 'ethers';
import { Session } from '@supabase/supabase-js';
import { credentialStore, supabaseClient } from '@/lib/common.ts';
import { IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';
import { convertVeramoVcToPexFormat } from '@/lib/credentialLib.ts';
import { getUserEmbeddedWallet } from '@/lib/embeddedWalletLib.ts';
import { SSITypesBuilder } from '@sphereon/pex/dist/main/lib/types';

type SessionContextProps = {
  session?: Session;
  setSession: (val?: Session) => void; //Session can be set on signin, or on signup
  wallet?: Wallet;
  setWallet: (val: Wallet) => void; //Set in routes/login
  credentials: IVerifiableCredential[];
  pexWrappedCredentials: WrappedVerifiableCredential[];
};

export const SessionContext = createContext<SessionContextProps>({
  session: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSession: () => {},
  wallet: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWallet: () => {},
  credentials: [],
  pexWrappedCredentials: [],
});

export const SessionContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session>();
  const [wallet, setWallet] = useState<Wallet>();
  const [credentials, setCredentials] = useState<IVerifiableCredential[]>([]);
  const [pexWrappedCredentials, setPexWrappedCredentials] = useState<
    WrappedVerifiableCredential[]
  >([]);
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

        const credentials = await credentialStore.getCredentials({
          jwt: sessionData?.access_token || "",
        });
        const compliantCredentials = convertVeramoVcToPexFormat(credentials);
        setCredentials(compliantCredentials);

        const verifiableCredentialCopy = JSON.parse(
          JSON.stringify(credentials),
        );
        const pexWrappedCredentials =
          SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(
            verifiableCredentialCopy,
          );
        setPexWrappedCredentials(pexWrappedCredentials);
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
        pexWrappedCredentials,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
