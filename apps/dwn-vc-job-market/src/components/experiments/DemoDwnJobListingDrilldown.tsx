import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";

export const DemoDwnJobListingDrilldown: FC = () => {
  const { employerDid } = useParams();

  const [sendFinished, setSendFinished] = useState(false);
  const { web5Client } = useRecoilValue(web5ConnectSelector);
  useEffect(() => {
    if (employerDid === "" || employerDid === undefined) {
      console.log("Recipient DID is empty or not defined");
      return;
    }

    const sendApplication = async () => {
      await web5Client.dwnCreateAndSendJApplication(
        employerDid,
        "I want to apply to the job!",
      );

      setSendFinished(true);
    };

    sendApplication();
  }, []);

  if (!sendFinished) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>{employerDid}</h1>
      <div>Send DID finished! Check log for more details...</div>
    </div>
  );
};
