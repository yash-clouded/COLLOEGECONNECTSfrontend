import { useContext } from "react";
import {
  InternetIdentityReactContext,
  type InternetIdentityContext,
} from "./internet-identity-context";

function assertProviderPresent(
  context: InternetIdentityContext | undefined,
): asserts context is InternetIdentityContext {
  if (!context) {
    throw new Error(
      "Wrap your component tree with InternetIdentityProvider or FirebaseAuthShell (see main.tsx).",
    );
  }
}

export function useInternetIdentity(): InternetIdentityContext {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
}
