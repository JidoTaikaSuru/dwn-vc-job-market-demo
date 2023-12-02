import {FC,useEffect, useState} from "react";
import {dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords} from "./lib/utils";

export const DwnMyJobs: FC = () => {
    const [myresult, setMyresult] = useState();
    useEffect(() => {
        const fetchData =async() => {
        const record = await dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();


        console.log("🚀 ~ file: DwnMyJobs.tsx:13 ~ fetchData ~ myRecord:", record)        
    };

        fetchData();
    }, []);
    return <>
    record.data
    </>
};