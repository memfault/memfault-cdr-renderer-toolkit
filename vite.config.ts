import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(() => {
  return {
    plugins: [react(), dts({ exclude: ["node_modules", "dist", "**/*.test.ts"] })],
    build: {
      lib: {
        entry: "./src/index.ts",
        formats: ["es"],
      },
      rollupOptions: {
        external: ["react", "react-dom", "zod"],
      },
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
    },
  };
});
