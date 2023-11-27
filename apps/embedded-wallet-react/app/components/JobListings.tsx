// import {ColumnDef, getCoreRowModel, useReactTable} from "@tanstack/react-table";
// import {FC, useEffect, useState} from "react";
// import {Table} from "@/components/ui/table";
// import {supabaseClient} from "~/components/Home";
// import {ErrorBoundary} from "~/routes/listing.$listing";
// import {isRouteErrorResponse, useRouteError} from "@remix-run/react";
// import {json} from "@remix-run/node";
//
// const columns: ColumnDef<{ id:string, title: string; company: string }> = [
//   {
//     Header: "Title",
//     accessor: "title",
//   },
//   {
//     Header: "Company",
//     accessor: "company",
//   },
// ];
//
//
// export function ErrorBoundary() {
//     const error = useRouteError();
//     console.log("errorBoundary", error);
//
//     return (
//         <div>Something went wrong: {/*{error?.message || "Unknown Error"}*/}</div>
//     );
// }
//
// //TODO Add pagination
// export const JobListings: FC = () => {
//
//   const [listings, setListings] = useState<{id: string, title: string; company: string }[]>([]);
//   const table = useReactTable({
//       columns,
//       data: listings,
//       getCoreRowModel: getCoreRowModel(),})
//     useEffect(() => {
//         const fetchData = async () => {
//           const {data, error} = await supabaseClient.from("listings").select("title,company,id");
//           if(error) {
//               throw json({error: error.message})
//           }
//
//           setListings(data)
//         };
//
//         fetchData();
//         const intervalId = setInterval(fetchData, 10000);
//
//         return () => clearInterval(intervalId);
//       }, []);
//
//   return (
//     <div>
//       <h1>Job Listings</h1>
//       <Table>
//
//       </Table>
//     </div>
//           );
// };
