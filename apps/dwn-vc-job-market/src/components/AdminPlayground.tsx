import { FC, useState } from "react";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";
import {
  didCreate,
  getAllDWNnames,
  initMyTestingData,
  spamEveryDWNwithAJobApplication,
} from "@/lib/setupDwn.ts";
import { TypographyH1, TypographyH2 } from "@/components/Typography.tsx";
import { Button } from "@/components/ui/button.tsx";
import JSONPretty from "react-json-pretty";
import { RequestReissueButton } from "@/components/RequestReissueButton.tsx";

export const AdminPlayground: FC = () => {
  const web5Connection = useRecoilValue(web5ConnectSelector);
  const { web5Client } = web5Connection;
  const [lastOutput, setLastOutput] = useState<any>();

  const [recordId, setRecordId] = useState<string>("");

  return (
    <div className={"flex flex-col space-y-2"}>
      <TypographyH1>Admin Playground</TypographyH1>
      <TypographyH2>DID</TypographyH2>
      <Button
        onClick={async () => {
          await didCreate(web5Client);
        }}
      >
        didCreate (for self)
      </Button>
      <TypographyH2>DWN</TypographyH2>
      <Button
        onClick={async () => {
          await web5Client.dwnCreateJobPostAgainstCompany({
            company: "The Test Company",
            title: "test job post",
            description: "test job post description",
            created_at: new Date().toISOString(),
          });
        }}
      >
        dwnCreateJobPostAgainstCompany
      </Button>
      <Button
        onClick={async () => {
          const namdata = await web5Client.dwnReadSelfProfile();
          console.log(namdata);
        }}
      >
        dwnReadSelfReturnRecordAndData
      </Button>
      <Button
        onClick={async () => {
          const ll = await web5Client.dwnQuerySelfJApplicationsFromOthers();
          setLastOutput(ll);
        }}
      >
        dwnQuerySelfJApplicationsFromOthers
      </Button>
      <Button
        onClick={async () => {
          const ll =
            await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthers();
          setLastOutput(ll);
        }}
      >
        dwnQuerySelfForAnyRecordsWrittenByOthers
      </Button>
      <Button
        onClick={async () => {
          const ll = await getAllDWNnames(web5Client);
          setLastOutput(ll);
        }}
      >
        getAllDWNnames
      </Button>

      <TypographyH2>Credentials</TypographyH2>
      <RequestReissueButton />
      <TypographyH2>Danger Zone</TypographyH2>
      <Button
        onClick={async () => {
          await initMyTestingData(web5Client);
        }}
      >
        initMyTestingData
      </Button>

      <Button
        onClick={async () => {
          await spamEveryDWNwithAJobApplication(web5Client);
        }}
      >
        spamEveryDWNwithAJobApplication
      </Button>

      <TypographyH2>Last command output</TypographyH2>
      <JSONPretty data={lastOutput} />
    </div>
  );
};
