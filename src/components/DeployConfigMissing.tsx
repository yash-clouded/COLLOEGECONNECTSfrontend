/**
 * Shown when the production build has no Firebase web config (common on Vercel if env vars were not set for the build).
 */
export default function DeployConfigMissing() {
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
      <h1 style={{ fontSize: "1.35rem", margin: "0 0 1rem", fontWeight: 700 }}>
        CollegeConnect — configuration needed
      </h1>
      <p style={{ margin: "0 0 1rem", opacity: 0.92 }}>
        Firebase environment variables were missing when this site was built, so the app
        cannot start. Vite bakes <code style={{ opacity: 0.95 }}>VITE_*</code> values in at{" "}
        <strong>build time</strong>, not only at runtime.
      </p>
      <ol
        style={{
          margin: "0 0 1.25rem",
          paddingLeft: "1.25rem",
          maxWidth: "36rem",
        }}
      >
        <li style={{ marginBottom: "0.5rem" }}>
          Vercel → your project → <strong>Settings</strong> →{" "}
          <strong>Environment Variables</strong>.
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          Add the same keys as in <code>.env.example</code> (all{" "}
          <code>VITE_FIREBASE_*</code> entries). Use your real Firebase web app values.
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          Apply them to <strong>Production</strong> (and <strong>Preview</strong> if you use
          preview deployments).
        </li>
        <li>
          Trigger a new deployment: <strong>Deployments</strong> → ⋯ →{" "}
          <strong>Redeploy</strong> (or push a new commit).
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.65 }}>
        After redeploying with variables present, the full site should load. Add your
        Vercel URL under Firebase → Authentication → Settings → Authorized domains.
      </p>
    </div>
  );
}
