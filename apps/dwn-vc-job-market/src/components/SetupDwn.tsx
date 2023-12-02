import { FC, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";
import {
  getAllDWNnames,
  initMyTestingData,
  spamEveryDWNwithAJobApplication,
} from "@/lib/setupDwn.ts";
import { TypographyH2 } from "@/components/Typography.tsx";

export const SetupDwn: FC = () => {
  const web5Connection = useRecoilValue(web5ConnectSelector);
  const { web5Client } = web5Connection;
  const [dwnReadSelfReturnRecordAndData, setDwnReadSelfReturnRecordAndData] =
    useState<any[]>([]);
  const [
    querySelfJApplicationsFromOthers,
    setQuerySelfJApplicationsFromOthers,
  ] = useState<any[]>([]);
  const [
    dwnQuerySelfForAnyRecordsWrittenByOthers,
    setDwnQuerySelfForAnyRecordsWrittenByOthers,
  ] = useState<any[]>([]);
  const [
    dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords,
    setDwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords,
  ] = useState<any[]>([]);
  useEffect(() => {
    const runSetup = async () => {
      const namdata = await web5Client.dwnReadSelfReturnRecordAndData();
      console.log("🚀 ~ file: common.ts:249 ~ namdata:", namdata);
      await initMyTestingData(web5Client);
      //await dwnQueryJApplicationsForJob();
      const ll = await web5Client.dwnQuerySelfJApplicationsFromOthers();
      setQuerySelfJApplicationsFromOthers(ll);
      const lll = await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthers();
      setDwnQuerySelfForAnyRecordsWrittenByOthers(lll || []);
      const llll =
        await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();
      setDwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords(
        llll || [],
      );
      await getAllDWNnames(web5Client);
      await spamEveryDWNwithAJobApplication(web5Client);
    };
    runSetup();
  }, []);

  return (
    <div>
      <h1>Setup Dwn</h1>
      <TypographyH2>Read Self Return Record and Data</TypographyH2>
      <pre>{JSON.stringify(dwnReadSelfReturnRecordAndData)}</pre>
      <TypographyH2>Query Self JApplications From Others</TypographyH2>
      <pre>{JSON.stringify(querySelfJApplicationsFromOthers, null, 2)}</pre>
      <TypographyH2>
        DWN Query Self For Any Records Written by Others
      </TypographyH2>
      <pre>
        {JSON.stringify(dwnQuerySelfForAnyRecordsWrittenByOthers, null, 2)}
      </pre>
      <TypographyH2>
        DWN Query Self For Any Records Written by Others And Are In Reply To One
        Of My Records
      </TypographyH2>
      <pre>
        {JSON.stringify(
          dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords,
          null,
          2,
        )}
      </pre>
    </div>
  );
};
