import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import DeployConfigMissing from "./components/DeployConfigMissing";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import { FirebaseAuthShell } from "./auth/FirebaseAuthShell";
import {
  getFirebaseAnalytics,
  getFirebaseApp,
  isFirebaseConfigured,
} from "./lib/firebase";
import { AppRouterProvider } from "./router";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const rootEl = document.getElementById("root")!;

if (!isFirebaseConfigured()) {
  ReactDOM.createRoot(rootEl).render(<DeployConfigMissing />);
} else {
  getFirebaseApp();
  void getFirebaseAnalytics();

  const queryClient = new QueryClient();

  // User sign-in/sign-up: Firebase Auth only. FirebaseAuthShell avoids loading Internet Identity (IC).
  ReactDOM.createRoot(rootEl).render(
    <RootErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <FirebaseAuthShell>
            <AppRouterProvider />
          </FirebaseAuthShell>
        </QueryClientProvider>
      </HelmetProvider>
    </RootErrorBoundary>,
  );
}
