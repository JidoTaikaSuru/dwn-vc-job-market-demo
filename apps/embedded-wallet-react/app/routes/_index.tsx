import type { MetaFunction } from "@remix-run/node";
import { RequireClientLoad } from "~/components/RequireClientLoad";
import { JobListings } from "~/components/JobListings";
import { SessionContextProvider } from "~/context/SessionContext";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <RequireClientLoad>
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <SessionContextProvider>
          <JobListings />
        </SessionContextProvider>
      </div>
    </RequireClientLoad>
  );
}
