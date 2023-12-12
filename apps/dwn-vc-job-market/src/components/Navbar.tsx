import { Button } from "@/components/ui/button";
import React, { FC, useContext, useEffect, useState } from "react";
import { SessionContext } from "@/contexts/SessionContext";
import { credentialStore, proofOfWork, supabaseClient } from "@/lib/common.ts";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRecoilValue } from "recoil";
import {
  dwnReadSelfProfileSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";
import { truncateAddress } from "@/lib/embeddedWalletLib.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast.ts";
import { faker } from "@faker-js/faker";
import { getRandomPresentationDefinition } from "@/lib/presentationExchangeLib.ts";
import { TextArea } from "@/components/ui/text-area.tsx";
import { BOOTSTRAP_SERVERS } from "@/lib/credentialManager.ts";

export const APP_NAME = "Decentralinked";

const CreateNewJobPostDialog: FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  company: any;
}> = ({ open, setOpen, company }) => {
  const { web5Client, myDid, user } = useRecoilValue(web5ConnectSelector);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();

  const { session } = useContext(SessionContext);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="tracking-wider font-semibold flex gap-2"
        >
          Create New Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Job Listing</DialogTitle>
          <DialogDescription>
            <p>Company: {company.name}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              required
              onChange={(e) => setJobTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-top gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <TextArea
              required
              className="col-span-3"
              onChange={(e: any) => setJobDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const sendApplication = async () => {
                if (!jobTitle) {
                  toast({
                    title: "Error",
                    description: "Please enter a Job Title",
                  });
                  return;
                }

                if (!jobDescription) {
                  toast({
                    title: "Error",
                    description: "Please enter a Job Description",
                  });
                  return;
                }
                try {
                  const jobdata = {
                    companyName: company.name,
                    companyDid: myDid,
                    title: jobTitle,
                    description: jobDescription,
                    location: faker.location.county(),
                    remote: faker.datatype.boolean(),
                    created_at: new Date().toISOString(),
                    presentation_definition: getRandomPresentationDefinition(), //Random known presentation definition
                  };

                  console.log("Start Proof of Work ~ proofOfWork");

                  const {serverDid, challenge, timeOut} = await credentialStore.getProofOfWorkChallenge({
                    clientDid: myDid,
                    jwt: session?.access_token || ""
                  });

                  console.log("🚀 ~ file: Navbar.tsx:136 ~ sendApplication ~ proofOfWork ~ serverDid, challenge, timeOut:", serverDid, challenge, timeOut)

                  //TODO: send the answer hash to the validator server to check authentity and validate
                  const { answerHash } = await proofOfWork(
                    serverDid,
                    myDid,
                    challenge,
                    timeOut,
                  );

                  const reply = await credentialStore.submitProofOfWorkChallenge({
                    clientDid: myDid,
                    challengeHash: answerHash,
                    jwt: session?.access_token || ""
                  });

                  //TODO need to return a reply
                  console.log("🚀 ~ file: Navbar.tsx:150 ~ sendApplication ~ submitProofOfWorkChallenge:", reply)
                  
                  try {
                    console.log("creating job post", jobdata);
                    await web5Client.dwnCreateJobPostAgainstCompany(jobdata);
                  } catch (e) {
                    toast({
                      title: "Error",
                      description: `Error creating Job Listing: ${e}`,
                    });
                    return;
                  }
                  toast({
                    title: `Success`,
                    description: `Successfully created new Job Listing : ${jobTitle}!`,
                  });
                  setOpen(false);
                } catch (e) {
                  toast({
                    title: "Error",
                    description: `Error creating Job Listing: ${e}`,
                  });
                  return;
                }
              };
              sendApplication();
            }}
          >
            Create New Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Navbar: React.FC = () => {
  const { myDid } = useRecoilValue(web5ConnectSelector);
  const { session, setSession, wallet } = useContext(SessionContext);
  const [startLogout, setStartLogout] = useState(false);
  const [strgPercent, setStrgPercent] = useState(0);
  const company = useRecoilValue(dwnReadSelfProfileSelector);
  const storage_capacity = 10485758; //10MB is the known defualt limit for Chrome and firefox, safari mobile in some cases will give only 5MB
  let data_used = 0;
  let last_usage = 0;
  let last_max_storage_usage = 0;
  let max_storage_usage = 0;
  let last_storage_add_diff = 0;
  let callcounter = 0;

  // Show used DWN storage in console
  useEffect(() => {
    const printStorageUsage = async () => {
      const u = await navigator.storage.estimate();
      const newused = u.usage;
      // .then(u=> printStorageUsage(u.usageDetails.indexedDB)) }, 2000)

      callcounter++;
      if (newused) {
        last_usage = data_used;
        data_used = newused;

        const cur_diff = last_usage - data_used;
        const percentused = Math.round((100 * data_used) / storage_capacity);
        if (callcounter % 100 === 0)
          console.info(
            `Storage usage: ${data_used} bytes, ${percentused}%  change ${
              cur_diff / (1024 * 1024)
            }`,
          );
        setStrgPercent(percentused);
        if (data_used > max_storage_usage || max_storage_usage === 0) {
          last_max_storage_usage = max_storage_usage;
          max_storage_usage = data_used;
          last_storage_add_diff = max_storage_usage - last_max_storage_usage;
          if (callcounter % 100 === 0)
            console.info(
              `## Storage usage: ${data_used} bytes, ${percentused}% added ${
                last_storage_add_diff / (1024 * 1024)
              }`,
            );
        }
        // if(data_used && last_usage!==0&&callcounter%1===0)
        //console.info(`Storage usage: ${data_used} bytes, ${percentused}% added${last_storage_add_diff/1024/1024}`)
      }
    };

    const intervalId = setInterval(printStorageUsage, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!startLogout) return;
    setStartLogout(false);
    const logout = async () => {
      await supabaseClient.auth.signOut();
      setSession(undefined);
    };

    logout();
  }, [startLogout]);

  const [open, setOpen] = useState<boolean>(false);

  return (
    <nav className="sticky top-0 z-50 bg-fuchsia-200/50">
      <div className="flex w-screen items-center justify-between p-4">
        <a href={"/"}>
          <h5 className="tracking-tighter text-xl text-black">{APP_NAME}</h5>
        </a>
        <div className="flex items-center gap-4">
          {strgPercent > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className={"w-48 flex"} asChild>
                  <div style={{ width: "40px", height: "40px" }}>
                    <CircularProgressbar
                      value={strgPercent}
                      text={`${strgPercent}%`}
                      strokeWidth={7}
                      styles={buildStyles({
                        textSize: "30px", // Adjust the text size as needed
                      })}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Local DWN Storage</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            ""
          )}
          {session && (
            <a href={"/"}>
              <Button
                variant="outline"
                className="tracking-wider font-semibold flex gap-2"
              >
                FIND JOBS
              </Button>
            </a>
          )}
          {company && (
            <CreateNewJobPostDialog
              open={open}
              setOpen={setOpen}
              company={company}
            />
          )}
          {wallet && (
            <a href={`/profile/${myDid}`} style={{ color: "#213547" }}>
              <Button
                variant="outline"
                className="tracking-wider text-base font-semibold flex gap-2"
              >
                {<Identicon string={myDid} size={24} />}
                {truncateAddress(wallet.address)}
              </Button>
            </a>
          )}
          {session && (
            <Button
              onClick={() => {
                setStartLogout(true);
              }}
              variant="outline"
              className="tracking-wider font-semibold flex gap-2"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
