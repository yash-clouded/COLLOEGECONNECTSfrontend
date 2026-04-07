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

export default function AdvisorLoginPage() {
  const [collegeEmail, setCollegeEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!collegeEmail || !password) {
      alert("Please enter college email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        collegeEmail.trim(),
        password,
      );
      navigate({ to: "/advisor/dashboard" });
    } catch (e) {
      alert(formatFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  function handleForgotPassword() {
    setForgotOpen(true);
  }

  return (
    <AuthShell
      title="Advisor Sign In"
      subtitle="Welcome back. Sign in to manage your advisor profile."
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 px-3 py-2">
          Sign-in is handled by{" "}
          <strong className="text-foreground">Firebase</strong> (your college
          email and password from sign-up).
        </p>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="advisor-login-email"
            className="text-sm text-muted-foreground"
          >
            College Email
          </label>
          <input
            id="advisor-login-email"
            type="email"
            placeholder="you@college.edu.in"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <PasswordField
          id="advisor-login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          variant="orange"
          autoComplete="current-password"
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={handleLogin}
            disabled={busy}
            className="bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-5 glow-orange transition-all duration-300"
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
            className="border-neon-orange/40 text-neon-orange hover:bg-neon-orange/10 hover:border-neon-orange rounded-xl px-5 transition-all duration-300"
          >
            Forgot Password
          </Button>
        </div>

        <ForgotPasswordOtpDialog
          open={forgotOpen}
          onOpenChange={setForgotOpen}
          role="advisor"
          email={collegeEmail}
          onEmailChange={setCollegeEmail}
          accent="orange"
          onResetSuccess={async (e, newPass) => {
            await signInWithEmailAndPassword(getFirebaseAuth(), e, newPass);
            navigate({ to: "/advisor/dashboard" });
          }}
        />

        <p className="text-sm text-muted-foreground text-center mt-2">
          New advisor?{" "}
          <Link
            to="/auth/advisor/signup"
            className="text-neon-orange hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
