import type { FC } from "react";
import { useContext, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import {
  DeviceKeyContext,
  RequireUserLoggedIn,
} from "~/components/RequireUserLoggedIn";
import { CryptoLibSmokeTest } from "~/components/CryptoLibSmokeTest";

export const supabaseClient = createClient(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0"
);

let hydrating = true;

/**
 * Return a boolean indicating if the JS has been hydrated already.
 * When doing Server-Side Rendering, the result will always be false.
 * When doing Client-Side Rendering, the result will always be false on the
 * first render and true from then on. Even if a new component renders it will
 * always start with true.
 *
 * Example: Disable a button that needs JS to work.
 * ```tsx
 * let hydrated = useHydrated();
 * return (
 *   <button type="button" disabled={!hydrated} onClick={doSomethingCustom}>
 *     Click me
 *   </button>
 * );
 * ```
 */
export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

export const InternalIframeDemo: FC = () => {
  const { wallet } = useContext(DeviceKeyContext);
  return (
    <Box>
      <Typography>Parent container</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 800,
          maxHeight: 800,
          border: "1px solid black",
        }}
      >
        {useHydrated() ? (
          <>
            {/*{*/}
            {/*<Frame>*/}
            {/*<FrameContextConsumer>*/}
            {/*    {*/}
            {/*// Callback is invoked with iframe's window and document*/}
            {/*instances*/}
            {/*({document, window}) => {*/}
            {/*    return (*/}
            <RequireUserLoggedIn>
              <div style={{ display: "flex" }}>
                signed in with wallet address: {wallet?.address}
              </div>
            </RequireUserLoggedIn>
            {/*)*/}
            {/*}*/}
            {/*}*/}
            {/*</FrameContextConsumer>*/}
            {/*</Frame>*/}
              <hr/>
            <CryptoLibSmokeTest />
            {/*}*/}
          </>
        ) : (
          <>Client-side code is loading</>
        )}
        ;
      </Box>
    </Box>
  );
};
