import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/`
    : `https://identity.internetcomputer.org/`;

process.env.II_URL = process.env.II_URL || ii_url;
process.env.STORAGE_GATEWAY_URL =
  process.env.STORAGE_GATEWAY_URL || "https://blob.caffeine.ai";

// FastAPI port used by local backend; override with API_PORT if needed.
const FASTAPI_PORT = process.env.API_PORT || "8000";

export default defineConfig({
  // Root-relative assets (required for Vercel and most static hosts).
  base: "/",
  // Show URL in terminal; "error" hides the local link and confuses debugging.
  logLevel: "info",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    // Smaller, reliable production bundles on Vercel (unminified multi-MB output can cause edge cases).
    minify: "esbuild",
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env": "{}",
      },
    },
  },
  server: {
    // Listen on all local interfaces so both http://localhost:5173 and http://127.0.0.1:5173 work.
    // Firebase Auth authorized domains include "localhost" by default, but not "127.0.0.1" — use
    // localhost for dev sign-in, or add 127.0.0.1 under Authentication → Settings → Authorized domains.
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      // FastAPI (MongoDB sign-up) — match before generic /api (IC replica)
      "/api/health": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/students": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/advisors": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/meta": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/auth": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/bookings": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api/payments": {
        target: `http://127.0.0.1:${FASTAPI_PORT}`,
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["II_URL"]),
    environment(["STORAGE_GATEWAY_URL"]),
    react(),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("./src/declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@dfinity/agent"],
  },
});
