import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { JobListingDrilldown } from "@/components/JobListingDrilldown.tsx";
import { Companies } from "./components/Companies.tsx";
import UpdateProfile from "./components/UpdateProfile";
import { CompanyJobListings } from "@/components/CompanyJobListings.tsx";
import { SupabaseJobListings } from "@/components/experiments/SupabaseJobListings.tsx";
import { Suspense } from "react";
import { UserProfile } from "@/components/UserProfile.tsx";
import { SetupDwn } from "@/components/SetupDwn.tsx";
import { TypographyH2 } from "@/components/Typography.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className={"flex-col"}>
        <TypographyH2>Directory listing</TypographyH2>
        <ul>
          <li>
            <Link to="/listings">/listings</Link>
          </li>
          <li>
            <Link to="/listings/supabase">/listings/supabase</Link>
          </li>
          <li>
            <Link to="/listings/view/:supabaseListingId">
              /listings/view/:supabase_listing_id
            </Link>
          </li>
          <li>
            <Link to="/listings/company/:companyDid">
              /listings/company/:companyDid
            </Link>
          </li>
          <li>
            <Link to="/updateProfile">/updateProfile</Link>
          </li>
          <li>
            <Link to="/dwnMyJobs">/dwnMyJobs</Link>
          </li>
          <li>
            <Link to="/profile">/profile</Link>
          </li>
          <li>
            <Link to="/profile/:userDid">/profile/:userDid</Link>
          </li>
          <li>
            <Link to="/playground">/playground</Link>
          </li>
        </ul>
      </div>
    ),
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
    element: <CompanyJobListings />,
  },
  {
    path: "/updateProfile",
    element: <UpdateProfile />,
  },
  {
    path: "/profile",
    element: <UserProfile />,
  },
  {
    path: "/profile/:userDid",
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
