import type { FC } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import { RequireUserLoggedIn } from "~/components/RequireUserLoggedIn";
import { InternalEmbeddedWalletDemo } from "~/components/InternalEmbeddedWalletDemo";
import Frame, { useFrame } from "react-frame-component";
import { Button } from "@/components/ui/button";
import { Links } from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import styles from "../tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [recievedMessage, setRecievedMessage] = useState("");

  const sendMessage = () => {
    console.log("iframe", iframeRef);

    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      "Hello son!",
      "http://localhost:3000"
    );
  };

  useEffect(() => {
    window!.addEventListener("message", function (e) {
      console.log("parent", e.data.address);

      if (e.origin !== "http://localhost:3000" || !e.data.address) return;
      setRecievedMessage("Got this message from child: " + e.data.address);
    });
  }, []);

  const { document: doc, window } = useFrame(); // <iframe ref="iframe" /> then this.$refs.iframe....
  console.log("🚀 ~ file: InternalIframeDemo.tsx:69 ~ doc:", doc, window);
  // we can replace useEffect by mounted in Vue
  useLayoutEffect(() => {
    if (iframeRef && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;

      // Clone and append stylesheets from the parent document to the iframe's head
      document.head
        .querySelectorAll('style, link[as="style"], link[rel="stylesheet"]')
        .forEach((style) => {
          const frameStyles = style.cloneNode(true);
          iframeDoc?.head.append(frameStyles);
        });

      // Insert the Tailwind CSS CDN script into the iframe's body using createElement
      const script = doc!.createElement("script");
      script!.src = "https://cdn.tailwindcss.com";

      iframeDoc?.body.appendChild(script!);
    }
  }, [iframeRef]);

  return (
    <Box>
      <Typography>Parent container</Typography>
      <div className="w-80">
        <button onClick={sendMessage}>Send message to child</button>
        <p className="break-words">received: {recievedMessage}</p>
      </div>

      <div className="flex items-center -mt-16 justify-center">
        {useHydrated() ? (
          <>
            {/*{*/}
            <Frame width={465} height={600} head={<Links />} ref={iframeRef}>
              {/* <iframe
              width="600"
              height="300"
              title="Child iframe"
              ref={iframeRef}
            > */}
              {/* <FrameContextConsumer> */}
              {/*    {*/}
              {/*// Callback is invoked with iframe's window and document*/}
              {/*instances*/}
              {/*({document, window}) => {*/}
              {/*    return (*/}
              <RequireUserLoggedIn>
                <InternalEmbeddedWalletDemo />
              </RequireUserLoggedIn>
              {/* </iframe> */}
              {/*)*/}
              {/*}*/}
              {/*}*/}
              {/* </FrameContextConsumer> */}
            </Frame>
            {/*  <hr/>*/}
            {/*<CryptoLibSmokeTest />*/}
            {/*}*/}
          </>
        ) : (
          <>Client-side code is loading</>
        )}
      </div>
    </Box>
  );
};
