import { FC, useContext, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link, useLocation } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext.tsx";
import JSONPretty from "react-json-pretty";
import { IPresentationDefinition } from "@sphereon/pex";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH3, TypographyH4 } from "@/components/Typography.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecoilValue } from "recoil";
import { useToast } from "@/components/ui/use-toast.ts";
import {
  dwnQuerySelfByProtocolSelector,
  dwnReadOtherDWNByRecordIdSelector,
  dwnReadSelfProfileSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";

type RowData = any;

const todayPlus3Months = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
};

export const DwnJobListingDrilldown: FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const applicationRecordId = query.get("applicationRecordId") || "";
  const companyDid = query.get("companyDid") || "";
  console.log("query", query);
  // const listingId = query.get("listingId");
  const { session, wallet, credentials } = useContext(SessionContext);
  const { web5Client, protocols } = useRecoilValue(web5ConnectSelector);
  const selfProfile = useRecoilValue(dwnReadSelfProfileSelector);
  const [error, setError] = useState("");
  const [showRawCredentialDetails, setShowRawCredentialDetails] =
    useState(false);
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [applyMessage, setApplyMessage] = useState<string>("");

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

  const jobReplies = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );

  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "data.name",
        cell: ({ row }) => {
          return (
            <Link to={`/profile/${row.original.record.author}`}>
              {row.original.data.name}
            </Link>
          );
        },
      },
      {
        header: "E-mail",
        accessorKey: "data.email",
      },
      {
        header: "Message",
        accessorKey: "data.description",
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: jobReplies || [],
    getCoreRowModel: getCoreRowModel(),
  });

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
  console.log("jobReplies", jobReplies);
  console.groupEnd();

  if (!jobListing) {
    return <div>Loading...</div>;
  }
  if (!wallet) {
    return <div>Wallet not found</div>;
  }

  // const { pass, matchingVcs } = checkVcMatchAgainstPresentation(
  //   presentationDefinition,
  //   credentials,
  //   wallet,
  // );
  // let tooltipContent = "";
  //
  // switch (presentationDefinition.id) {
  //   case HAS_ACCOUNT_PRESENTATION_DEFINITION:
  //     tooltipContent =
  //       "You must have an account with us to apply and are qualified to apply for this position! Click to apply!";
  //     break;
  //   case HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION:
  //     tooltipContent =
  //       "You must have a verified email with us and are qualified to apply for this position! Click to apply!";
  //     break;
  //   default:
  //     tooltipContent =
  //       "You are qualified to apply for this position! Click to apply!";
  //     break;
  // }

  // console.log("tooltipContent", tooltipContent);
  //
  // let presentationExchangeRender = (
  //   <TooltipProvider>
  //     <Tooltip>
  //       <TooltipTrigger className={"w-48 flex"} asChild>
  //         <Button onClick={() => alert("You applied for this job!")}>
  //           APPLY FOR THIS JOB
  //         </Button>
  //       </TooltipTrigger>
  //       <TooltipContent>{tooltipContent}</TooltipContent>
  //     </Tooltip>
  //   </TooltipProvider>
  // );
  // if (!pass) {
  //   console.log("You do not have the required credentials.");
  //   switch (presentationDefinition.id) {
  //     case HAS_ACCOUNT_PRESENTATION_DEFINITION:
  //       presentationExchangeRender = (
  //         <div>
  //           You must have an account with us to apply for this position! You're
  //           already signed in, so you should already have an account.
  //           <a
  //             onClick={() =>
  //               credentialStore.requestIssueBasicCredentials({
  //                 jwt: session?.access_token || "",
  //               })
  //             }
  //           >
  //             Click here to request a re-issue
  //           </a>
  //         </div>
  //       );
  //       break;
  //     case HAS_VERIFIED_EMAIL_PRESENTATION_DEFINITION:
  //       presentationExchangeRender = (
  //         <div>
  //           You must have an account with us to apply for this position! Please
  //           sign out and then sign back in using an OTP
  //         </div>
  //       );
  //       break;
  //     default:
  //       presentationExchangeRender = (
  //         <div>You failed on an unknown presentation definition</div>
  //       );
  //       break;
  //   }
  // }

  // const credentialCards = presentationDefinition.input_descriptors.map(
  //   (credential) => {
  //     //TODO implement this
  //     const getMatchingVc = (id: string) => {
  //       if (!pass) return undefined;
  //       const m = matchingVcs.matches?.find((vc) => vc.name === id);
  //     };
  //     const hasAccountId = "user has a HasAccount VC issued by us";
  //     if (credential.id === hasAccountId) {
  //       // const matchingVc = getMatchingVc(hasAccountId);
  //       return (
  //         <CredentialCard
  //           title={`Has an account with ${APP_NAME}`}
  //           expirationDate={todayPlus3Months()}
  //           description={"Test description for the VC"}
  //           howToGet={"You can get it if you wish for it really hard"}
  //           userHasCredential={pass}
  //         />
  //       );
  //     }
  //     return (
  //       <CredentialCard
  //         title={`Unknown VC ${credential.id}`}
  //         expirationDate={todayPlus3Months()}
  //         description={"Test description for the VC"}
  //         howToGet={"You can get it if you wish for it really hard"}
  //         userHasCredential={pass}
  //       />
  //     );
  //   },
  // );

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

        <TypographyH3>Required Credentials</TypographyH3>
        {/*<div className={"grid-cols-4 gap-3"}>{credentialCards}</div>*/}
        {/*{presentationExchangeRender}*/}
        <Button
          variant={"secondary"}
          onClick={() => setShowRawCredentialDetails(!showRawCredentialDetails)}
        >
          {showRawCredentialDetails ? "HIDE" : "SHOW"} RAW CREDENTIAL DETAILS
        </Button>

        {showRawCredentialDetails && (
          <>
            <TypographyH4>Credentials</TypographyH4>
            <div className={"bg-slate-200"}>
              <JSONPretty id="json-pretty2" data={credentials}></JSONPretty>
            </div>
            <TypographyH4>Presenation definition</TypographyH4>
            <div className={"bg-slate-100"}>
              <JSONPretty
                id="json-pretty"
                data={jobListing.presentation_definition}
              ></JSONPretty>
            </div>
          </>
        )}
        {error && <div className={"text-red-500"}>{error}</div>}

        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Apply</Button>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Message
                  </Label>
                  <Input
                    required
                    id="text"
                    className="col-span-3"
                    onChange={(e) => setApplyMessage(e.target.value)}
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
                          description: `Successfully applied to ${jobListing.company}!`,
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
        </div>

        <h2> Candidates applied to the job</h2>

        <div className="rounded-md border mb-5">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="mb-5">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
