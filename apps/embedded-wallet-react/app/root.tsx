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
import { WalletProvider, useWallet } from "./context/WalletContext";
import Navbar from "./components/Navbar";

//
// export const logger = pino({
//   colorize: true, // colorizes the log output
//   translateTime: "SYS:standard", // formats timestamp
//   ignore: "pid,hostname", // hides pid and hostname from log messages
// });

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
          <Navbar />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
      </body>
    </html>
  );
}
