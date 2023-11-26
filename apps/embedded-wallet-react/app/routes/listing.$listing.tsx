import {
  credentialStore,
  supabaseClient,
} from "~/components/InternalIframeDemo";
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import {Database} from "~/__generated__/supabase-types";
import {useEffect, useState} from "react";
import {VerifiableCredential} from "@veramo/core";


export function ErrorBoundary() {
  const error = useRouteError();
  console.log("errorBoundary", error);
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return (
          <div>
            <p>You don't have access to this invoice.</p>
            <p>Contact {error.data.invoiceOwnerEmail} to get access</p>
          </div>
        );
      case 404:
        return <div>Invoice not found!</div>;
    }

    return (
      <div>
        Something went wrong: {error.status} {error.statusText}
      </div>
    );
  }

  return (
    <div>Something went wrong: {/*{error?.message || "Unknown Error"}*/}</div>
  );
}

export default function JobListingDrilldown() {
  const { listing } = useParams();

  const [error, setError] = useState("");
  const [jobListing, setJobListing] = useState<Database["public"]["Tables"]["job_listings"]["Row"]>();
  const [userCredentials, setUserCredentials] = useState<VerifiableCredential[]>([]);
   // Load job
    useEffect(() => {
        const fetchData = async () => {
          {
            if (!listing) {
              console.log("no listing found for id", listing)
              setError("listing id missing from path " + listing);
              return
            }
            console.log("fetching job listing for id", listing);

            const { data, error } = await supabaseClient
                .from("job_listings")
                .select("*")
                .eq("id", listing)
                .single();
            console.log("data", data);

            if (error) {
              console.log("error", error);
              setError(error.message);
            }
            if (!data) {
              console.log("no data found for id", listing)
              setError("No data found for id " + listing);
              return
            }
            setJobListing(data);
            return json({ jobListing: data });
          }
        };

        fetchData();
      }, [listing]);

    //TODO Below belongs in a context
  useEffect(() => {
    const fetchData = async () =>  {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.log("error", error);
        setError(error.message);
        return
      }
      if (!data.session) {
        console.log("no session found")
        setError("No session found");
        return
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

  console.log("listing", listing);
  // const listingData = useLoaderData<typeof jobListingLoader>();
  // const userCredentials = useLoaderData<typeof userCredentialsLoader>();
  console.log("userCredentials", userCredentials);
  console.log("listingData", jobListing);
  if (!jobListing) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <h1>{jobListing.title}</h1>
      <div className={"flex flex-col"}>
        <div className="grid grid-cols-4 gap-2">
          <div className={"col-span-1"}>Company</div>
          <div className={"col-span-3"}>{jobListing.company}</div>
          <div className={"col-span-1"}>Description</div>
          <div className={"col-span-3"}>
            {jobListing.description}
          </div>
          <div className={"col-span-1"}>Created At</div>
          <div className={"col-span-3"}>
            {jobListing.created_at}
          </div>
          <div className={"col-span-1"}>Updated At</div>
          <div className={"col-span-3"}>
            {jobListing.updated_at}
          </div>
        </div>
      </div>
    </>
  );
}
