import type { FC } from "react";
import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import Frame from "react-frame-component";
import { InternalEmbeddedWalletDemo } from "~/components/InternalEmbeddedWalletDemo";

export const InternalIframeDemo: FC = () => {
  // const [contentRef, setContentRef] = useState();
  // console.log(window);
  // const mountNode = document?.body;
  const nodeRef = useRef(null);
  console.log(nodeRef);

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
        <Frame>
          <InternalEmbeddedWalletDemo />
        </Frame>
        <div style={{ display: "flex" }}></div>
      </Box>
    </Box>
  );
};
