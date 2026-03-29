import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import App from "./App";
import HomePage from "./pages/home/HomePage";
import AdvisorLoginPage from "./pages/auth/AdvisorLoginPage";
import AdvisorSignupPage from "./pages/auth/AdvisorSignupPage";
import StudentLoginPage from "./pages/auth/StudentLoginPage";
import StudentSignupPage from "./pages/auth/StudentSignupPage";
import TestAccountPage from "./pages/auth/TestAccountPage";
import AboutPage from "./pages/footer/AboutPage";
import ContactPage from "./pages/footer/ContactPage";
import PrivacyPage from "./pages/footer/PrivacyPage";
import TermsPage from "./pages/footer/TermsPage";
import GetStartedPage from "./pages/home/GetStartedPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentAdvisorDetailPage from "./pages/dashboard/StudentAdvisorDetailPage";
import StudentSessionDetailPage from "./pages/dashboard/StudentSessionDetailPage";
import PendingApproval from "./pages/PendingApproval";
import AdvisorDashboard from "./pages/dashboard/AdvisorDashboard";
import AdvisorSessionDetailPage from "./pages/dashboard/AdvisorSessionDetailPage";

const rootRoute = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const advisorSignupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/advisor/signup", component: AdvisorSignupPage });
const advisorLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/advisor/login", component: AdvisorLoginPage });
const studentSignupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/student/signup", component: StudentSignupPage });
const studentLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/student/login", component: StudentLoginPage });
const testAccountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/test-account", component: TestAccountPage });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: AboutPage });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactPage });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: PrivacyPage });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: TermsPage });
const getStartedRoute = createRoute({ getParentRoute: () => rootRoute, path: "/get-started", component: GetStartedPage });
const pendingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/pending", component: PendingApproval });
const studentDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/student/dashboard", component: StudentDashboard });
const studentAdvisorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/advisor/$advisorId",
  component: StudentAdvisorDetailPage,
});
const studentSessionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/session/$bookingId",
  component: StudentSessionDetailPage,
});
const advisorDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/advisor/dashboard", component: AdvisorDashboard });
const advisorSessionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/advisor/session/$bookingId",
  component: AdvisorSessionDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  advisorSignupRoute,
  advisorLoginRoute,
  studentSignupRoute,
  studentLoginRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  getStartedRoute,
  pendingRoute,
  studentDashboardRoute,
  studentAdvisorDetailRoute,
  studentSessionDetailRoute,
  advisorDashboardRoute,
  advisorSessionDetailRoute,
  testAccountRoute,
]);

/**
 * TanStack Router starts with `matches: []` until `router.load()` runs in a layout effect.
 * `MatchesInner` renders null until then, which looks like a blank white page. We always
 * render router children (so `Transitioner` can call `load()`), and show this overlay
 * only while there are no matches yet.
 */
function RouterBootShell({ children }: { children: ReactNode }) {
  const noMatches = useRouterState({ select: (s) => s.matches.length === 0 });

  return (
    <>
      {children}
      {noMatches ? (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-3 bg-[oklch(0.09_0.01_265)] text-[oklch(0.96_0.005_260)]"
          role="status"
          aria-live="polite"
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[oklch(0.67_0.19_40)]"
            aria-hidden
          />
          <p className="text-sm text-white/80">Loading CollegeConnect…</p>
        </div>
      ) : null}
    </>
  );
}

function RoutePendingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export const router = createRouter({
  routeTree,
  InnerWrap: RouterBootShell,
  defaultPendingComponent: RoutePendingFallback,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}