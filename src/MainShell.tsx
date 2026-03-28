import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { FirebaseAuthShell } from "./auth/FirebaseAuthShell";
import { AppRouterProvider } from "./router";

const queryClient = new QueryClient();

/**
 * Lazy-loaded shell: router + heavy pages live in a separate chunk so the first
 * paint can show a loading UI instead of a long blank screen on slow networks.
 */
export default function MainShell() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthShell>
          <AppRouterProvider />
        </FirebaseAuthShell>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
