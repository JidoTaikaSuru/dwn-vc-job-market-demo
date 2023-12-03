import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
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
import { useToast } from "@/components/ui/use-toast.ts";
import {
  dwnQueryOtherDWNByProtocolSelector,
  dwnReadOtherDWNSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";
import { faker } from "@faker-js/faker";
import { getRandomPresentationDefinition } from "@/lib/presentationExchangeLib.ts";

type RowData = any;

const CreateNewJobPostDialog: FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  company: any;
}> = ({ open, setOpen, company }) => {
  const { web5Client, myDid } = useRecoilValue(web5ConnectSelector);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={"mt-5"}>Create New Listing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Job Listing</DialogTitle>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              required
              onChange={(e) => setJobDescription(e.target.value)}
              className="col-span-3"
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
                    companyName: company?.name,
                    companyDid: myDid,
                    title: jobTitle,
                    description: jobDescription,
                    location: faker.location.county(),
                    remote: faker.datatype.boolean(),
                    created_at: new Date().toISOString(),
                    presentation_definition: getRandomPresentationDefinition(), //Random known presentation definition
                  };

                  //TODO add status return to see if request successful
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
export const CompanyJobListings: FC = () => {
  const { companyDid } = useParams();
  const { web5Client, myDid, protocols } = useRecoilValue(web5ConnectSelector);
  const company = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: companyDid || "",
      protocol: protocols["selfProfileProtocol"],
    }),
  );

  const listings = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: companyDid || "",
      protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
    }),
  );
  console.debug(`job listings for company ${companyDid}`, listings);

  const [open, setOpen] = useState<boolean>(false);

  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Id",
        accessorKey: "id",
      },
      {
        header: "Title",
        cell: ({ row }) => row.original.data.title || row.original.data.name, //TODO clean up legacy data
      },
      {
        header: "",
        accessorKey: "id",
        cell: (value) => (
          <Link
            to={`/listings/view?applicationRecordId=${value.row.original.id}&companyDid=${companyDid}`}
            className="text-blue-500"
          >
            Apply
          </Link>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    columns,
    data: listings || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (!listings) return <></>;
  if (!companyDid) return <>Accessed route without a DID</>; //TODO This might throw an error

  return (
    <>
      <h1 className={"mb-5"}>Job Listings for {company?.name}</h1>
      <div className="rounded-md border">
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
          <TableBody>
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
      <CreateNewJobPostDialog open={open} setOpen={setOpen} company={company} />
    </>
  );
};
