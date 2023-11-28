import type { FC, PropsWithChildren } from "react";
import {createContext, useEffect, useState} from "react";
import { Wallet } from "ethers";
import { Session } from "@supabase/supabase-js";
import {supabaseClient} from "@/lib/common.ts";

type SessionContextProps = {
  session?: Session;
  setSession: (val?: Session) => void; //Session can be set on signin, or on signup
  wallet?: Wallet;
  setWallet: (val: Wallet) => void; //Set in routes/login
};

export const SessionContext = createContext<SessionContextProps>({
  session: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSession: () => {},
  wallet: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWallet: () => {},
});

export const SessionContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session>();
  const [wallet, setWallet] = useState<Wallet>();

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // const intervalId = setInterval(fetchData, 10000);

    // return () => clearInterval(intervalId);
  }, []);


  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        wallet,
        setWallet,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
