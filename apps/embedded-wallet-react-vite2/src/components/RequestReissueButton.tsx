import type {FC} from "react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {credentialStore, supabaseClient} from "@/lib/common";

// export const userMetadataToUser = async () => {
//   const user = await supabaseClient.auth.getUser();
//   const { id, user_metadata } = user.data.user || {};
//   if (!id) {
//     throw new Error("No user id found");
//   }
//   if (!user_metadata) {
//     throw new Error("No user metadata found");
//   }
//   const pin = localStorage.getItem("pin");
//   if (!pin) {
//     throw new Error("No pin found");
//   }
//   const wallet = await getUserEmbeddedWallet(pin, undefined);
//
//   const users = await supabaseClient.from("users").select("*");
//   console.log("users", users.data);
//   await supabaseClient.from("users").upsert({
//     id,
//     public_key: wallet.address,
//     password_encrypted_private_key: user_metadata.pin_encrypted_private_key,
//     iv: user_metadata.iv,
//   });
// };

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
      <Button onClick={() => setStartReissue(true)}>Attempt Reissue</Button>
      {error && <p>{error}</p>}
    </>
  );
};
