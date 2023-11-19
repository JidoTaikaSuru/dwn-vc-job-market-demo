import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {AppBar, Button, Toolbar, Typography} from "@mui/material";
//
// export const logger = pino({
//   colorize: true, // colorizes the log output
//   translateTime: "SYS:standard", // formats timestamp
//   ignore: "pid,hostname", // hides pid and hostname from log messages
// });

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
