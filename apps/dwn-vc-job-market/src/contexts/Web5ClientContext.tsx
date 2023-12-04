import type { FC, PropsWithChildren } from "react";
import { createContext } from "react";
import { DwnClient } from "@/lib/web5Client.ts";
import { ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";

type WebContextProps = {
  myDid: string;
  web5Client: DwnClient;
  protocols: { [key: string]: ProtocolDefinition };
};

export const Web5Context = createContext<WebContextProps>({
  myDid: "",
  web5Client: {} as DwnClient,
  protocols: {} as { [key: string]: ProtocolDefinition },
});

export const Web5ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  // set this in context becase web5ConnectSelector loads protocols and the console logs are annoying
  const { web5Client, protocols, myDid } = useRecoilValue(web5ConnectSelector);

  return (
    <Web5Context.Provider
      value={{
        web5Client,
        protocols,
        myDid,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};
