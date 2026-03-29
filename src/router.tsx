import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
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

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}