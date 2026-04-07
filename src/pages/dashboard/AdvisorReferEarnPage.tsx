import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";
import { IndianRupee } from "lucide-react";
import {
  createAdvisorReferral,
  getAdvisorReferralSummary,
  type ReferralSummaryResponse,
} from "@/lib/restApi";

export default function AdvisorReferEarnPage() {
  const [summary, setSummary] = useState<ReferralSummaryResponse | null>(null);
  const [referredEmail, setReferredEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) return;
      try {
        const s = await getAdvisorReferralSummary(token);
        if (!cancelled) setSummary(s);
      } catch (e) {
        if (!cancelled) setMsg(e instanceof Error ? e.message : "Could not load referral summary.");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async () => {
    const email = referredEmail.trim().toLowerCase();
    if (!email) {
      setMsg("Enter referred advisor email.");
      return;
    }
    if (!summary?.can_refer) {
      setMsg("You need at least 2 attended sessions before you can record a referral.");
      return;
    }
    const token = await getFirebaseAuth().currentUser?.getIdToken(true);
    if (!token) {
      setMsg("Sign in required.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await createAdvisorReferral(token, { referred_email: email });
      setMsg("Referral recorded successfully.");
      setReferredEmail("");
      const s = await getAdvisorReferralSummary(token);
      setSummary(s);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not create referral.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-border p-6 sm:p-8 space-y-4">
      <h3 className="text-xl font-bold text-foreground">Refer & Earn</h3>
      <p className="text-sm text-muted-foreground">
        Refer new advisors and earn 3% from their next 5 sessions.
      </p>
      <div className="rounded-xl border border-neon-orange/35 bg-neon-orange/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-orange/15 text-neon-orange">
            <IndianRupee className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Earnings from referrals
            </p>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">
              ₹{(summary?.referral_earnings_inr ?? 0).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Total credited when referred advisors complete sessions (3% of their session fee, up to 5
              sessions per referral).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-background/50 rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground">Attended sessions</p>
          <p className="text-lg font-semibold text-foreground">{summary?.attended_sessions ?? 0}</p>
        </div>
        <div className="bg-background/50 rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground">Can refer</p>
          <p className="text-lg font-semibold text-foreground">{summary?.can_refer ? "Yes" : "No"}</p>
        </div>
        <div className="bg-background/50 rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground">Total referrals</p>
          <p className="text-lg font-semibold text-foreground">{summary?.total_referrals ?? 0}</p>
        </div>
      </div>
      <div className="bg-background/50 rounded-xl p-3 border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Your referral code</p>
        <p className="text-sm font-medium text-neon-orange">{summary?.referral_code || "Loading..."}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Referred advisor email</label>
        <input
          type="email"
          value={referredEmail}
          onChange={(e) => setReferredEmail(e.target.value)}
          placeholder="newadvisor@college.edu"
          autoComplete="email"
          disabled={busy}
          className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors disabled:opacity-60"
        />
      </div>
      <Button
        type="button"
        onClick={handleCreate}
        disabled={busy}
        className="bg-neon-orange hover:bg-neon-orange/90 text-black"
      >
        {busy ? "Submitting..." : "Record referral"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Eligibility: you can refer after attending at least 2 sessions.
      </p>
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

