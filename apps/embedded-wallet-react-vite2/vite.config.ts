import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
  plugins: [react(), commonjs()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      crypto: "crypto-browserify",
      stream: "stream-browserify",
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    target: 'esnext'
  }
});
