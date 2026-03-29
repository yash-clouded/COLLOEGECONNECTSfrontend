/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FastAPI base URL, e.g. http://localhost:8000 — omit to use same-origin /api via Vite proxy */
  readonly VITE_REST_API_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /** Google Analytics (Firebase) — optional */
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_RAZORPAY_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
