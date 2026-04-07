#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// Copy env.json from frontend root to dist directory (Vercel-friendly: no monorepo paths).
const sourceFile = path.join(process.cwd(), "env.json");
const destDir = path.join(process.cwd(), "dist");
const destFile = path.join(destDir, "env.json");

try {
  if (!fs.existsSync(sourceFile)) {
    console.warn(
      `Skipping env.json copy (file not found): ${sourceFile} — OK for Vercel / Firebase-only builds.`,
    );
    process.exit(0);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(sourceFile, destFile);
  console.log("✓ Copied env.json to dist/");
} catch (error) {
  console.error(`✗ Failed to copy env.json: ${error?.message ?? String(error)}`);
  process.exit(1);
}

