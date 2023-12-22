import React, { FC, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
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
import { CredentialToCredentialCard, PresentationExchangeStatus } from '@/components/CredentialCard.tsx';
import { JobRepliesTable } from '@/components/JobRepliesTable.tsx';
import { truncateString } from '@/lib/common';
import { restClient } from '@/lib/client/rest/client.ts';

export const UserProfile: FC = () => {
  const { userDid } = useParams();
  const { session} = useContext(SessionContext);
  const profile = useRecoilValue(restClient.users.getUserSelector(userDid || ""))
  const [showRaw, setShowRaw] = useState(false);
  const { credentials } = useContext(SessionContext);
  const { toast } = useToast();

  console.debug("retrieved user profile:", profile);
  const myId = session?.user.id || "";
  const targetId = userDid || myId;


  // TODO Find a less blinding theme for react-json-pretty
  return (
    <div className={"space-y-4 flex flex-col items-center p-5"}>
      <TypographyH1>{profile?.name || truncateString(profile?.id, 8)}'s Profile</TypographyH1>
      <Identicon string={targetId} size={80} />
        <div className={"flex items-center gap-2"}>
          <p style={{ fontWeight: "Bold" }}>wallet address :</p>
          <p>{profile?.public_key}</p>
          <CopyToClipboard
            text={profile?.public_key || ""}
            onCopy={() => {
              console.log("Copied wallet address to clipboard");
              toast({ description: "Copied wallet address to clipboard" });
            }}
          >
            <FaRegCopy />
          </CopyToClipboard>
        </div>
      <div className={"flex items-center break-all gap-2"}>
        <p style={{ fontWeight: "Bold" }}>did :</p>
        <p>{truncateString(targetId, 32)}</p>
        <CopyToClipboard
          text={targetId || ""}
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
        <p>{profile?.id}</p>
        <CopyToClipboard
          text={targetId || ""}
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
      {/*<CompanyJobListingsTable companyId={myId} concealHeader={true} />*/}
      <TypographyH2>My applications</TypographyH2>
      <JobRepliesTable companyDid={""} applicationRecordId={""} />
      <div style={{ marginTop: 16 }} />
      <TypographyH2>Debug</TypographyH2>
      <Button variant={"secondary"} onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? "HIDE" : "SHOW"} RAW DATA
      </Button>
      {showRaw && (
        <div className="gap-5 p-5" style={{ width: "1000px" }}>
          <TypographyH4>Profile Data</TypographyH4>
          <JSONPretty data={profile} />
          <TypographyH4>Credentials</TypographyH4>
          <JSONPretty data={credentials} />
        </div>
      )}
    </div>
  );
};
