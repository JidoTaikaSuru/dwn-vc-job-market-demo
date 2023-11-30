import type { Database } from "@/__generated__/supabase-types";
import { FC, useContext, useEffect, useState } from "react";
import { credentialStore } from "@/lib/common";
import { useParams } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext.tsx";
import JSONPretty from "react-json-pretty";
import {
  checkVcMatchAgainstPresentation,
  HAS_ACCOUNT_PRESENTATION_DEFINITION,
  HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION,
} from "@/lib/credentialLib.ts";
import { IPresentationDefinition } from "@sphereon/pex";
import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { CredentialCard } from "@/components/CredentialCard.tsx";
import { APP_NAME } from "@/components/Navbar.tsx";

const todayPlus3Months = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
};
export const JobListingDrilldown: FC = () => {
  const { listingId } = useParams();

  const { session, wallet, credentials } = useContext(SessionContext);
  const [error, setError] = useState("");
  const [jobListing, setJobListing] =
    useState<Database["public"]["Tables"]["job_listings"]["Row"]>();
  // @ts-ignore
  const presentationDefinition =
    jobListing?.presentation_definition as IPresentationDefinition;

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

  // Load user credentials
  console.log("listing", listingId);
  console.log("userCredentials", credentials);
  console.log("listingData", jobListing);
  if (!jobListing) {
    return <div>Loading...</div>;
  }
  if (!wallet) {
    return <div>Wallet not found</div>;
  }

  const { pass, matchingVcs } = checkVcMatchAgainstPresentation(
    // @ts-ignore
    presentationDefinition,
    credentials,
    wallet,
  );
  let tooltipContent = "";
  let card = <div></div>;

  switch (presentationDefinition.id) {
    case HAS_ACCOUNT_PRESENTATION_DEFINITION:
      tooltipContent =
        "You must have an account with us to apply and are qualified to apply for this position! Click to apply!";
      break;
    case HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION:
      tooltipContent =
        "You must have a verified email with us and are qualified to apply for this position! Click to apply!";
      break;
    default:
      tooltipContent =
        "You are qualified to apply for this position! Click to apply!";
      break;
  }

  console.log("tooltipContent", tooltipContent);

  let presentationExchangeRender = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={"w-24"} asChild>
          <Button onClick={() => alert("You applied for this job!")}>
            Apply
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  if (!pass) {
    console.log("You do not have the required credentials.");
    switch (presentationDefinition.id) {
      case HAS_ACCOUNT_PRESENTATION_DEFINITION:
        presentationExchangeRender = (
          <div>
            You must have an account with us to apply for this position! You're
            already signed in, so you should already have an account.
            <a
              onClick={() =>
                credentialStore.requestIssueBasicCredentials({
                  jwt: session?.access_token || "",
                })
              }
            >
              Click here to request a re-issue
            </a>
          </div>
        );
        break;
      case HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION:
        presentationExchangeRender = (
          <div>
            You must have an account with us to apply for this position! Please
            sign out and then sign back in using an OTP
          </div>
        );
        break;
      default:
        presentationExchangeRender = (
          <div>You failed on an unknown presentation definition</div>
        );
        break;
    }
  }
  const credentialCards = presentationDefinition.input_descriptors.map(
    (credential) => {
      //TODO implement this
      const getMatchingVc = (id: string) => {
        if (!pass) return undefined;
        const m = matchingVcs.matches?.find((vc) => vc.name === id);
      };
      const hasAccountId = "user has a HasAccount VC issued by us";
      if (credential.id === hasAccountId) {
        // const matchingVc = getMatchingVc(hasAccountId);
        return (
          <CredentialCard
            title={`Has an account with ${APP_NAME}`}
            expirationDate={todayPlus3Months()}
            description={"Test description for the VC"}
            howToGet={"You can get it if you wish for it really hard"}
            userHasCredential={pass}
          />
        );
      }
      return (
        <CredentialCard
          title={`Unknown VC ${credential.id}`}
          expirationDate={todayPlus3Months()}
          description={"Test description for the VC"}
          howToGet={"You can get it if you wish for it really hard"}
          userHasCredential={pass}
        />
      );
    },
  );

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
        {presentationExchangeRender}
        <div className={"grid-cols-4 gap-3"}>{credentialCards}</div>
        <Collapsible>
          <CollapsibleTrigger>Show raw credential details</CollapsibleTrigger>
          <CollapsibleContent>
            <JSONPretty
              id="json-pretty"
              data={jobListing.presentation_definition}
            ></JSONPretty>
            <JSONPretty id="json-pretty2" data={credentials}></JSONPretty>
          </CollapsibleContent>
        </Collapsible>

        {error && <div className={"text-red-500"}>{error}</div>}
      </div>
    </div>
  );
};
