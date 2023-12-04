import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  dwnQueryOtherDWNByProtocolSelector,
  dwnReadOtherDWNSelector,
  web5ConnectSelector,
} from "@/lib/web5Recoil.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from "react-identicons";
import { GenericTable } from "@/components/GenericTable.tsx";

type RowData = any;

export const CompanyJobListings: FC = () => {
  const { companyDid } = useParams();
  if (!companyDid) return <>Accessed route without a DID</>;
  return <CompanyJobListingsTable companyDid={companyDid} />;
};
export const CompanyJobListingsTable: FC<{
  companyDid: string;
  concealHeader?: boolean;
}> = ({ companyDid, concealHeader = false }) => {
  const { web5Client, myDid, protocols } = useRecoilValue(web5ConnectSelector);
  const company = useRecoilValue(
    dwnReadOtherDWNSelector({
      did: companyDid || "",
      protocol: protocols["selfProfileProtocol"],
    }),
  );

  const listings = useRecoilValue(
    dwnQueryOtherDWNByProtocolSelector({
      did: companyDid || "",
      protocol: protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
    }),
  );
  console.debug(`job listings for company ${companyDid}`, listings);

  const [open, setOpen] = useState<boolean>(false);

  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Id",
        cell: ({row}) => (
          <Link
            to={`/listings/view?applicationRecordId=${row.original.id}&companyDid=${companyDid}`}
            className="text-blue-500"
          >
           {`${row.original.id}`.substring(0, 32) + "..." }
          </Link>
        ),
      },
      {
        header: "Title",
        cell: ({ row }) => row.original.data.title || row.original.data.name, //TODO clean up legacy data
      },
      {
        header: "Created",
        accessorKey: "data.created_at",
      },
      {
        header: "",
        accessorKey: "id",
        cell: (value) => (
          <Link
            to={`/listings/view?applicationRecordId=${value.row.original.id}&companyDid=${companyDid}`}
            className="text-blue-500"
          >
            <Button variant="outline">Apply</Button>
          </Link>
        ),
      },
    ],
    [],
  );

  console.log("LISTINGS", listings, "COMPANY", company, "DID", companyDid);

  const table = useReactTable({
    columns,
    data: listings || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (!listings) return <></>;
  if (!companyDid) return <>Accessed route without a DID</>; //TODO This might throw an error

  return (
    <>
      {!concealHeader && (
        <div className="flex mt-5 mb-5 gap-5 ">
          <Identicon className="mt-2" string={company?.did} size={40} />
          <h1>Job Listings for {company?.name}</h1>
        </div>
      )}
      <div className="rounded-md border">
        <GenericTable table={table} columns={columns} />
      </div>
    </>
  );
};
