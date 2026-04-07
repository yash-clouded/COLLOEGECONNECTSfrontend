import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

/**
 * Catches React render errors so production (e.g. Vercel) shows a message instead of a blank screen.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RootErrorBoundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "2rem",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            background: "#0a0a0b",
            color: "#e8e8ed",
            lineHeight: 1.6,
          }}
        >
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 1rem" }}>
            Something went wrong
          </h1>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.875rem",
              opacity: 0.9,
              maxWidth: "42rem",
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", opacity: 0.65 }}>
            Open the browser console (F12) for the full stack trace. If this is right after
            deploy, confirm Vercel <strong>Environment Variables</strong> include all{" "}
            <code>VITE_FIREBASE_*</code> keys and redeploy.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
