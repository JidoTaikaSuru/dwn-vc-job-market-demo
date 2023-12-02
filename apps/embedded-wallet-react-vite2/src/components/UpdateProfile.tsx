import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { dwnReadSelfReturnRecordAndDataSelector } from "./lib/utils";
import { useToast } from "@/components/ui/use-toast.ts";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";

type UpdateForm = {
  name: string;
};
const UpdateProfile: React.FC = () => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }, //TODO Add this to the form
  } = useForm<UpdateForm>();

  const res = useRecoilValue(dwnReadSelfReturnRecordAndDataSelector);
  if (!res) return <>Can't find own profile</>;
  const { record, data, id } = res;

  const updateFormSubmit: SubmitHandler<UpdateForm> = async (formData) => {
    console.log("record", record);
    console.log("data", data);
    if (!record) {
      toast({
        title: "Error",
        description: `Couldn't find your dwn record`,
      });
      return;
    }
    console.log("compose", { ...data, name: formData.name });
    const { status } = await record.update({
      data: { name: formData.name },
    });
    toast({
      title: "Posted profile update to DWN",
      description: `ID: ${id}, Status: ${status.code} (${status.detail})`,
    });
    console.log(
      "🚀 ~ file: UpdateProfile.tsx:23 ~ updateName ~ status:",
      status,
    );
  };

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
