import { FC } from "react";
import { DemoWalletIframe } from "../../../packages/(IGNORE)embedded-wallet";

export const WalletIframe: FC = () => {
  return (
    <iframe style={{ height: 500, width: 500, border: "1px solid black" }}>
      <div>WalletIframe</div>
      hiheueiei
      <DemoWalletIframe />
    </iframe>
  );
};
