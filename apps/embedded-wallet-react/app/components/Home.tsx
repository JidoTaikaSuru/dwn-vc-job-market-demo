import type { FC } from "react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { RequireUserLoggedIn } from "~/components/RequireUserLoggedIn";
import { InternalEmbeddedWalletDemo } from "~/components/InternalEmbeddedWalletDemo";
import { SupabaseCredentialManager } from "~/lib/client";
import type { Database } from "~/__generated__/supabase-types";
import { WalletProvider } from "~/context/WalletContext";
import { JobListings } from "~/components/JobListings";

export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0",
);

export const credentialStore = new SupabaseCredentialManager();
let hydrating = true;

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

export const Home: FC = () => {
  return (
    <div>
      <div className="flex items-center mt-8 justify-center">
        {useHydrated() ? (
          <>
            <WalletProvider>
              <RequireUserLoggedIn>
                <InternalEmbeddedWalletDemo />
                <JobListings />
                {/*<RenderCredentials />*/}
              </RequireUserLoggedIn>
            </WalletProvider>
          </>
        ) : (
          <>Client-side code is loading</>
        )}
      </div>
    </div>
  );
};
