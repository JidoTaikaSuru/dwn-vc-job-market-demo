import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { JobListingDrilldown } from "@/components/JobListingDrilldown.tsx";
import { Companies } from "./components/Companies.tsx";
import UpdateProfile from "./components/UpdateProfile";
import { JobListingsByCompany } from "@/components/JobListingsByCompany.tsx";
import { DwnMyJobs } from "./components/DwnMyJobs";
import { SupabaseJobListings } from "@/components/experiments/SupabaseJobListings.tsx";
import { Suspense } from "react";
import { UserProfile } from "@/components/UserProfile.tsx";
import { SetupDwn } from "@/components/SetupDwn.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Companies />,
  },
  {
    path: "/listings",
    element: <Companies />,
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
    path: "/dwnMyJobs",
    element: <DwnMyJobs />,
  },
  {
    path: "/profile",
    element: <UserProfile />,
  },
  {
    path: "/playground",
    element: <SetupDwn />,
  },
]);

function App() {
  return (
    <SessionContextProvider>
      <Navbar />
      <div className={"container mx-auto"}>
        <RequireUserLoggedIn>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </RequireUserLoggedIn>
      </div>
    </SessionContextProvider>
  );
}

export default App;
