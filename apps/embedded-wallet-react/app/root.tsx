import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import type { LinksFunction } from "@remix-run/node";
import Navbar from "./components/Navbar";
import {cssBundleHref} from "@remix-run/css-bundle";

//
// export const logger = pino({
//   colorize: true, // colorizes the log output
//   translateTime: "SYS:standard", // formats timestamp
//   ignore: "pid,hostname", // hides pid and hostname from log messages
// });

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

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
