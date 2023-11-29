import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { useEffect, useState } from "react";
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

const columns: ColumnDef<{ id: string; did: string; label: string }>[] = [
  {
    header: "DID",
    accessorKey: "did"
  },
  {
    header: "Label",
    accessorKey: "label",
  },
  {
    header: "Apply",
    accessorKey: "id",
    cell: (value) => (
      <Link to={`/dwnListings/${value.row.original.did}`} className="text-blue-500">
        Apply
      </Link>
    ),
  },
];

//TODO Add pagination
export const DwnJobListings: FC = () => {
  const [listings, setListings] = useState<
    { id: string; label: string; did: string }[]
  >([]);

  const formattedList = listings.map((x) => {return {id : x.id, label : x.label, did : x.did.substring(0, 32)}});

  const table = useReactTable({
    columns,
    data: formattedList,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const fetchData = async () => {
      /* const { data, error } = await supabaseClient
        .from("job_listings")
        .select("title,company,id"); */

        
  const did_db_table='dwn_did_registry_2';

const { data, error } = await supabaseClient
.from(did_db_table)
.select('*')

      if (error) {
        throw new Error(error.message);
      }
      setListings(data);
    };
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
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