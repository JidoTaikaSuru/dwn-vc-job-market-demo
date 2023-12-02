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
import { useParams, Link } from "react-router-dom";
import {
  dwnCreateAndSendJApplicationReplyingToJob,
  dwnGetCompanyJobs,
  dwnReadSelfProfile,
  dwnCreateJobPost,
} from "../lib/utils.ts";
import { useRecoilValue } from "recoil";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast.ts";

type RowData = any;
export const JobListingsByCompany: FC = () => {
  const { companyDid } = useParams();
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
  const company = useRecoilValue(dwnReadSelfProfile({ did: companyDid }));
  const listings = useRecoilValue(dwnGetCompanyJobs({ did: companyDid }));

  /* dummy data
 const company = {did : {companyDid}, name: "dummy company"};
 const listings = [{title: "Job #1", description: "Job #1 detailed description", id: "00000001"},
 {title: "Job #2", description: "Job #1 detailed description", id: "00000002"},
 ]
 */

  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!listings) return <></>;
  if (!companyDid) return <>Accessed route without a DID</>; //TODO This might throw an error

  console.debug(`job listings for company ${companyDid}`, listings);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const { toast } = useToast();

  const postJob = async () => {
    console.log("🚀 ~ file: JobListingsByCompany.tsx:95 ~ postJob ~ dwnCreateJobPost:", postJob)

    if(!jobTitle || !jobDescription) return;

    const jobdata = {
      title: jobTitle,
      description: jobDescription,
      presentation_definition: `{"id":"bd980aee-10ba-462c-8088-4afdda24ed97","input_descriptors":[{"id":"user has a HasAccount VC issued by us","name":"user has a HasAccount VC issued by us","purpose":"Please provide your HasAccount VC that we issued to you on account creation","constraints":{"fields":[{"path":["$.vc.type"],"filter":{"type":"array","contains":{"type":"string","const":"HasVerifiedEmail"}},"purpose":"Holder must possess HasVerifiedEmail VC"}]}}]}`,
    };

    //TODO add status return to see if request succes
    await dwnCreateJobPost(jobdata);
    console.log("🚀 ~ file: JobListingsByCompany.tsx:104 ~ postJob ~ dwnCreateJobPost:", dwnCreateJobPost)

    toast({
      title: "Job Listing was created!",
      //description: `Couldn't find your dwn record`,
    });
  };
  console.log("🚀 ~ file: JobListingsByCompany.tsx:113 ~ postJob ~ postJob:", postJob)

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
      <Dialog >
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
           {/* <DialogClose asChild> */}
           {/* TODO need to submiot properly and close dialog after */}
              <Button type="submit" onClick={postJob}>
                Create New Listing
              </Button>

            {/* </DialogClose>*/}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
