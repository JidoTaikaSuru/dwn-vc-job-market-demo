import type { FC } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { InternalEmbeddedWalletDemo } from "~/components/InternalEmbeddedWalletDemo";
import { useFrame } from "react-frame-component";
import { RenderCredentials } from "~/components/RenderCredentials";
import { useWallet } from "~/context/WalletContext";
import {
  convertStringToCryptoKey,
  decryptPrivateKeyGetWallet,
} from "~/lib/cryptoLib";
import { supabaseClient } from "~/lib/common";
import { useHydrated } from "~/components/RequireClientLoad";

export const InternalIframeDemo: FC = () => {
  const { isSignedIn } = useWallet();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [recievedMessage, setRecievedMessage] = useState("");
  const { address, setWallet, setIsSignedIn } = useWallet();

  const sendMessage = () => {
    console.log("iframe", iframeRef);

    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      "Hello son!",
      "http://localhost:3000",
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
  console.log("isSignedIn", isSignedIn);

  useEffect(() => {
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
      console.log("user nav", session);

      if (session) {
        console.log("navb", localStorage.getItem("deviceprivatekey"));
        // const user = session.user;
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();
        const { data: userRow } = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", user!.id)
          .maybeSingle();
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:344 ~ supabaseClient.auth.getSession ~ user:",
          userRow,
        );
        // const iv = crypto.getRandomValues(new Uint8Array(12));
        const deviceKey = localStorage.getItem("devicekey");
        const encryptedKey = await convertStringToCryptoKey(deviceKey!);
        console.log(
          "🚀 ~ file: RequireUserLoggedIn.tsx:356 ~ supabaseClient.auth.getSession ~ encryptedKey:",
          encryptedKey,
        );
        const exampleData = await decryptPrivateKeyGetWallet(
          userRow?.password_encrypted_private_key || "",
          encryptedKey,
          userRow?.iv || "",
        );
        // const  await logUserIntoApp
        console.log(
          "🚀 ~ file: LoginWithEmail.tsx:30 ~ login ~ exampleData:",
          exampleData,
        );
        setWallet(exampleData);
        // setLocalAccount(exampleData);
        setIsSignedIn(true);
        // setLoggedIn(true);
        setIsSignedIn(true);
      } else {
        // alert("Error Accessing User");
      }
    });
  }, []);

  return (
    <section>
      <h1>Parent container</h1>
      <div className="w-80">
        <button onClick={sendMessage}>Send message to child</button>
        <p className="break-words">received: {recievedMessage}</p>
      </div>
      {/* <OTPCard /> */}
      <div className="flex items-center -mt-16 justify-center">
        {useHydrated() ? (
          <>
            {/*{*/}
            {/* <Frame width={500} height={600} head={<Links />} ref={iframeRef}> */}
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
            {isSignedIn && (
              <>
                <InternalEmbeddedWalletDemo />
                <RenderCredentials />
              </>
            )}
            {/* </iframe> */}
            {/*)*/}
            {/*}*/}
            {/*}*/}
            {/* </FrameContextConsumer> */}
            {/* </Frame> */}
            {/*  <hr/>*/}
            {/*<CryptoLibSmokeTest />*/}
            {/*}*/}
          </>
        ) : (
          <>Client-side code is loading</>
        )}
      </div>
    </section>
  );
};
