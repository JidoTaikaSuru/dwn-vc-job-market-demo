import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import styles from "./tailwind.css";
import { LinksFunction } from "@remix-run/node";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EmbeddedWalletModal from "./components/WalletModal";
//
// export const logger = pino({
//   colorize: true, // colorizes the log output
//   translateTime: "SYS:standard", // formats timestamp
//   ignore: "pid,hostname", // hides pid and hostname from log messages
// });

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="flex w-screen items-center justify-between p-4 bg-fuchsia-200/50">
          {/*<IconButton edge="start" color="inherit" aria-label="home">*/}
          {/*  <HomeIcon />*/}
          {/*</IconButton>*/}
          <h5 className="tracking-tighter text-xl">Embedded Wallet Demo</h5>
          {/* Jazzicon - Conditional Rendering */}
          {/*{isUserSignedIn && (*/}
          {/*  <div style={{ width: 40, height: 40, marginRight: 15 }}>*/}
          {/*    {jazzicon(userAddress)}*/}
          {/*  </div>*/}
          {/*)}*/}

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="tracking-wider"
          >
            Login
          </Button>
          {isModalOpen && (
            <EmbeddedWalletModal setIsWalletModal={setIsModalOpen} />
          )}
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
