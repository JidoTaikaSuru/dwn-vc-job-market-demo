import type { Database } from "@/__generated__/supabase-types";
import { FC, useContext, useEffect, useState } from "react";
import { credentialStore } from "@/lib/common";
import { useParams } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext.tsx";
import { PEX } from "@sphereon/pex";
import { IVerifiableCredential } from "@sphereon/ssi-types";
import JSONPretty from "react-json-pretty";

export const JobListingDrilldown: FC = () => {
  const { listingId } = useParams();
  const pex = new PEX();

  const { session, wallet } = useContext(SessionContext);
  const [error, setError] = useState("");
  const [jobListing, setJobListing] =
    useState<Database["public"]["Tables"]["job_listings"]["Row"]>();
  const [userCredentials, setUserCredentials] = useState<
    IVerifiableCredential[]
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

      const listing = await credentialStore.getJobListing({
        jwt: session?.access_token || "",
        jobListingId: listingId,
      });
      if (!listing) {
        console.log("no data found for id", listingId);
        setError("No data found for id " + listingId);
        return;
      }
      setJobListing(listing);
    };

    fetchData();
  }, [listingId]);

  useEffect(() => {
    const fetchData = async () => {
      const credentials = await credentialStore.getCredentials({
        jwt: session?.access_token || "",
      });
      const compliantCredentials = credentials.map(
        // (credential) => {
        // return credential.verifiableCredential;
        // return credential.verifiableCredential as IVerifiableCredential;
        (credential): IVerifiableCredential => {
          const base = {
            ...credential,
            verifiableCredential: {
              ...credential.verifiableCredential,
              type:
                typeof credential.verifiableCredential.type === "string"
                  ? [credential.verifiableCredential.type]
                  : credential.verifiableCredential.type || [],
              proof: {
                ...credential.verifiableCredential.proof,
                type:
                  credential.verifiableCredential.proof.type || "JwtProof2020",
                proofPurpose: "assertionMethod",
                created: new Date().toLocaleString(),
                verificationMethod: "dunno",
              },
            },
          };
          return base.verifiableCredential;
        },
      );
      console.log("compliantCredentials", compliantCredentials);
      setUserCredentials(compliantCredentials);
    };

    fetchData();
  }, []);

  // Load user credentials
  console.log("listing", listingId);
  console.log("userCredentials", userCredentials);
  console.log("listingData", jobListing);
  if (jobListing && userCredentials[0]) {
    const presentationDefinition =
      // @ts-ignore
      jobListing.presentation_definition as IPresentationDefinition;
    console.log("presentationDefinition", presentationDefinition);
    console.log("[userCredentials[0]]", [userCredentials[0]]);
    const matchingCredentials = pex.selectFrom(
      presentationDefinition,
      userCredentials,
      // [userCredentials[0]] as OriginalVerifiableCredential[],
      { holderDIDs: [`did:ethr:${wallet?.address}`] },
    );
    console.log("matchingCredentials", matchingCredentials);
  }
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
        <div>{}</div>
        <JSONPretty
          id="json-pretty"
          data={jobListing.presentation_definition}
        ></JSONPretty>
        <JSONPretty id="json-pretty2" data={userCredentials}></JSONPretty>

        {error && <div className={"text-red-500"}>{error}</div>}
      </div>
    </div>
  );
};
