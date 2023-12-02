import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseClient } from "@/lib/common.ts";
import { Link, useParams } from "react-router-dom";

import { Database } from "@/__generated__/supabase-types.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";
import { protocols } from "@/lib/protocols.ts";
import { SessionContext } from "@/contexts/SessionContext.tsx";

type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
  jobpostcount: number;
  dwnname: string;
  did: string;
};

//TODO Add pagination ... na   don't worry its a hackathon
export const JobListings: FC = () => {
  const { companyDid } = useParams();
  const { session } = useContext(SessionContext);
  const { web5Client } = useRecoilValue(web5ConnectSelector);
  const [listings, setListings] = useState<Array<RowData>>([]);
  const [applyMessage, setApplyMessage] = useState<string>("");

  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "DID",
        accessorKey: "did",
        cell: ({ getValue }) => getValue<string>().substring(0, 32),
      },
      {
        header: "Name",
        accessorKey: "dwnname",
      },
      {
        header: "Apply",
        accessorKey: "id",
        cell: (value) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Apply</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Apply for the Company</DialogTitle>
                <DialogDescription>
                  You are applying for a job posted by{" "}
                  {value.row.original.dwnname}
                </DialogDescription>
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
                      if (applyMessage)
                        await web5Client.dwnCreateAndSendJApplication(
                          value.row.original.did,
                          applyMessage,
                        );
                    };

                    sendApplication();
                  }}
                >
                  Submit Application
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ),
      },
      {
        header: "Jobs",
        accessorKey: "jobpostcount",
        cell: ({ row }) => (
          <Link to={`/listings/company/${row.getValue("did")}`}>
            Go to listings ({row.getValue("jobpostcount")})
          </Link>
        ),
      },
    ],
    [],
  );

  //const formattedList = listings.map((x) => {return {...x, did : x.did.substring(0, 32)}});

  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const fetchData = async () => {
      const did_db_table = "dwn_did_registry_2";

      const { data, error } = await supabaseClient
        .from(did_db_table)
        .select("*");

      if (data) {
        const promises = data.map(async (row) => {
          console.log("Reading data from, ", row.did);
          const iName = await web5Client.dwnReadOtherDWN(
            row.did,
            protocols["selfProfileProtocol"],
          );
          const dwnName = iName && iName.name ? iName.name : "";

          console.debug("Finished fetching self profile, fetching jobs");
          const iJobList = await web5Client.dwnQueryOtherDWNByProtocol(
            row.did,
            protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
          );
          const jobPostCount =
            iJobList && iJobList.length ? iJobList.length : 0;

          return {
            ...row,
            jobpostcount: jobPostCount,
            dwnname: dwnName,
            did: row.did.substring(0, 32),
          };
        });

        const newdata = await Promise.all(promises);
        setListings(newdata);
      }
      if (error) {
        throw new Error(error.message);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>DWN Job Listings</h1>
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
    </>
  );
};
