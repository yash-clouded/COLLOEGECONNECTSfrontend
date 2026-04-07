import { reload, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

import { getFirebaseAuth } from "./firebase";

/**
 * Re-authenticates with email/password, sets Firebase displayName, reloads the user.
 * Call this immediately before MongoDB register so credentials and name are confirmed in Firebase.
 */
export async function finalizeFirebaseSignup(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const trimmed = displayName.trim();
  if (trimmed) {
    await updateProfile(cred.user, { displayName: trimmed });
  }
  await reload(cred.user);
}
