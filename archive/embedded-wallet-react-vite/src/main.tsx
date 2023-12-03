import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const brandColor = "#00b8d4";
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0f0f0",
      paper: "#ffffff",
    },
    primary: {
      main: brandColor,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
