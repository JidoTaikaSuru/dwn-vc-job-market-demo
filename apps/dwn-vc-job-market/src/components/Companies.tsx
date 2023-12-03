import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseClient } from "@/lib/common.ts";
import { Link } from "react-router-dom";
import { Database } from "@/__generated__/supabase-types.ts";
import { selector, useRecoilValue } from "recoil";
import { web5ConnectSelector } from "@/lib/web5Recoil.ts";

type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
  jobpostcount: number;
  dwnname: string;
  did: string;
  fullDid: string;
};

const fetchCompanies = selector({
  key: "fetchCompanies",
  get: async ({ get }) => {
    const { web5Client, protocols } = get(web5ConnectSelector);
    const did_db_table = "dwn_did_registry_2";
    const { data, error } = await supabaseClient.from(did_db_table).select("*");

    if (data) {
      console.log("data123", data);
      const waitGroup: Promise<RowData>[] = data.map(async (row) => {
        //Getting most up to date job listing from each DWN  ( one might want to cache this in the search engine so not everyone has to ask all the DWN's all the time.  )
        console.log("rowDIDROW", row);
        console.log("Reading data from, ", row.did);
        const iName = await web5Client.dwnReadOtherDWN(
          row.did,
          protocols["selfProfileProtocol"],
        );
        let dwnName = "";
        if (iName && iName.name) {
          dwnName = iName.name;
        }
        console.log("iname", iName, "rowDid", row.did);
        console.debug("Finished fetching self profile, fetching jobs");
        const iJobList = await web5Client.dwnQueryOtherDWNByProtocol(
          row.did,
          protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
        );
        console.debug("Finished fetching jobs", iJobList);
        let jobPostCount = 0;
        if (iJobList && iJobList.length && iJobList.length > 0) {
          jobPostCount = iJobList.length;
        }
        console.log("rowDid", row.did);
        return {
          ...row,
          jobpostcount: jobPostCount,
          dwnname: dwnName,
          did: row.did.substring(0, 32),
          fullDid: row.did,
        };
      });
      const resultingData = await Promise.all(waitGroup);
      console.log("resultingData", resultingData);
      return resultingData;
    }
    if (error) {
      throw new Error(error.message);
    }
  },
});

//TODO Add pagination ... na   don't worry its a hackathon
export const Companies: FC = () => {
  const listings = useRecoilValue(fetchCompanies);
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "DID",
        accessorKey: "did",
        cell: ({ row }) => {
          return (
            <Link to={`/profile/${row.original.fullDid}`}>
              {row.original.did}
            </Link>
          );
        },
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
    data: listings || [],
    getCoreRowModel: getCoreRowModel(),
  });
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
