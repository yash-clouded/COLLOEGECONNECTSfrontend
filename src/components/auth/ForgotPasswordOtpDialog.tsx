import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PasswordField } from "@/components/ui/password-field";
import {
  confirmPasswordResetOtp,
  requestPasswordResetOtp,
  type PasswordResetRole,
} from "@/lib/restApi";

export function ForgotPasswordOtpDialog({
  open,
  onOpenChange,
  role,
  email,
  onEmailChange,
  onResetSuccess,
  accent = "teal",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: PasswordResetRole;
  email: string;
  onEmailChange: (email: string) => void;
  onResetSuccess?: (email: string, newPassword: string) => Promise<void> | void;
  accent?: "teal" | "orange";
}) {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const accentClasses = useMemo(() => {
    return accent === "orange"
      ? {
          button: "bg-neon-orange hover:bg-neon-orange/90 text-background",
          border: "focus-visible:border-neon-orange",
        }
      : {
          button: "bg-neon-teal hover:bg-neon-teal/90 text-background",
          border: "focus-visible:border-neon-teal",
        };
  }, [accent]);

  const resetLocal = () => {
    setStep("request");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setHint(null);
    setBusy(false);
  };

  const close = () => {
    onOpenChange(false);
    resetLocal();
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setHint("Enter your email first.");
      return;
    }
    setBusy(true);
    setHint(null);
    try {
      const res = await requestPasswordResetOtp(role, email.trim());
      setHint(`OTP sent. It expires in ${Math.round(res.expires_in_seconds / 60)} minutes.`);
      setStep("confirm");
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Could not send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!email.trim() || !otp.trim()) {
      setHint("Enter your email and OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setHint("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setHint("Passwords do not match.");
      return;
    }
    setBusy(true);
    setHint(null);
    try {
      await confirmPasswordResetOtp(role, email.trim(), otp.trim(), newPassword);
      if (onResetSuccess) {
        await onResetSuccess(email.trim(), newPassword);
        close();
        return;
      }
      setHint("Password updated. You can sign in now.");
      setTimeout(() => close(), 700);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Could not verify OTP.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            We’ll send a one-time code (OTP) to your registered email via Resend.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm text-muted-foreground" htmlFor="fp-email">
              Email
            </label>
            <Input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={accentClasses.border}
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </div>

          {step === "confirm" ? (
            <>
              <div className="grid gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="fp-otp">
                  OTP
                </label>
                <Input
                  id="fp-otp"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={accentClasses.border}
                  placeholder="6-digit code"
                />
              </div>

              <PasswordField
                id="fp-new-pass"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                variant={accent === "orange" ? "orange" : "teal"}
                autoComplete="new-password"
              />
              <PasswordField
                id="fp-confirm-pass"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                variant={accent === "orange" ? "orange" : "teal"}
                autoComplete="new-password"
              />
            </>
          ) : null}

          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>

        <DialogFooter>
          {step === "request" ? (
            <>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={busy}
                className={accentClasses.button}
              >
                {busy ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setHint(null);
                }}
                disabled={busy}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className={accentClasses.button}
              >
                {busy ? "Verifying..." : "Verify & reset"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

