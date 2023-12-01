import type {ColumnDef} from "@tanstack/react-table";
import {flexRender, getCoreRowModel, useReactTable,} from "@tanstack/react-table";
import type {FC} from "react";
import {Suspense, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Link, useParams} from "react-router-dom";
import {dwnGetCompanyJobs, dwnReadSelfProfile} from "./lib/utils";
import {useRecoilValue} from "recoil";

// type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
//   jobpostcount: number;
//   dwnname: string;
//   did: string;
// };
type RowData = any;

export const DwnJobListingsRWOCompanyListings: FC = () => {
  const { companyDid } = useParams();
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
          <Link
            to={`/dwnListings/${value.row.original.did}`}
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
