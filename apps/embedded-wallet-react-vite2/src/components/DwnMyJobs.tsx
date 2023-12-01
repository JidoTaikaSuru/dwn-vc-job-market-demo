import {FC,useEffect, useState} from "react";
import {dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords} from "./lib/utils";

export const DwnMyJobs: FC = () => {
    const [myresult, setMyresult] = useState();
    useEffect(() => {
        const fetchData =async() => {
        const result = await dwnQuerySelfForAnyRecordsWrittenByOthersAndAreInReplyToOneOfMyRecords();


        console.log("🚀 ~ file: DwnMyJobs.tsx:13 ~ fetchData ~ myRecord:", result)        
    };

        fetchData();
    }, []);
    return <>
    
    </>
};