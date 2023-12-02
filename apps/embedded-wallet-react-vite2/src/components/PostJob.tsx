import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import { dwnCreateJobPost } from "../lib/utils.ts";
import { Label } from "@radix-ui/react-label";

export const PostJob: FC = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const defaultJobTitle = "Type your Job Title here...";
  const defaultJobDescr = "Type your Job Description here...";

  const postJob = async () => {
    const jobdata = {
      title: jobTitle,
      description: jobDescription,
      presentation_definition: `{"id":"bd980aee-10ba-462c-8088-4afdda24ed97","input_descriptors":[{"id":"user has a HasAccount VC issued by us","name":"user has a HasAccount VC issued by us","purpose":"Please provide your HasAccount VC that we issued to you on account creation","constraints":{"fields":[{"path":["$.vc.type"],"filter":{"type":"array","contains":{"type":"string","const":"HasVerifiedEmail"}},"purpose":"Holder must possess HasVerifiedEmail VC"}]}}]}`,
    };

    await dwnCreateJobPost(jobdata);
  };

  return (
    <>
      <h2>Let's fing a brilliant hire for you!</h2>

      <Label>
        {defaultJobTitle}
        <Input
          name="titleInput"
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </Label>

      <Label>
        {defaultJobDescr}
        <Input
          name="descrInput"
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </Label>
      {jobTitle && jobDescription ? (
        <Button onClick={() => postJob()}>Create Job</Button>
      ) : (
        <> </>
      )}
    </>
  );
};
