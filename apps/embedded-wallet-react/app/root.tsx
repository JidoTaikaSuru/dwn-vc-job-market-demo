import {cssBundleHref} from "@remix-run/css-bundle";
import type {LinksFunction} from "@remix-run/node";
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {AppBar, Button, createTheme, Toolbar, Typography,} from "@mui/material";
// Annoying as hell: https://github.com/mui/material-ui/issues/31835

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

const theme = createTheme({});

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
        <AppBar position="static">
          <Toolbar>
            {/*<IconButton edge="start" color="inherit" aria-label="home">*/}
            {/*  <HomeIcon />*/}
            {/*</IconButton>*/}
            <Typography variant={"h5"}>Embedded Wallet Demo</Typography>
            {/* Jazzicon - Conditional Rendering */}
            {/*{isUserSignedIn && (*/}
            {/*  <div style={{ width: 40, height: 40, marginRight: 15 }}>*/}
            {/*    {jazzicon(userAddress)}*/}
            {/*  </div>*/}
            {/*)}*/}

            <Button
              color="secondary"
              variant={"contained"}
              sx={{ marginLeft: "auto" }}
            >
              Login
            </Button>
          </Toolbar>
        </AppBar>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
