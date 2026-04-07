/**
 * Central SEO copy + route → meta mapping. Set VITE_SITE_URL in production for
 * canonical URLs, Open Graph, and JSON-LD (e.g. https://yourapp.web.app).
 */

export const SITE_NAME = "CollegeConnect";

export const DEFAULT_DESCRIPTION =
  "Connect with verified college advisors for JEE prep, admissions guidance, and mentoring. Book online sessions with students from IITs, NITs, and colleges across India.";

export function siteBaseUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  if (typeof raw !== "string" || !raw.trim()) return "";
  return raw.trim().replace(/\/$/, "");
}

export type RouteSeo = {
  title: string;
  description: string;
  /** Logged-in / transactional surfaces */
  noindex?: boolean;
};

const PUBLIC: Record<string, RouteSeo> = {
  "/": {
    title: `${SITE_NAME} — Find your college advisor`,
    description: DEFAULT_DESCRIPTION,
  },
  "/get-started": {
    title: `Get started — ${SITE_NAME}`,
    description:
      "Join CollegeConnect as a student or advisor. Sign up to book mentoring sessions or offer guidance from your campus.",
  },
  "/about": {
    title: `About — ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME}, our mission to connect students with verified college advisors, and how we work.`,
  },
  "/contact": {
    title: `Contact — ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} for support, partnerships, or questions about advisor sessions and student sign-up.`,
  },
  "/privacy": {
    title: `Privacy policy — ${SITE_NAME}`,
    description: `Privacy policy for ${SITE_NAME}: how we handle your data, Firebase authentication, and session booking.`,
  },
  "/terms": {
    title: `Terms of service — ${SITE_NAME}`,
    description: `Terms of service for using ${SITE_NAME} as a student or advisor.`,
  },
  "/auth/student/signup": {
    title: `Student sign up — ${SITE_NAME}`,
    description:
      "Create a student account on CollegeConnect to browse advisors and book mentoring sessions.",
  },
  "/auth/student/login": {
    title: `Student sign in — ${SITE_NAME}`,
    description: "Sign in to your CollegeConnect student account.",
  },
  "/auth/advisor/signup": {
    title: `Advisor sign up — ${SITE_NAME}`,
    description:
      "Register as a college advisor on CollegeConnect. Share your campus experience and set your session availability.",
  },
  "/auth/advisor/login": {
    title: `Advisor sign in — ${SITE_NAME}`,
    description: "Sign in to your CollegeConnect advisor dashboard.",
  },
};

const NOINDEX_FALLBACK: RouteSeo = {
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  noindex: true,
};

export function getSeoForPath(pathname: string): RouteSeo {
  const path = pathname.split("?")[0] || "/";
  if (!path.startsWith("/")) return { ...PUBLIC["/"] };

  if (path === "/pending") {
    return {
      title: `Pending — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }

  if (path.startsWith("/student/dashboard")) {
    return {
      title: `Student dashboard — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/advisor/")) {
    return {
      title: `Advisor profile — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/session/")) {
    return {
      title: `Session — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/advisor/dashboard")) {
    return {
      title: `Advisor dashboard — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/advisor/session/")) {
    return {
      title: `Session — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/") || path.startsWith("/advisor/")) {
    return { ...NOINDEX_FALLBACK };
  }

  if (PUBLIC[path]) return { ...PUBLIC[path] };

  return { ...PUBLIC["/"], title: SITE_NAME };
}

export function jsonLdWebsite(baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: baseUrl,
  };
}

export function jsonLdOrganization(baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: baseUrl,
    description: DEFAULT_DESCRIPTION,
  };
}
