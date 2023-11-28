import "./App.css";
import { SessionContextProvider } from "@/contexts/SessionContext.tsx";
import Navbar from "@/components/Navbar.tsx";
import { JobListings } from "@/components/JobListings.tsx";
import { RequireUserLoggedIn } from "@/components/RequireUserLoggedIn.tsx";

function App() {
  return (
    <SessionContextProvider>
      <Navbar />
      <RequireUserLoggedIn>
        <JobListings />
      </RequireUserLoggedIn>
    </SessionContextProvider>
  );
}

export default App;
