import type { Database } from "@/__generated__/supabase-types";
import { FC, useEffect, useState } from "react";
import type { VerifiableCredential } from "@veramo/core";
import { credentialStore, supabaseClient } from "@/lib/common";
import { json, useParams } from "react-router-dom";

export const JobListingDrilldown: FC = () => {
  const { listingId } = useParams();

  const [error, setError] = useState("");
  const [jobListing, setJobListing] =
    useState<Database["public"]["Tables"]["job_listings"]["Row"]>();
  const [userCredentials, setUserCredentials] = useState<
    VerifiableCredential[]
  >([]);
  // Load job
  useEffect(() => {
    const fetchData = async () => {
      if (!listingId) {
        console.log("no listing found for id", listingId);
        setError("listing id missing from path " + listingId);
        return;
      }
      console.log("fetching job listing for id", listingId);

      const { data, error } = await supabaseClient
        .from("job_listings")
        .select("*")
        .eq("id", listingId)
        .single();
      console.log("data", data);

      if (error) {
        console.log("error", error);
        setError(error.message);
      }
      if (!data) {
        console.log("no data found for id", listingId);
        setError("No data found for id " + listingId);
        return;
      }
      setJobListing(data);
      return json({ jobListing: data });
    };

    fetchData();
  }, [listingId]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.log("error", error);
        setError(error.message);
        return;
      }
      if (!data.session) {
        console.log("no session found");
        setError("No session found");
        return;
      }
      console.log(
        "getting credentials for the signed in user",
        data.session.user.id,
      );

      const credentials = await credentialStore.getCredentials({
        jwt: data.session?.access_token || "",
      });
      setUserCredentials(credentials);
    };

    fetchData();
  }, []);

  // Load user credentials
  console.log("listing", listingId);
  console.log("userCredentials", userCredentials);
  console.log("listingData", jobListing);
  if (!jobListing) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>{jobListing.title}</h1>
      <div className={"flex flex-col"}>
        <div className="grid grid-cols-4 gap-2">
          <div className={"col-span-1"}>Company</div>
          <div className={"col-span-3"}>{jobListing.company}</div>
          <div className={"col-span-1"}>Description</div>
          <div className={"col-span-3"}>{jobListing.description}</div>
          <div className={"col-span-1"}>Created At</div>
          <div className={"col-span-3"}>{jobListing.created_at}</div>
          <div className={"col-span-1"}>Updated At</div>
          <div className={"col-span-3"}>{jobListing.updated_at}</div>
        </div>
        {error && <div className={"text-red-500"}>{error}</div>}
      </div>
    </div>
  );
};
