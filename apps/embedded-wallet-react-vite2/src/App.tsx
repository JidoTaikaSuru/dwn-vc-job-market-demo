import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { JobListings } from "@/components/JobListings.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { JobListingDrilldown } from "@/components/JobListingDrilldown.tsx";
import { DwnJobListings } from "./components/DwnJobListings";
import { DwnJobListingsRWO } from "./components/DwnJobListingsRWO";

import { DwnJobListingDrilldown } from "./components/DwnJobListingDrilldown";
import UpdateProfile from "./components/UpdateProfile";
import { PostJob } from "./components/PostJob";
import { DwnJobListingsRWOCompanyListings } from "@/components/DwnJobListingsRWOCompanyListings.tsx";
import { DwnMyJobs } from "./components/DwnMyJobs";

const router = createBrowserRouter([
  {
    path: "/",
    element: <JobListings />,
  },
  {
    path: "/listing/:listingId",
    element: <JobListingDrilldown />,
  },
  {
    path: "/dwnListings",
    element: <DwnJobListings />,
  },
  {
    path: "/dwnListings/:employerDid",
    element: <DwnJobListingDrilldown />,
  },
  {
    path: "/dwnListingsRWO",
    element: <DwnJobListingsRWO />,
  },
  {
    path: "/dwnListingsRWO/:companyDid",
    element: <DwnJobListingsRWOCompanyListings />,
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
