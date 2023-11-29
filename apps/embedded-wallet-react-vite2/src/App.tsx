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
