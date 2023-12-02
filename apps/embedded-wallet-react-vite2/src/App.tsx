import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { JobListingDrilldown } from "@/components/JobListingDrilldown.tsx";
import { JobListings } from "./components/JobListings.tsx";
import UpdateProfile from "./components/UpdateProfile";
import { PostJob } from "./components/PostJob";
import { JobListingsByCompany } from "@/components/JobListingsByCompany.tsx";
import { DwnMyJobs } from "./components/DwnMyJobs";
import { SupabaseJobListings } from "@/components/experiments/SupabaseJobListings.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <JobListings />,
  },
  {
    path: "/listings",
    element: <JobListings />,
  },
  {
    path: "/listings/supabase",
    element: <SupabaseJobListings />,
  },
  {
    path: "/listings/view/:listingId",
    element: <JobListingDrilldown />,
  },
  {
    path: "/listings/company/:companyDid",
    element: <JobListingsByCompany />,
  },
  {
    path: "/updateProfile",
    element: <UpdateProfile />,
  },
  {
    path: "/postJob",
    element: <PostJob />,
  },
  {
    path: "/dwnMyJobs",
    element: <DwnMyJobs />,
  },
]);

function App() {
  return (
    <SessionContextProvider>
      <Navbar />
      <div className={"container mx-auto"}>
        <RequireUserLoggedIn>
          <RouterProvider router={router} />
        </RequireUserLoggedIn>
      </div>
    </SessionContextProvider>
  );
}

export default App;
