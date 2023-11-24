import { FC, useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import {
  credentialStore,
  supabaseClient,
} from "~/components/InternalIframeDemo";

import {getUserEmbeddedWallet} from "~/components/RequireUserLoggedIn";
export const userMetadataToUser = async () => {
  const user = await supabaseClient.auth.getUser();
  const {id, user_metadata} = user.data.user || {};
    if (!id) {
        throw new Error("No user id found");
    }
  if (!user_metadata) {
    throw new Error("No user metadata found");
  }
  const pin = localStorage.getItem("pin");
    if (!pin) {
        throw new Error("No pin found");
    }
  const wallet = await getUserEmbeddedWallet(pin, undefined);

    const users = await supabaseClient.from("users").select("*");
    console.log("users", users.data)
  await supabaseClient.from("users").upsert({
    id,
    public_key: wallet.address,
    password_encrypted_private_key: user_metadata.pin_encrypted_private_key,
    iv: user_metadata.iv,
  })

}
export const RenderCredentials: FC = () => {
  const [startReissue, setStartReissue] = useState(false);
  const [startUserdataConvert, setStartUserdataConvert] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      console.log("Getting credentials ", new Date())
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }
      const credentials = await credentialStore.getCredentials({
        jwt: data.session?.access_token || "",
      });
      setCredentials(JSON.stringify(credentials));
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!startReissue) return;
    setStartReissue(false);

    const fetchData = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }
      console.log("requesting issue", data.session)
      const credentials = await credentialStore.requestIssueBasicCredentials({
        jwt: data.session?.access_token || "",
      }).catch((e: any) => {
        console.log("error from requesting issue", e)
        setError(e.message);
        return "";
      })
      console.log("got issue", credentials)
    };

    fetchData();
  }, [startReissue]);

  useEffect(() => {
    if (!startUserdataConvert) return;
    setStartUserdataConvert(false);

    const fetchData = async () => {
      await userMetadataToUser();
    };

    fetchData();
  }, [startUserdataConvert]);
  return (
    <>
      <Typography variant={"h5"}>
        Credentials
        <Button onClick={() => setStartReissue(true)}>Attempt Reissue</Button>
        <Button onClick={() => setStartUserdataConvert(true)}>Convert user_metadata to User</Button>
      </Typography>
      <Typography>{credentials}</Typography>
      <Typography>{error}</Typography>
    </>
  );
};
