import { FC, useEffect, useState } from "react";
import { dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords } from "../lib/utils.ts";

export const DwnMyJobs: FC = () => {
  const [myresult, setMyresult] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const record =
        await dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();

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
