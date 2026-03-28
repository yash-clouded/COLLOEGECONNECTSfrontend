import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import DeployConfigMissing from "./components/DeployConfigMissing";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import {
  getFirebaseAnalytics,
  getFirebaseApp,
  isFirebaseConfigured,
} from "./lib/firebase";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const MainShell = lazy(() => import("./MainShell"));

function LoadingShell() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0b",
        color: "#e8e8ed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid rgba(255,255,255,0.2)",
          borderTopColor: "#ea580c",
          borderRadius: "50%",
          animation: "cc-spin 0.75s linear infinite",
        }}
        aria-hidden
      />
      <p style={{ margin: 0, fontSize: 15 }}>Loading CollegeConnect…</p>
      <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const rootEl = document.getElementById("root")!;

if (!isFirebaseConfigured()) {
  ReactDOM.createRoot(rootEl).render(<DeployConfigMissing />);
} else {
  getFirebaseApp();
  void getFirebaseAnalytics();

  ReactDOM.createRoot(rootEl).render(
    <RootErrorBoundary>
      <Suspense fallback={<LoadingShell />}>
        <MainShell />
      </Suspense>
    </RootErrorBoundary>,
  );
}
