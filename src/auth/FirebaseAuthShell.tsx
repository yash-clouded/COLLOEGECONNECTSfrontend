import {
  type PropsWithChildren,
  createElement,
  useCallback,
  useMemo,
} from "react";
import {
  InternetIdentityReactContext,
  type InternetIdentityContext,
} from "./internet-identity-context";

/**
 * Shell when **Firebase Authentication** handles sign-in/sign-up.
 * Does not import Internet Identity / AuthClient; `identity` stays undefined (anonymous IC actor).
 */
export function FirebaseAuthShell({ children }: PropsWithChildren) {
  const login = useCallback(() => {}, []);
  const clear = useCallback(() => {}, []);
  const value = useMemo<InternetIdentityContext>(
    () => ({
      identity: undefined,
      login,
      clear,
      loginStatus: "idle",
      isInitializing: false,
      isLoginIdle: true,
      isLoggingIn: false,
      isLoginSuccess: false,
      isLoginError: false,
      loginError: undefined,
    }),
    [login, clear],
  );
  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
