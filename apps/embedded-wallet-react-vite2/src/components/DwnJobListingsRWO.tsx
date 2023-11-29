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
import { supabaseClient , web5 , myDid } from "@/lib/common.ts";
import { Link } from "react-router-dom";
import { dwnQueryOtherDWN, dwnReadOtherDWN, jobPostThatCanTakeApplicationsAsReplyProtocol, selfProfileProtocol } from "./lib/utils";

const columns: ColumnDef<{ id: string; did: string; label: string }>[] = [
  {
    header: "DID",
    accessorKey: "did"
  },
  {
    header: "Name",
    accessorKey: "dwnname",
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

//TODO Add pagination ... na   don't worry its a hackathon
export const DwnJobListingsRWO: FC = () => {
  const [listings, setListings] = useState<
    { id: string; label: string; did: string, jobpostcount:number, dwnname:string }[]
  >([]);

  //const formattedList = listings.map((x) => {return {...x, did : x.did.substring(0, 32)}});
  console.log("🚀 ~ file: DwnJobListingsRWO.tsx:48 ")
  
  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    const fetchData = async () => {
      /* const { data, error } = await supabaseClient
        .from("job_listings")
        .select("title,company,id"); */

        
      const did_db_table='dwn_did_registry_2';

      const { data, error } = await supabaseClient  //TODO generate supabase types
      .from(did_db_table)
      .select('*')
      console.log("🚀 ~ file: DwnJobListingsRWO.tsx:65 ~ fetchData ~ error:", error)


      if(data ){

          if( web5 && myDid) //wnat build to leave me alone
            1==1;

          let newdata = [];
          for (let i = 0; i < data.length; i++) { //Getting most up to date job listing from each DWN  ( one might want to cache this in the search engine so not everyone has to ask all the DWN's all the time.  )
                const row = data[i];
                const i_name = await dwnReadOtherDWN(row.did,selfProfileProtocol)
                let dwnname ="";
                if  (i_name && i_name.name )
                    dwnname=i_name.name 
                const i_job_list =  await dwnReadOtherDWN(row.did,jobPostThatCanTakeApplicationsAsReplyProtocol)
                let jobpostcount =0;
                if(i_job_list && i_job_list.length && i_job_list.length>0)
                  jobpostcount=i_job_list.length;

                newdata.push({...row,jobpostcount:jobpostcount, dwnname:dwnname , did:row.did.substring(0, 32)  })
          } 

          setListings(newdata); 
        }
            if (error) {
              throw new Error(error.message);
            }
          
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
