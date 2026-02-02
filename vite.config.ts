import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/lolarsenal/" : "/",
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 8002,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});