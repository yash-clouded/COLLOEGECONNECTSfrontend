/**
 * Firebase Auth is the only identity provider for CollegeConnect (students / advisors).
 * Backend APIs verify `Authorization: Bearer <Firebase ID token>` via Firebase Admin.
 */
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { type Auth, getAuth } from "firebase/auth";

function requireEnv(name: string): string {
  const v = import.meta.env[name as keyof ImportMetaEnv];
  if (typeof v !== "string" || !v.trim()) {
    console.error(`[CRITICAL] Missing environment variable: ${name}`);
    throw new Error(
      `Missing ${name}. Add Firebase web app config to your Vite env (see .env.example).`,
    );
  }
  return v.trim();
}

function optionalEnv(name: keyof ImportMetaEnv): string | undefined {
  const v = import.meta.env[name];
  if (typeof v !== "string" || !v.trim()) return undefined;
  return v.trim();
}

/** True when required `VITE_FIREBASE_*` values exist (e.g. set in Vercel before `vite build`). */
export function isFirebaseConfigured(): boolean {
  const ok = (name: keyof ImportMetaEnv) => {
    const v = import.meta.env[name];
    return typeof v === "string" && v.trim().length > 0;
  };
  return (
    ok("VITE_FIREBASE_API_KEY") &&
    ok("VITE_FIREBASE_AUTH_DOMAIN") &&
    ok("VITE_FIREBASE_PROJECT_ID")
  );
}

let _app: FirebaseApp | null = null;
let _analytics: Analytics | null = null;
let _analyticsInit: Promise<Analytics | null> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (!getApps().length) {
    _app = initializeApp({
      apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
      authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
      projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
      storageBucket: optionalEnv("VITE_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: optionalEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
      appId: optionalEnv("VITE_FIREBASE_APP_ID"),
      measurementId: optionalEnv("VITE_FIREBASE_MEASUREMENT_ID"),
    });
  } else {
    _app = getApps()[0]!;
  }
  return _app;
}

/**
 * Google Analytics for Firebase (browser only). Safe to call once after app mount.
 * Returns null if Analytics is not supported or measurementId is unset.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (_analyticsInit) return _analyticsInit;
  _analyticsInit = (async () => {
    if (typeof window === "undefined") return null;
    const mid = optionalEnv("VITE_FIREBASE_MEASUREMENT_ID");
    if (!mid) return null;
    if (!(await isSupported())) return null;
    const app = getFirebaseApp();
    if (!_analytics) {
      _analytics = getAnalytics(app);
    }
    return _analytics;
  })();
  return _analyticsInit;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
