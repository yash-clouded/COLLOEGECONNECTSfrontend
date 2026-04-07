/**
 * Writes public/sitemap.xml for public (indexable) URLs.
 * Requires VITE_SITE_URL in .env (e.g. https://yourapp.web.app) — no trailing slash.
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env") });

const base = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
if (!base) {
  console.warn(
    "generate-sitemap: VITE_SITE_URL missing in .env — skipping sitemap.xml",
  );
  process.exit(0);
}

const paths = [
  "/",
  "/get-started",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/auth/student/signup",
  "/auth/student/login",
  "/auth/advisor/signup",
  "/auth/advisor/login",
];

const urls = paths.map((p) => {
  const loc = p === "/" ? `${base}/` : `${base}${p}`;
  const priority = p === "/" ? "1.0" : "0.8";
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const outDir = join(root, "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "sitemap.xml"), xml, "utf8");
console.log("Wrote public/sitemap.xml for", base);
