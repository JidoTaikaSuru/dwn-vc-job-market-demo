import * as React from "react";
import { FC } from "react";
import { Web5 } from "@web5/api";
import { ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";

type Web5ContextProps = {
  web5: Web5[];
  protocols: ProtocolDefinition[];
};
const Web5Context = React.createContext<Web5 | undefined>();

export const Web5ContextProvider: FC = () => {
  return <div></div>;
};
