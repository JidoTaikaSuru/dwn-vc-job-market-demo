import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { SupabaseJobListingDrilldown } from "@/components/SupabaseJobListingDrilldown.tsx";
import { Companies } from "./components/Companies.tsx";
import UpdateProfile from "./components/UpdateProfile";
import { CompanyJobListings } from "@/components/CompanyJobListings.tsx";
import { SupabaseJobListings } from "@/components/SupabaseJobListings.tsx";
import { Suspense } from "react";
import { UserProfile } from "@/components/UserProfile.tsx";
import { AdminPlayground } from "@/components/AdminPlayground.tsx";
import { TypographyH2 } from "@/components/Typography.tsx";
import { DwnJobListingDrilldown } from "@/components/DwnJobListingDrilldown.tsx";

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
            <Link to="/listings/view?companyDid=&applicationRecordId=">
              /listings/view?companyDid=&applicationRecordId=
            </Link>
          </li>
          <li>
            <Link to="/listings/supabase">/listings/supabase</Link>
          </li>
          <li>
            <Link to="/listings/supabase/view/:supabaseListingId">
              /listings/supabase/view/:supabase_listing_id
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
    path: "/listings/view",
    element: <DwnJobListingDrilldown />,
  },
  {
    path: "/listings/supabase",
    element: <SupabaseJobListings />,
  },
  {
    path: "/listings/supabase/view/:listingId",
    element: <SupabaseJobListingDrilldown />,
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
    path: "/profile/:userDid",
    element: <UserProfile />,
  },
  {
    path: "/playground",
    element: <AdminPlayground />,
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
