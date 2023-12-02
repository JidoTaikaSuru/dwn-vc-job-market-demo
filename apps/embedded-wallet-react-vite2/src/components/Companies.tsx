import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseClient, user } from "@/lib/common.ts";
import { Link } from "react-router-dom";
import {
  dwnCreateAndSendJApplication,
  dwnQueryOtherDWNByProtocol,
  dwnReadOtherDWN,
  jobPostThatCanTakeApplicationsAsReplyProtocol,
  selfProfileProtocol,
} from "../lib/utils.ts";
import { Database } from "@/__generated__/supabase-types.ts";

type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
  jobpostcount: number;
  dwnname: string;
  did: string;
  fullDid: string;
};

//TODO Add pagination ... na   don't worry its a hackathon
export const Companies: FC = () => {
  const [listings, setListings] = useState<Array<RowData>>([]);

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
        header: "Positions",
        accessorKey: "jobpostcount",
        cell: ({ row }) => {
          console.log("row in cell", row);
          return (
            <Link to={`/listings/company/${row.original.fullDid}`}>
              View Positions ({row.original.jobpostcount})
            </Link>
          );
        },
      },
    ],
    [],
  );

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
        const newdata: Array<RowData> = [];

        for (let i = 0; i < data.length; i++) {
          //Getting most up to date job listing from each DWN  ( one might want to cache this in the search engine so not everyone has to ask all the DWN's all the time.  )
          const row = data[i];
          console.log("Reading data from, ", row.did);
          const iName = await dwnReadOtherDWN(row.did, selfProfileProtocol);
          let dwnName = "";
          if (iName && iName.name) {
            dwnName = iName.name;
          }
          console.debug("Finished fetching self profile, fetching jobs");
          const iJobList = await dwnQueryOtherDWNByProtocol(
            row.did,
            jobPostThatCanTakeApplicationsAsReplyProtocol,
          );
          console.debug("Finished fetching jobs", iJobList);
          let jobPostCount = 0;
          if (iJobList && iJobList.length && iJobList.length > 0) {
            jobPostCount = iJobList.length;
          }
          console.log("rowDid", row.did);
          newdata.push({
            ...row,
            jobpostcount: jobPostCount,
            dwnname: dwnName,
            did: row.did.substring(0, 32),
            fullDid: row.did,
          });
        }

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
      <h1>Companies</h1>
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
