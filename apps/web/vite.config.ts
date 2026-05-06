import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import requireTransform from "vite-plugin-require-transform";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    }),
    requireTransform()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 4000,
    strictPort: true
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    strictPort: true
  }
});
