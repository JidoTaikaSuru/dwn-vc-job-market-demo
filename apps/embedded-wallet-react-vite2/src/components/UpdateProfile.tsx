import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import {
  dwnReadSelfReturnRecordAndData,
  dwnReadSelfReturnRecordAndDataSelector,
} from "../lib/utils.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { SubmitHandler, useForm } from "react-hook-form";
import type { Record } from "@web5/api";
import { useRecoilValue } from "recoil";

type UpdateForm = {
  name: string;
};
const UpdateProfile: React.FC = () => {
  const [myRecord, setMyRecord] = useState<Record>();
  const [data, setData] = useState<any>();
  const { toast } = useToast();

  const res = useRecoilValue(dwnReadSelfReturnRecordAndDataSelector);
  const {
    register,
    handleSubmit,
    formState: { errors }, //TODO Add this to the form
  } = useForm<UpdateForm>();

  useEffect(() => {
    const fetchData = async () => {
      const rec = await dwnReadSelfReturnRecordAndData();
      if (rec) {
        setMyRecord(rec.record);
        setData(rec.data);
      }

      console.debug("rec", rec);
      console.debug("res", res);
    };

    fetchData();
    console.log(
      "🚀 ~ file: UpdateProfile.tsx:21 ~ useEffect ~ fetchData:",
      fetchData,
    );
  }, []);

  const updateFormSubmit: SubmitHandler<UpdateForm> = async (formData) => {
    if (!myRecord) {
      toast({
        title: "Error",
        description: `Couldn't find your dwn record`,
      });
      return;
    }
    console.log("myRecord", myRecord);
    const recc = res?.record;
    if (!recc) return;
    const { status } = await recc.update({
      data: { ...res?.data, name: formData.name },
    });
    toast({
      title: "Posted profile update to DWN",
      description: `Status: ${status.code} (${status.detail})`,
    });
    console.log(
      "🚀 ~ file: UpdateProfile.tsx:23 ~ updateName ~ status:",
      status,
    );
  };
  if (!res) return <></>;

  return (
    <>
      {data === undefined ? (
        <h2>Loading... </h2>
      ) : (
        <form>
          <h2>Hello {data.name}</h2>
          <Input defaultValue={data.name} {...register("name")} />
          <Button type={"submit"} onClick={handleSubmit(updateFormSubmit)}>
            Update
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdateProfile;
