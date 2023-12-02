import type {ColumnDef} from "@tanstack/react-table";
import {flexRender, getCoreRowModel, useReactTable,} from "@tanstack/react-table";
import type {FC} from "react";
import {Suspense, useMemo, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Link, useParams} from "react-router-dom";
import {dwnGetCompanyJobs, dwnReadSelfProfile, dwnCreateAndSendJApplicationReplyingToJob} from "./lib/utils";
import {useRecoilValue} from "recoil";
import { supabaseClient, user } from "@/lib/common.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";

// type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
//   jobpostcount: number;
//   dwnname: string;
//   did: string;
// };
type RowData = any;

export const DwnJobListingsRWOCompanyListings: FC = () => {
  const { companyDid } = useParams();
  const [applyMessage, setApplyMessage] = useState<string>("");
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      // {
      //   header: "Record ID",
      //   accessorKey: "record_id",
      // },
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Apply",
        accessorKey: "id",
        cell: (value) => (
          <Dialog 
            >
          
          <DialogTrigger asChild>
              <Button >Apply</Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                        <DialogTitle>Apply for the Company</DialogTitle>
                        <DialogDescription>
                          You are applying for a job posted by {value.row.original.dwnname}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            My Email
                          </Label>
                          <Label className="text-center">
                            {user?.email}
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Message
                          </Label>
                          <Input
                            id="text"
                            className="col-span-3"
                            onChange={(e) => setApplyMessage(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
          
                          const sendApplication = async () => {
                            if (applyMessage)
                            //TODO add proper params
                              await dwnCreateAndSendJApplicationReplyingToJob(value.row.original.did, applyMessage, value.row.original.record_id);
                          };
          
                          sendApplication();
                        }}>Submit Application</Button>
                      </DialogFooter>
            </DialogContent>
          </Dialog>
        ),
      },
    ],
    [],
  );
  const company = useRecoilValue(dwnReadSelfProfile({ did: companyDid }));
  const listings = useRecoilValue(dwnGetCompanyJobs({ did: companyDid }));

  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!listings) return <></>;
  if (!companyDid) return <>Accessed route without a DID</>; //TODO This might throw an error

  console.log("listings", listings);
  return (
    <Suspense fallback={<div>Loading whale types...</div>}>
      <h1>{company?.name} Job Listings</h1>
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
    </Suspense>
  );
};
