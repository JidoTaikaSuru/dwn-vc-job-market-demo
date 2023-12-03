import { FC, useState } from "react";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";
import {
  didCreate,
  getAllDWNnames,
  initMyTestingData,
  spamEveryDWNwithAJobApplication,
} from "@/lib/setupDwn.ts";
import { TypographyH2 } from "@/components/Typography.tsx";
import { Button } from "@/components/ui/button.tsx";
import JSONPretty from "react-json-pretty";

export const SetupDwn: FC = () => {
  const web5Connection = useRecoilValue(web5ConnectSelector);
  const { web5Client } = web5Connection;
  const [lastOutput, setLastOutput] = useState<any>();

  const [recordId, setRecordId] = useState<string>("");

  return (
    <div className={"flex flex-col space-y-2"}>
      <h1>Lookup</h1>

      <h1>Setup Dwn</h1>
      <Button
        onClick={async () => {
          await didCreate(web5Client);
        }}
      >
        didCreate (for self)
      </Button>
      <Button
        onClick={async () => {
          await web5Client.dwnCreateJobPostAgainstCompany({
            name: "test job post",
            description: "test job post description",
          });
        }}
      >
        dwnCreateJobPostAgainstCompany
      </Button>
      <Button
        onClick={async () => {
          const namdata = await web5Client.dwnReadSelfReturnRecordAndData();
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

      <Button
        onClick={async () => {
          const ll =
            await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();
          console.log(ll);
        }}
      >
        dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords
      </Button>

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