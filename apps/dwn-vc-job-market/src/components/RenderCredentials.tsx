// import type { FC } from "react";
// import { useContext, useEffect, useState } from "react";
// import { credentialStore } from "@/lib/common";
// import { VerifiableCredential } from "@veramo/core";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table.tsx";
// import { RequestReissueButton } from "@/components/RequestReissueButton.tsx";
// import { SessionContext } from "@/contexts/SessionContext.tsx";
//
// type CredentialColumns = {
//   id: string;
//   type: string;
//   issued: Date;
//   expires: Date;
//   validForJob: string;
// };
// const columns: ColumnDef<CredentialColumns>[] = [
//   {
//     header: "id",
//     accessorKey: "verifiableCredential.id",
//   },
//   {
//     header: "Type",
//     accessorKey: "verifiableCredential.type.1",
//   },
//   {
//     header: "Issued",
//     accessorKey: "verifiableCredential.issuanceDate",
//   },
//   {
//     header: "Expires",
//     accessorKey: "verifiableCredential.expirationDate",
//   },
//   {
//     header: "Valid for job",
//     // accessorKey: "id",
//   },
// ];
//
// export const RenderCredentials: FC = () => {
//   const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
//   const { session } = useContext(SessionContext);
//
//   console.log("credentials", credentials);
//   const table = useReactTable({
//     columns,
//     data: credentials,
//     getCoreRowModel: getCoreRowModel(),
//   });
//
//   useEffect(() => {
//     const fetchData = async () => {
//       console.log("Getting credentials ", new Date());
//       const credentials = await credentialStore.getCredentials({
//         jwt: session?.access_token || "",
//       });
//       setCredentials(credentials);
//     };
//
//     fetchData();
//     const intervalId = setInterval(fetchData, 10000);
//     return () => clearInterval(intervalId);
//   }, []);
//
//   return (
//     <>
//       <h5>Credentials</h5>
//       <p>
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext(),
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext(),
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </p>
//       <RequestReissueButton />
//     </>
//   );
// };
//
// // const srMatches = pex.selectFrom(
// //     hasAccountPresentationDefinition,
// //     credentials,
// //     { holderDIDs: ["did:eth:null"] },
// // );
