import { FC, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { web5ConnectSelector } from "@/lib/web5Recoil.ts";

export const DwnMyJobs: FC = () => {
  const [myresult, setMyresult] = useState();
  const { web5Client } = useRecoilValue(web5ConnectSelector);
  useEffect(() => {
    const fetchData = async () => {
      const record =
        await web5Client.dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();

      console.log(
        "🚀 ~ file: DwnMyJobs.tsx:13 ~ fetchData ~ myRecord:",
        record,
      );
    };

    // TODO fetch all applications made against the COMPANY

    // TODO For each job listed by the company, list all applications for that job
    fetchData();
  }, []);
  return <>record.data</>;

  //Put the
};
