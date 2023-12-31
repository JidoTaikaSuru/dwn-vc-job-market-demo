import { AdminPlayground } from '@/components/AdminPlayground.tsx';
import { CompanyJobListings } from '@/components/CompanyJobListings.tsx';
import { DwnJobListingDrilldown } from '@/components/DwnJobListingDrilldown.tsx';
import Navbar from '@/components/Navbar.tsx';
import { RequireUserLoggedIn } from '@/components/RequireUserLoggedIn.tsx';
import { SupabaseJobListingDrilldown } from '@/components/experiments/SupabaseJobListingDrilldown.tsx';
import { SupabaseJobListings } from '@/components/experiments/SupabaseJobListings.tsx';
import { TypographyH2 } from '@/components/Typography.tsx';
import { UserProfileDwn } from '@/components/experiments/UserProfileDwn.tsx';
import { SessionContextProvider } from '@/contexts/SessionContext.tsx';
import { Suspense } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import './App.css';
import { Companies } from './components/Companies.tsx';
import Footer from './components/Footer.tsx';
import UpdateProfile from './components/UpdateProfile';
import { UserProfile } from '@/components/UserProfile.tsx';

const router = createBrowserRouter([
  {
    path: "/site-map",
    element: (
      <div className={"flex-col"}>
        <TypographyH2>Directory listing</TypographyH2>
        <ul>
          <li>
            <Link to="/listings">Companies (DWN)</Link>
          </li>
          <li>
            <Link to="/listings/view?companyDid=&applicationRecordId=">
              Job Listing Drilldown (demo)
            </Link>
          </li>
          <li>
            <Link to="/listings/supabase">Companies (Supabase)</Link>
          </li>
          <li>
            <Link to="/listings/supabase/view/:supabase_listing_id">
              Job Listing Drilldown (Supabase, demo)
            </Link>
          </li>
          <li>
            <Link to="/listings/company/:companyDid">
              Company Drilldown (demo)
            </Link>
          </li>
          <li>
            <Link to="/profile/:userDid">User Profile</Link>
          </li>
          <li>
            <Link to="/playground">Troubleshooting/Admin</Link>
          </li>
        </ul>
      </div>
    ),
  },
  {
    path: "/",
    element: <Companies />,
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
    path: "/listings/rest",
    element: <SupabaseJobListings />,
  },
  {
    path: "/listings/rest/view/:listingId",
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
    path: "/profile/dwn/:userDid",
    element: <UserProfileDwn />,
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
      <Footer />
    </SessionContextProvider>
  );
}

export default App;
