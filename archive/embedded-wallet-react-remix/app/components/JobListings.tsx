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
import { Link, useRouteError } from "@remix-run/react";
import { json } from "@remix-run/node";
import { supabaseClient } from "~/lib/common";

const columns: ColumnDef<{ id: string; title: string; company: string }>[] = [
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Company",
    accessorKey: "company",
  },
  {
    header: "Apply",
    accessorKey: "id",
    cell: (value) => (
      <Link to={`/listing/${value.row.original.id}`} className="text-blue-500">
        Apply
      </Link>
    ),
  },
];

export function ErrorBoundary() {
  const error = useRouteError();
  console.log("errorBoundary", error);

  return (
    <div>Something went wrong: {/*{error?.message || "Unknown Error"}*/}</div>
  );
}

//TODO Add pagination
export const JobListings: FC = () => {
  const [listings, setListings] = useState<
    { id: string; title: string; company: string }[]
  >([]);
  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from("job_listings")
        .select("title,company,id");
      if (error) {
        throw json({ error: error.message });
      }

      setListings(data);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <h1>Job Listings</h1>
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
