import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { myDid } from "@/lib/common.ts";
import { dwnReadOtherDWNRecord, selfProfileProtocol } from "./lib/utils";

const UpdateProfile: React.FC = () => {

    const [myRecord, setmyRecord] = useState<any>();
    const [data, setdata] = useState<any>();
    const [newName, setNewName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const {record} = await dwnReadOtherDWNRecord(myDid, selfProfileProtocol);
            setmyRecord(record);
            const data = await record.data.json();
            setdata(data);
            console.log("🚀 ~ file: UpdateProfile.tsx:16 ~ fetchData ~ myRecord:", record)
        };

        if (!myRecord || myRecord === undefined) {
            fetchData();
            console.log("🚀 ~ file: UpdateProfile.tsx:21 ~ useEffect ~ fetchData:", fetchData)
        }
    });

    const updateName = async () => {
        const { status } = await myRecord.update({ name: newName });
        console.log("🚀 ~ file: UpdateProfile.tsx:23 ~ updateName ~ status:", status)
    }

    return <>
        <h2>Hello {data === undefined ? '' : data.name} </h2>

        <Input name="nameInput" defaultValue={data === undefined ? '' : data.name} onChange={(e) => setNewName(e.target.value)} />
        {newName ? (<Button onClick={() => updateName()}>Change Name</Button>) : (<> </>)}

    </>
};

export default UpdateProfile;