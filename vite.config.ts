import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), dts()],
    build: {
      lib: {
        entry: "./src/index.ts",
        formats: ["es"],
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
