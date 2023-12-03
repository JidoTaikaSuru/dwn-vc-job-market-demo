import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { credentialStore, supabaseClient } from "@/lib/common";

export const RequestReissueButton: FC = () => {
  const [startReissue, setStartReissue] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!startReissue) return;
    setStartReissue(false);

    const fetchData = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }
      console.log("requesting issue", data.session);
      const credentials = await credentialStore
        .requestIssueBasicCredentials({
          jwt: data.session?.access_token || "",
        })
        .catch((e: any) => {
          console.log("error from requesting issue", e);
          setError(e.message);
          return "";
        });
      console.log("got issue", credentials);
    };

    fetchData();
  }, [startReissue]);

  return (
    <>
      <Button onClick={() => setStartReissue(true)}>
        Request Basic Credentials
      </Button>
      {error && <p>{error}</p>}
    </>
  );
};
