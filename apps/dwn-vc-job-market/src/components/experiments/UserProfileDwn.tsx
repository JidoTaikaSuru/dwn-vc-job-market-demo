import React, { FC, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  dwnQueryOtherDWNByProtocolSelector,
  dwnQueryOtherDwnForJsonDataSelector,
  dwnQuerySelfByProtocolSelector,
  dwnReadOtherDWNSelector,
  web5ConnectSelector,
} from '@/lib/web5Recoil.ts';
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4 } from '@/components/Typography.tsx';
import { Button } from '@/components/ui/button.tsx';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { SessionContext } from '@/contexts/SessionContext.tsx';
import { FaRegCopy } from 'react-icons/fa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from 'react-identicons';
import { useToast } from '@/components/ui/use-toast.ts';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useParams } from 'react-router-dom';
import { protocols } from '@/lib/protocols.ts';
import { CredentialToCredentialCard, PresentationExchangeStatus } from '@/components/CredentialCard.tsx';
import { JobRepliesTable } from '@/components/JobRepliesTable.tsx';
import { CompanyJobListingsTable } from '@/components/CompanyJobListings.tsx';
import { truncateString } from '@/lib/common';

export const UserProfileDwn: FC = () => {
  const { userDid } = useParams();
  const { myDid, user } = useRecoilValue(web5ConnectSelector);
  const profile = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: userDid || "",
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  console.log("profile", profile);
  const [showRaw, setShowRaw] = useState(false);
  const { wallet, credentials } = useContext(SessionContext);
  const { toast } = useToast();

  const targetDid = userDid || myDid;

  const profileJobApplicationSimpleProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: targetDid,
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  const profileCvPersonalStorageProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: targetDid,
      protocol: protocols["cvPersonalStorageProtocol"],
    }),
  );
  const profileSelfProfileProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: targetDid,
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const profileJobPostThatCanTakeApplicationsAsReplyProtocol = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: targetDid,
      protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
    }),
  );

  const profileQuerySelfJobApplicationSimpleProtocol = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  const profileQuerySelfCvPersonalStorageProtocol = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["cvPersonalStorageProtocol"],
    }),
  );
  const profileQuerySelfSelfProfileProtocol = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const profileQuerySelfJobPostThatCanTakeApplicationsAsReplyProtocol =
    useRecoilValue(
      dwnQuerySelfByProtocolSelector({
        protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
      }),
    );

  const profileReadJobApplicationSimpleProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: targetDid,
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  const profileReadCvPersonalStorageProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: targetDid,
      protocol: protocols["cvPersonalStorageProtocol"],
    }),
  );
  const profileReadSelfProfileProtocol = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: targetDid,
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const profileReadJobPostThatCanTakeApplicationsAsReplyProtocol =
    useRecoilValue(
      dwnReadOtherDWNSelector({
        did: targetDid,
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
    <div className={"space-y-4 flex flex-col items-center p-5"}>
      <TypographyH1>{profile?.name}'s Profile</TypographyH1>
      <Identicon string={targetDid} size={80} />
      {targetDid === myDid && (
        <div className={"flex items-center gap-2"}>
          <p style={{ fontWeight: "Bold" }}>wallet address :</p>
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
      )}
      <div className={"flex items-center break-all gap-2"}>
        <p style={{ fontWeight: "Bold" }}>did :</p>
        <p>{truncateString(targetDid, 32)}</p>
        <CopyToClipboard
          text={targetDid || ""}
          onCopy={() => {
            console.log("Copied wallet address to clipboard");
            toast({ description: "Copied did to clipboard" });
          }}
        >
          <FaRegCopy />
        </CopyToClipboard>
      </div>
      <div className={"flex items-center break-all gap-2"}>
        <p style={{ fontWeight: "Bold" }}>web2 id :</p>
        <p>{user?.id}</p>
        <CopyToClipboard
          text={targetDid || ""}
          onCopy={() => {
            console.log("Copied web2 id to clipboard");
            toast({ description: "Copied did to clipboard" });
          }}
        >
          <FaRegCopy />
        </CopyToClipboard>
      </div>
      <div style={{ marginTop: 16 }} />
      <TypographyH3>Credentials</TypographyH3>
      <div
        className={"grid grid-cols-3 gap-4"}
        // style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
      >
        {credentials?.map((credential) => (
          <CredentialToCredentialCard
            credential={credential}
            userHasCredential={PresentationExchangeStatus.profileView}
          />
        ))}
      </div>
      <div style={{ marginTop: 16 }} />

      <TypographyH2>My job listings</TypographyH2>
      <CompanyJobListingsTable companyId={myDid} concealHeader={true} />
      <TypographyH2>My applications</TypographyH2>
      <JobRepliesTable companyDid={""} applicationRecordId={""} />
      <div style={{ marginTop: 16 }} />
      <TypographyH2>Debug</TypographyH2>
      <Button variant={"secondary"} onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? "HIDE" : "SHOW"} RAW DATA
      </Button>
      {showRaw && (
        <div className="gap-5 p-5" style={{ width: "1000px" }}>
          <TypographyH2>Query others results</TypographyH2>
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
          <TypographyH3> Read others results</TypographyH3>
          <TypographyH4>Job Application Simple Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadJobApplicationSimpleProtocol || {}} />
          <TypographyH4>CV Personal Storage Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadCvPersonalStorageProtocol || {}} />
          <TypographyH4>Self Profile Protocol (Read)</TypographyH4>
          <JSONPretty data={profileReadSelfProfileProtocol || {}} />
          <TypographyH4>
            Job Post That Can Take Applications As Reply Protocol (Read)
          </TypographyH4>
          <JSONPretty
            data={
              profileReadJobPostThatCanTakeApplicationsAsReplyProtocol || {}
            }
          />

          <TypographyH3>All JSON Data</TypographyH3>
          <JSONPretty data={allJsonData || {}} />

          <TypographyH3>Query self results</TypographyH3>
          <TypographyH4>Job Application Simple Protocol (Self)</TypographyH4>
          <JSONPretty
            data={profileQuerySelfJobApplicationSimpleProtocol || {}}
          />
          <TypographyH4>CV Personal Storage Protocol (Self)</TypographyH4>
          <JSONPretty data={profileQuerySelfCvPersonalStorageProtocol || {}} />
          <TypographyH4>Self Profile Protocol (Self)</TypographyH4>
          <JSONPretty data={profileQuerySelfSelfProfileProtocol || {}} />
          <TypographyH4>
            Job Post That Can Take Applications As Reply Protocol (Self)
          </TypographyH4>
          <JSONPretty
            data={profileQuerySelfJobPostThatCanTakeApplicationsAsReplyProtocol}
          />
        </div>
      )}
    </div>
  );
};
