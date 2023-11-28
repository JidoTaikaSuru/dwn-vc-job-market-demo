import type { FC } from "react";
import { useEffect, useState } from "react";
import { credentialStore, supabaseClient } from "@/lib/common";
import { VerifiableCredential } from "@veramo/core";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { RequestReissueButton } from "@/components/RequestReissueButton.tsx";

type CredentialColumns = {
  id: string;
  type: string;
  issued: Date;
  expires: Date;
  validForJob: string;
};
const columns: ColumnDef<CredentialColumns>[] = [
  {
    header: "id",
    accessorKey: "verifiableCredential.id",
  },
  {
    header: "Type",
    accessorKey: "verifiableCredential.type.1",
  },
  {
    header: "Issued",
    accessorKey: "verifiableCredential.issuanceDate",
  },
  {
    header: "Expires",
    accessorKey: "verifiableCredential.expirationDate",
  },
  {
    header: "Valid for job",
    // accessorKey: "id",
  },
];

export const RenderCredentials: FC = () => {
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  console.log("credentials", credentials);
  const table = useReactTable({
    columns,
    data: credentials,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const fetchData = async () => {
      console.log("Getting credentials ", new Date());
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }
      const credentials = await credentialStore.getCredentials({
        jwt: data.session?.access_token || "",
      });
      setCredentials(credentials);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <h5>Credentials</h5>
      <p>
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
      </p>
      <p>{error}</p>
      <RequestReissueButton />
    </>
  );
};
