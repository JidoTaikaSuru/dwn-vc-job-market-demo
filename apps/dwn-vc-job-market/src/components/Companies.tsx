import type { ColumnDef } from '@tanstack/react-table';
import { FilterFn, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database } from '@/__generated__/supabase-types.ts';
import { useRecoilValue } from 'recoil';
import { Input } from '@/components/ui/input.tsx';
import { GenericTable } from '@/components/GenericTable.tsx';
import { TypographyH2 } from './Typography';
import { restClient } from '@/lib/client/rest/client.ts';

type RowData = Database["public"]["Tables"]["dwn_did_registry_2"]["Row"] & {
  jobpostcount: number;
  // dwnname: string;
  name: string;
  // did: string;
  id: string;
  fullDid: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// const fetchCompanies = selector({
//   key: "fetchCompanies",
//   get: async ({ get }) => {
//     const { web5Client, protocols } = get(web5ConnectSelector);
//     const did_db_table = "dwn_did_registry_2";
//     const { data, error } = await supabaseClient.from(did_db_table).select("*");
//
//     if (data) {
//       console.log("data123", data);
//       const waitGroup: Promise<RowData>[] = data.map(async (row) => {
//         //Getting most up to date job listing from each DWN  ( one might want to cache this in the search engine so not everyone has to ask all the DWN's all the time.  )
//         console.log("rowDIDROW", row);
//         console.log("Reading data from, ", row.did);
//         const companyProfile = await web5Client.dwnReadOtherDWN(
//           row.did,
//           protocols["selfProfileProtocol"],
//         );
//
//         console.log("iname", companyProfile, "rowDid", row.did);
//         console.debug("Finished fetching self profile, fetching jobs");
//         const iJobList = await web5Client.dwnQueryOtherDWNByProtocol(
//           row.did,
//           protocols["jobPostThatCanTakeApplicationsAsReplyProtocol"],
//         );
//         console.debug("Finished fetching jobs", iJobList);
//         let jobPostCount = 0;
//         if (iJobList && iJobList.length && iJobList.length > 0) {
//           jobPostCount = iJobList.length;
//         }
//         console.log("rowDid", row.did);
//         return {
//           ...row,
//           jobpostcount: jobPostCount,
//           dwnname: companyProfile?.name,
//           industry: companyProfile?.industry,
//           location: companyProfile?.country,
//           did: row.did.substring(0, 32) + "...",
//           fullDid: row.did,
//         };
//       });
//       const resultingData = await Promise.all(waitGroup);
//       console.log("resultingData", resultingData);
//       return resultingData;
//     }
//     if (error) {
//       throw new Error(error.message);
//     }
//   },
// });

//TODO Add pagination ... na   don't worry its a hackathon
export const Companies: FC = () => {
  // const listings = useRecoilValue(fetchCompanies);
  const companies = useRecoilValue(restClient.companies.getCompaniesSelector)
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      // {
      //   header: "DID",
      //   accessorKey: "did",
      //   cell: ({ row }) => {
      //     return (
      //       <Link to={`/profile/${row.original.fullDid}`}>
      //         {row.original.did}
      //       </Link>
      //     );
      //   },
      // },
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => {
          return (
            <Link to={`/profile/${row.original.id}`}>
              {row.original.id}
            </Link>
          );
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => {
          return (
            // <Link to={`/profile/${row.original.fullDid}`}>
            <Link to={`/profile/${row.original.id}`}>
              {row.original.name}
            </Link>
          );
        },
      },
      {
        header: "Location",
        accessorKey: "location",
      },
      {
        header: "Industry",
        accessorKey: "industry",
      },
      {
        header: "Positions",
        accessorKey: "jobpostcount",
        cell: ({ row }) => {
          console.log("row in cell", row);
          return (
            <Link to={`/listings/company/${row.original.id}`}>
              View Positions ({row.original.jobpostcount})
            </Link>
          );
        },
      },
    ],
    [],
  );

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const table = useReactTable({
    columns,
    data: companies || [],
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-5 space-y-5">
      <div className={"flex gap-20 items-center justify-bottom"}>
        <TypographyH2>Jobs Listing</TypographyH2>

        <Input
          type="text"
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="ml-auto"
          style={{width: "500px"}}
        />
      </div>
      <div className="rounded-md border">
        <GenericTable table={table} columns={columns} />
      </div>
    </div>
  );
};
