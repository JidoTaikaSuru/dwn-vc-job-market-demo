import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { dwnReadSelfReturnRecordAndData, selfProfileProtocol } from "./lib/utils";

const UpdateProfile: React.FC = () => {

    const [myRecord, setmyRecord] = useState<any>();
    const [data, setdata] = useState<any>();
    const [newName, setNewName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            
            const {record, data, id} = await dwnReadSelfReturnRecordAndData(selfProfileProtocol);
            if(record)            
            setmyRecord(record);
            setdata(data);
            console.log("🚀 ~ file: UpdateProfile.tsx:16 ~ fetchData ~ myRecord:", record)
        };

fetchData();
            console.log("🚀 ~ file: UpdateProfile.tsx:21 ~ useEffect ~ fetchData:", fetchData)
        
    }, []);

    const updateName = async () => {
        data.name = newName;
        const { status } = await myRecord.update({data});
        console.log("🚀 ~ file: UpdateProfile.tsx:23 ~ updateName ~ status:", status)
    }

    return <> {data === undefined ? (<h2>Loading... </h2>) :
        (<>
            <h2>Hello {data.name}</h2>
            <Input name="nameInput" defaultValue={data.name} onChange={(e) => setNewName(e.target.value)} />
         </>
         )} 
        
        {newName ? (<Button onClick={() => updateName()}>Change Name</Button>) : (<> </>)}

    </>
};

export default UpdateProfile;