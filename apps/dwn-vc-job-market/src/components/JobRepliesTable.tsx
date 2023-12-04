import { useRecoilValue } from "recoil";
import { dwnQuerySelfByProtocolSelector } from "@/lib/web5Recoil.ts";
import { protocols } from "@/lib/protocols.ts";
import { FC, useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { GenericTable } from "@/components/GenericTable.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Frame from "react-frame-component";

type RowData = any;

export const JobRepliesTable: FC<{
  companyDid: string;
  applicationRecordId: string;
}> = () => {
  const jobReplies = useRecoilValue(
    dwnQuerySelfByProtocolSelector({
      protocol: protocols["jobApplicationSimpleProtocol"],
    }),
  );

  const demoResume = `
  # COOL HEADER BRO
  ## WOW
  ### SO COOL
  * Testing
  * Testing
  \`\`\`testing\`\`\`
    
    
    just some block of text
  `;
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "data.name",
        cell: ({ row }) => {
          return (
            <Link to={`/profile/${row.original.record.author}`}>
              {row.original.data.name}
            </Link>
          );
        },
      },
      {
        header: "E-mail",
        accessorKey: "data.email",
      },
      {
        header: "Resume",
        accessorKey: "data.description",
        cell: ({ row }) => {
          return (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"outline"}>View Resume</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Resume for {row.original.data.name}</DialogTitle>
                </DialogHeader>
                {/*TODO When things look weird in markdown, add markdown classes to index.css to get rid of shadcn styling*/}
                {/*For now put into iframe to clear styles*/}
                <Frame>
                  <ReactMarkdown remarkPlugins={[gfm]}>
                    {/*{demoResume}*/}
                    {row.original.data.resume || row.original.data.description}
                  </ReactMarkdown>
                </Frame>
              </DialogContent>
            </Dialog>
          );
        },
      },
    ],
    [],
  );

  // RenderMarkdown
  const table = useReactTable({
    columns,
    data: jobReplies || [],
    getCoreRowModel: getCoreRowModel(),
  });
  console.log("jobReplies", jobReplies);

  return <GenericTable table={table} columns={columns} />;
};
