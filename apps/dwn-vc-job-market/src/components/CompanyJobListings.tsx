import type { ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore https://github.com/doke-v/react-identicons/issues/40
import Identicon from 'react-identicons';
import { GenericTable } from '@/components/GenericTable.tsx';
import { restClient } from '@/lib/client/rest/client.ts';

type RowData = any;

export const CompanyJobListings: FC = () => {
  const { companyDid } = useParams();
  if (!companyDid) return <>Accessed route without a DID</>;
  return <CompanyJobListingsTable companyId={companyDid} />;
};

export const CompanyJobListingsTable: FC<{
  companyId: string;
  concealHeader?: boolean;
}> = ({ companyId, concealHeader = false }) => {
  const company = useRecoilValue(restClient.companies.getCompanySelector(companyId))
  const listings = useRecoilValue(restClient.jobListings.searchJobListingsSelector({company: companyId}))


  console.debug(`job listings for company ${companyId}`, listings);


  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Id",
        cell: ({row}) => (
          <Link
            to={`/listings/view?applicationRecordId=${row.original.id}&companyDid=${companyId}`}
            className="text-blue-500"
          >
           {`${row.original.id}`.substring(0, 32) + "..." }
          </Link>
        ),
      },
      {
        header: "Title",
        cell: ({ row }) => row.original.title || row.original.name, //TODO clean up legacy data
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
            to={`/listings/view?applicationRecordId=${value.row.original.id}&companyDid=${companyId}`}
            className="text-blue-500"
          >
            <Button variant="outline">Apply</Button>
          </Link>
        ),
      },
    ],
    [],
  );

  console.log("LISTINGS", listings, "COMPANY", company, "DID", companyId);

  const table = useReactTable({
    columns,
    data: listings || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (!listings) return <></>;
  if (!companyId) return <>Accessed route without a DID</>; //TODO This might throw an error

  return (
    <>
      {!concealHeader && (
        <div className="flex mt-5 mb-5 gap-5 ">
          <Identicon className="mt-2" string={company?.id} size={40} />
          <h1>Job Listings for {company?.name}</h1>
        </div>
      )}
      <div className="rounded-md border">
        <GenericTable table={table} columns={columns} />
      </div>
    </>
  );
};
