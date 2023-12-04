import "./App.css";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { WalletIframe } from "./WalletIframe.tsx";

function App() {
  return (
    <Container>
      <Box sx={{ flexGrow: 1 }}>
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
      </Box>
      <Box sx={{ marginTop: 2, border: "1px solid black" }}>
        <Typography
          variant={"h6"}
          sx={{
            textAlign: "center",
            padding: 1,
            borderBottom: "1px solid black",
          }}
        >
          Embedded Wallet iframe
        </Typography>
        <WalletIframe />
      </Box>
      <iframe src="https://platform.twitter.com/widgets/tweet_button.html"></iframe>
    </Container>
  );
}

export default App;
