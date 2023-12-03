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
  dwnQueryJobPostThatCanTakeApplicationsAsReplyProtocolSelector,
  dwnReadOtherDWNSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";

type RowData = any;

export const CompanyJobListings: FC = () => {
  const { companyDid } = useParams();
  const { web5Client, protocols } = useRecoilValue(web5ConnectSelector);
  const company = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: companyDid || "",
      protocol: protocols["selfProfileProtocol"],
    }),
  );
  const listings = useRecoilValue(
    dwnQueryJobPostThatCanTakeApplicationsAsReplyProtocolSelector({
      did: companyDid || "",
    }),
  );
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);

  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Id",
        accessorKey: "id",
      },
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "",
        accessorKey: "id",
        cell: (value) => (
          <Link
            to={`/listings/view/${value.row.original.id}`}
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

  console.debug(`job listings for company ${companyDid}`, listings);

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
                      title: jobTitle,
                      description: jobDescription,
                      presentation_definition: `{"id":"bd980aee-10ba-462c-8088-4afdda24ed97","input_descriptors":[{"id":"user has a HasAccount VC issued by us","name":"user has a HasAccount VC issued by us","purpose":"Please provide your HasAccount VC that we issued to you on account creation","constraints":{"fields":[{"path":["$.vc.type"],"filter":{"type":"array","contains":{"type":"string","const":"HasVerifiedEmail"}},"purpose":"Holder must possess HasVerifiedEmail VC"}]}}]}`,
                    };

                    //TODO add status return to see if request succes
                    await web5Client.dwnCreateJobPostAgainstCompany(jobdata);
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
    </>
  );
};
