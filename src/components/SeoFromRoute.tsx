import { Helmet } from "react-helmet-async";
import { useRouterState } from "@tanstack/react-router";
import {
  getSeoForPath,
  jsonLdOrganization,
  jsonLdWebsite,
  siteBaseUrl,
  SITE_NAME,
} from "@/lib/routeSeo";

/**
 * Updates title, description, robots, canonical, Open Graph, and Twitter cards from the current path.
 */
export function SeoFromRoute() {
  const pathname =
    useRouterState({ select: (s) => s.location.pathname }) ?? "/";
  const { title, description, noindex } = getSeoForPath(pathname);
  const base = siteBaseUrl();
  const canonical =
    base && pathname
      ? pathname === "/"
        ? `${base}/`
        : `${base}${pathname}`
      : undefined;
  const ogImage = base ? `${base}/favicon.png` : undefined;
  const isHome = pathname === "/";

  const structuredData =
    isHome && base
      ? [jsonLdWebsite(base), jsonLdOrganization(base)]
      : null;

  return (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {structuredData ? (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      ) : null}
    </Helmet>
  );
}
