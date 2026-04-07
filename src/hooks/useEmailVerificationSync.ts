import { getFirebaseAuth } from "@/lib/firebase";
import { reload, type User } from "firebase/auth";
import { useEffect } from "react";

/**
 * After the user clicks the Firebase email link (often in another tab), reloads the
 * current user so `emailVerified` updates and the UI shows the checkmark without
 * manually tapping "Refresh email status".
 */
export function useEmailVerificationSync(
  authUser: User | null,
  setAuthUser: (u: User | null) => void,
  bump: () => void,
) {
  useEffect(() => {
    if (!authUser || authUser.emailVerified) return;

    const auth = getFirebaseAuth();

    const refresh = async () => {
      const u = auth.currentUser;
      if (!u || u.emailVerified) return;
      try {
        await reload(u);
        setAuthUser(auth.currentUser);
        bump();
      } catch {
        /* ignore */
      }
    };

    void refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 3000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, [authUser?.uid, authUser?.emailVerified, setAuthUser, bump]);
}
