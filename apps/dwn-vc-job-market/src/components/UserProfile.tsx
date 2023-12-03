import React, { FC, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";
import { TypographyH1, TypographyH4 } from "@/components/Typography.tsx";
import { Button } from "@/components/ui/button.tsx";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";
import { SessionContext } from "@/contexts/SessionContext.tsx";
import { FaRegCopy } from "react-icons/fa";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";
import { useToast } from "@/components/ui/use-toast.ts";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const UserProfile: FC = () => {
  const { web5Client } = useRecoilValue(web5ConnectSelector);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);
  const { wallet, credentials } = useContext(SessionContext);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const profile = await web5Client?.dwnReadSelfReturnRecordAndData();
      setMyProfile(profile);
    };

    fetchData();
  }, []);

  // TODO Find a less blinding theme for react-json-pretty
  return (
    <div>
      <TypographyH1>Profile</TypographyH1>
      <Identicon string={wallet?.address} size={80} />
      <div className={"flex text"}>
        <p>{wallet?.address}</p>

        <CopyToClipboard
          text={wallet?.address || ""}
          onCopy={() => {
            console.log("Copied wallet address to clipboard");
            toast({ description: "Copied wallet address to clipboard" });
          }}
        >
          <FaRegCopy />
        </CopyToClipboard>
      </div>
      <Button variant={"secondary"} onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? "HIDE" : "SHOW"} RAW DATA
      </Button>
      {showRaw && [
        <TypographyH4>Profile data</TypographyH4>,
        <JSONPretty data={myProfile} />,
      ]}
    </div>
  );
};
