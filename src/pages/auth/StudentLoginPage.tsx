import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { getFirebaseAuth } from "@/lib/firebase";
import { formatFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { ForgotPasswordOtpDialog } from "@/components/auth/ForgotPasswordOtpDialog";
import { studentPostAuthPath } from "@/lib/studentPostAuthGate";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      navigate({ to: studentPostAuthPath() });
    } catch (e) {
      alert(formatFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  function handleForgotPassword() {
    setForgotOpen(true);
  }

  return (
    <AuthShell
      title="Student Sign In"
      subtitle="Welcome back. Sign in to book and manage sessions."
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 px-3 py-2">
          Sign-in is handled by{" "}
          <strong className="text-foreground">Firebase</strong> (same email and
          password you used at sign-up).
        </p>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-login-email"
            className="text-sm text-muted-foreground"
          >
            Email
          </label>
          <input
            id="student-login-email"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        <PasswordField
          id="student-login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          variant="teal"
          autoComplete="current-password"
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={handleLogin}
            disabled={busy}
            className="bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5 glow-teal transition-all duration-300"
          >
            {busy ? (
              <Loader size={16} className="mr-2 animate-spin" />
            ) : (
              <LogIn size={16} className="mr-2" />
            )}
            Sign In
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleForgotPassword}
            className="border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 hover:border-neon-teal rounded-xl px-5 transition-all duration-300"
          >
            Forgot Password
          </Button>
        </div>

        <ForgotPasswordOtpDialog
          open={forgotOpen}
          onOpenChange={setForgotOpen}
          role="student"
          email={email}
          onEmailChange={setEmail}
          accent="teal"
          onResetSuccess={async (e, newPass) => {
            await signInWithEmailAndPassword(getFirebaseAuth(), e, newPass);
            navigate({ to: studentPostAuthPath() });
          }}
        />

        <p className="text-sm text-muted-foreground text-center mt-2">
          New here?{" "}
          <Link
            to="/auth/student/signup"
            className="text-neon-teal hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
