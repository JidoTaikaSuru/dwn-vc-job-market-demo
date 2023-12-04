import { FC, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext.tsx";
import JSONPretty from "react-json-pretty";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH3, TypographyH4 } from "@/components/Typography.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecoilValue } from "recoil";
import { useToast } from "@/components/ui/use-toast.ts";
import {
  dwnQuerySelfByProtocolSelector,
  dwnReadOtherDWNByRecordIdSelector,
  dwnReadSelfProfileSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";
import { loadUserDataPlaceholdersIntoPresentationDefinition } from "@/lib/presentationExchangeLib.ts";
import {
  checkVcMatchAgainstPresentation,
  HAS_ACCOUNT_PRESENTATION_DEFINITION,
  HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION,
} from "@/lib/credentialLib.ts";
import { credentialStore } from "@/lib/common.ts";
import { APP_NAME } from "@/components/Navbar.tsx";
import { CredentialCard } from "@/components/CredentialCard.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { TextArea } from "@/components/ui/text-area.tsx";
import { IPresentationDefinition } from "@sphereon/pex";
import { JobRepliesTable } from "@/components/JobRepliesTable.tsx";

const todayPlus3Months = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
};

const ApplyDialog: FC<{
  jobListing: any;
  setOpen: (open: boolean) => void;
  open: boolean;
}> = ({ jobListing, setOpen, open }) => {
  const { web5Client, protocols } = useRecoilValue(web5ConnectSelector);
  const { session } = useContext(SessionContext);
  const { toast } = useToast();
  const selfProfile = useRecoilValue(dwnReadSelfProfileSelector);

  const [applyMessage, setApplyMessage] = useState<string>("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>APPLY</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for the Company</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              My Email
            </Label>
            <Label className="text-center">{session?.user?.email}</Label>
          </div>
          <div className="grid grid-cols-4 items-top gap-4">
            <Label htmlFor="username" className="text-right">
              Resume (Markdown)
            </Label>
            <TextArea
              required
              className="col-span-3"
              onChange={(e: any) => setApplyMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const sendApplication = async () => {
                if (!applyMessage) {
                  toast({
                    title: "Error",
                    description: "Please enter a message",
                  });
                  return;
                }
                try {
                  await web5Client.dwnCreateAndSendJApplicationReplyingToJob(
                    jobListing.company,
                    applyMessage,
                    jobListing.id,
                    {
                      name: selfProfile.name,
                    },
                  );
                  toast({
                    title: `Success`,
                    description: `Successfully applied to ${jobListing.title}!`,
                  });
                  setOpen(false);
                } catch (e) {
                  toast({
                    title: "Error",
                    description: `Error sending application: ${e}`,
                  });
                  return;
                }
              };
              sendApplication();
            }}
          >
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export const DwnJobListingDrilldown: FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const applicationRecordId = query.get("applicationRecordId") || "";
  const companyDid = query.get("companyDid") || "";
  console.log("query", query);
  // const listingId = query.get("listingId");
  const { session, wallet, credentials, pexWrappedCredentials } =
    useContext(SessionContext);
  const { web5Client, protocols, userRec } =
    useRecoilValue(web5ConnectSelector);
  const selfProfile = useRecoilValue(dwnReadSelfProfileSelector);
  const [error, setError] = useState("");
  const [showRawCredentialDetails, setShowRawCredentialDetails] =
    useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const jobListing = useRecoilValue(
    dwnReadOtherDWNByRecordIdSelector({
      did: companyDid,
      recordId: applicationRecordId || "",
      protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
    }),
  );

  const presentationDefinition =
    // @ts-ignore
    jobListing?.presentation_definition as IPresentationDefinition;
  // Uncomment below and edit by hand if you suspect there's a problem with PEX or the Presentation Definition
  // const presentationDefinition = SAMPLE_PRESENTATION_DEFINITION;

  if (!applicationRecordId) {
    setError("listing id missing from query params " + applicationRecordId);
    return <>Page accessed without providing a job listing id in params</>;
  }

  // Load user credentials
  console.groupCollapsed("DwnJobListingDrilldown");
  console.log("companyDid", applicationRecordId);
  console.log("userCredentials", credentials);
  console.log("listingData", jobListing);
  console.log("selfProfile", selfProfile);

  const jobReplies = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );
  console.groupEnd();

  if (!jobListing) {
    return <div>Loading...</div>;
  }
  if (!wallet) {
    return <div>Wallet not found</div>;
  }
  if(!userRec){
    return (<div>User Record not found</div>);
  }

  const { pass, matchingVcs } = checkVcMatchAgainstPresentation(
    presentationDefinition,
    credentials,
    wallet,
  );
  let tooltipContent = "";

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

  // This will get replaced with a tooltip if you don't have the required credentials
  let presentationExchangeRender = (
    <div>
      <ApplyDialog jobListing={jobListing} setOpen={setOpen} open={open} />
    </div>
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
            issuanceDate={todayPlus3Months()}
            expirationDate={todayPlus3Months()}
            description={"Test description for the VC"}
            howToGet={"You can get it if you wish for it really hard"}
            userHasCredential={pass}
          />
        );
      }
      return (
        <CredentialCard
          title={`Unknown VC type: "${credential.id}"`}
          issuanceDate={todayPlus3Months()}
          expirationDate={todayPlus3Months()}
          description={"Test description for the VC"}
          howToGet={"You can get it if you wish for it really hard"}
          userHasCredential={pass}
        />
      );
    },
  );

  return (
    <div>
      <div className={"flex-col space-y-2"}>
        <h1>{jobListing.title}</h1>
        <div className="grid grid-cols-4 gap-2">
          <div className={"col-span-1"}>Company</div>
          <div className={"col-span-3"}>{jobListing.companyName}</div>
          <div className={"col-span-1"}>Description</div>
          <div className={"col-span-3"}>{jobListing.description}</div>
          <div className={"col-span-1"}>Created At</div>
          <div className={"col-span-3"}>{jobListing.created_at}</div>
        </div>

        <Tabs defaultValue="candidate" className="h-full w-full">
          <TabsList>
            <TabsTrigger value="candidate">
              <h2>View as CANDIDATE</h2>
            </TabsTrigger>
            <TabsTrigger value="company">
              <h2>View as COMPANY</h2>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="candidate">
            <div className={"flex-col space-y-2"}>
              <TypographyH3>Required Credentials</TypographyH3>
              <div className={"grid-cols-4 gap-3"}>{credentialCards}</div>
              {presentationExchangeRender}
              <TypographyH3>Debug</TypographyH3>
              <Button
                variant={"secondary"}
                onClick={() =>
                  setShowRawCredentialDetails(!showRawCredentialDetails)
                }
              >
                {showRawCredentialDetails ? "HIDE" : "SHOW"} RAW CREDENTIAL
                DETAILS
              </Button>

              {showRawCredentialDetails && (
                <div className="gap-5 p-5" style={{ width: "1000px" }}>
                  <TypographyH4>Credentials (from Veramo)</TypographyH4>
                  <div className={"bg-slate-200"}>
                    <JSONPretty
                      id="json-pretty2"
                      data={credentials}
                    ></JSONPretty>
                  </div>
                  <TypographyH4>PEX Wrapped Credentials</TypographyH4>
                  <div className={"bg-slate-200"}>
                    <JSONPretty
                      id="json-pretty2"
                      data={pexWrappedCredentials}
                    ></JSONPretty>
                  </div>
                  <TypographyH4>
                    Presentation Definition (Post-placeholders)
                  </TypographyH4>
                  <div className={"bg-slate-100"}>
                    <JSONPretty
                      id="json-pretty"
                      data={loadUserDataPlaceholdersIntoPresentationDefinition(
                        presentationDefinition,
                        userRec,
                      )}
                    ></JSONPretty>
                  </div>
                  <TypographyH4>
                    Presentation Definition (Pre-placeholders)
                  </TypographyH4>
                  <div className={"bg-slate-100"}>
                    <JSONPretty
                      id="json-pretty"
                      data={jobListing.presentation_definition}
                    ></JSONPretty>
                  </div>
                </div>
              )}
              {error && <div className={"text-red-500"}>{error}</div>}
            </div>
          </TabsContent>
          <TabsContent value="company">
            <div className={"flex-col space-y-2"}>
              <TypographyH3>Received applications</TypographyH3>

              <div className="rounded-md border mb-5">
                <JobRepliesTable
                  companyDid={companyDid}
                  applicationRecordId={applicationRecordId}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
