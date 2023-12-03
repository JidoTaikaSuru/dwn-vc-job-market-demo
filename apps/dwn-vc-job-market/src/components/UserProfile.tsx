import React, { FC, useContext, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  dwnQueryOtherDWNByProtocolSelector,
  dwnQueryOtherDwnForJsonDataSelector,
  dwnReadOtherDWNSelector,
  dwnReadSelfReturnRecordAndDataSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";
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
import { useParams } from "react-router-dom";
import {protocols} from "@/lib/protocols.ts";

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num / 2) + "...." + str.slice(str.length - num / 2);
}

export const UserProfile: FC = () => {
  const { userDid } = useParams();
  const { myDid } = useRecoilValue(web5ConnectSelector);
  const [showRaw, setShowRaw] = useState(false);
  const { wallet, credentials } = useContext(SessionContext);
  const { toast } = useToast();

  const targetDid = userDid || myDid;

  const profile = useRecoilValue(dwnReadSelfReturnRecordAndDataSelector);

  const profileJobApplicationSimpleProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: myDid,
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  const profileCvPersonalStorageProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: myDid,
      protocol: protocols["cvPersonalStorageProtocol"],
    }),
  );
  const profileSelfProfileProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: myDid,
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const profileJobPostThatCanTakeApplicationsAsReplyProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: myDid,
      protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
    }),
  );

  const profileReadJobApplicationSimpleProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: myDid,
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  const profileReadCvPersonalStorageProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: myDid,
      protocol: protocols["cvPersonalStorageProtocol"],
    }),
  );
  const profileReadSelfProfileProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: myDid,
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const profileReadJobPostThatCanTakeApplicationsAsReplyProtocol =
    useRecoilValue(
      dwnReadOtherDWNSelector({
        did: myDid,
        protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
      }),
    );

  const allJsonData = useRecoilValue(
    dwnQueryOtherDwnForJsonDataSelector({ did: targetDid }),
  );

  console.log(
    "profileReadJobApplicationSimpleProtocol",
    profileReadJobApplicationSimpleProtocol,
  );

  // TODO Find a less blinding theme for react-json-pretty
  return (
    <div className={"space-y-2"}>
      <TypographyH1>Profile</TypographyH1>
      <Identicon string={wallet?.address} size={80} />
      <div className={"flex items-center"}>
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
      <div className={"flex items-center break-all"}>
        <p>{truncateString(myDid, 32)}</p>
        <CopyToClipboard
          text={myDid || ""}
          onCopy={() => {
            console.log("Copied wallet address to clipboard");
            toast({ description: "Copied did to clipboard" });
          }}
        >
          <FaRegCopy />
        </CopyToClipboard>
      </div>
      <Button variant={"secondary"} onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? "HIDE" : "SHOW"} RAW DATA
      </Button>
      {showRaw && (
        <>
          <TypographyH4>Profile data</TypographyH4>
          <JSONPretty data={profile} />
          <TypographyH4>Job Application Simple Protocol</TypographyH4>
          <JSONPretty data={profileJobApplicationSimpleProtocol} />
          <TypographyH4>CV Personal Storage Protocol</TypographyH4>
          <JSONPretty data={profileCvPersonalStorageProtocol} />
          <TypographyH4>Self Profile Protocol</TypographyH4>
          <JSONPretty data={profileSelfProfileProtocol} />
          <TypographyH4>
            Job Post That Can Take Applications As Reply Protocol
          </TypographyH4>
          <JSONPretty
            data={profileJobPostThatCanTakeApplicationsAsReplyProtocol}
          />
          <TypographyH4>Job Application Simple Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadJobApplicationSimpleProtocol || {}} />
          <TypographyH4>CV Personal Storage Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadCvPersonalStorageProtocol || {}} />
          <TypographyH4>Self Profile Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadSelfProfileProtocol} />
          <TypographyH4>
            Job Post That Can Take Applications As Reply Protocol (Read)
          </TypographyH4>
          <JSONPretty
            data={profileReadJobPostThatCanTakeApplicationsAsReplyProtocol}
          />
          <TypographyH4>All JSON Data</TypographyH4>
          <JSONPretty data={allJsonData} />
        </>
      )}
    </div>
  );
};
