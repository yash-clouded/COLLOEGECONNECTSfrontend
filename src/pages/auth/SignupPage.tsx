import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { getFirebaseAuth } from "@/lib/firebase";
import { formatFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { requestSignupOtp, verifySignupOtp, registerStudent, registerAdvisor } from "@/lib/restApi";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { CheckCircle, Loader, Mail, UserPlus, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthShell } from "./AuthShell";
import { motion, AnimatePresence } from "motion/react";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "advisor">("student");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionPrice, setSessionPrice] = useState("199");
  const [preferredTimings, setPreferredTimings] = useState<string[]>([]);
  const [newTiming, setNewTiming] = useState("");

  // Dynamic Theme Colors - Professional Academic Palette (Navy & Mango)
  const activeColor = role === "student" ? "bg-[#1E3A8A]" : "bg-[#F5A623]";
  const textColor = role === "student" ? "text-[#1E3A8A]" : "text-[#F5A623]";
  const accentBorder = role === "student" ? "focus:border-[#1E3A8A]" : "focus:border-[#F5A623]";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isPersonalEmail = (email: string) => {
    const personalDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "me.com", "live.com", "msn.com"];
    return personalDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSendOtp = async (isResend = false) => {
    if (role === "advisor" && isPersonalEmail(email)) {
      alert("Please provide your College ID email (e.g., yourname@iit.ac.in) instead of a personal ID.");
      return;
    }
    setBusy(true);
    try {
      await requestSignupOtp(role, email.trim());
      setOtpSent(true);
      if (!isResend) setStep(4);
      setResendTimer(60); // Start 60s cooldown
      alert(isResend ? "New verification code sent!" : "Verification code sent to your email.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) {
      alert("Please enter the verification code.");
      return;
    }
    setBusy(true);
    try {
      await verifySignupOtp(role, email.trim(), otp.trim(), password);
      const auth = getFirebaseAuth();
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;
      await updateProfile(user, { displayName: name });
      const token = await user.getIdToken();
      if (role === "advisor") {
        setStep(5);
        return;
      }
      const payload = {
        name,
        email: email.trim(),
        referral_code: referralCode.trim() || undefined
      };
      if (role === "student") {
        await registerStudent(token, payload);
        localStorage.setItem("user_role", "student");
        navigate({ to: "/student/dashboard" });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(formatFirebaseAuthError(e));
      } else if (e.message && e.message.includes("409")) {
        alert("This email is already registered. Please Sign In instead.");
      } else {
        alert(e instanceof Error ? e.message : "Signup failed.");
      }
    } finally {
      if (role === "student") setBusy(false);
    }
  };

  const handleFinishAdvisorProfile = async () => {
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const payload = {
        name,
        collegeEmail: email.trim(),
        referral_code: referralCode.trim() || undefined,
        session_price: sessionPrice,
        preferred_timezones: preferredTimings
      };

      await registerAdvisor(token, payload);
      localStorage.setItem("user_role", "advisor");
      navigate({ to: "/advisor/dashboard" });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to finish advisor profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={step === 4 ? "Verify Email" : "Create Account"}
      subtitle={
        step === 1 ? (role === "advisor" ? "Sign up using college email only. Basic info first." : "Start with your name and referral code.") :
        step === 2 ? (role === "advisor" ? "Enter your official college email address." : "Enter your email address.") :
        step === 3 ? "Secure your account with a password." :
        step === 4 ? "Enter the 6-digit code sent to " + email :
        "Set your session fee and availability."
      }
    >
      <div className="flex flex-col gap-8">
        {step === 1 && (
          <div className="relative flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1">
            {/* Sliding Pill Background */}
            <motion.div
              layoutId="role-pill"
              className={`absolute inset-y-1.5 rounded-xl shadow-sm ${activeColor}`}
              initial={false}
              animate={{
                x: role === "student" ? 0 : "100%",
                left: role === "student" ? "6px" : "-6px",
                width: "calc(50% - 6px)"
              }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />

            <button 
              onClick={() => setRole("student")} 
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${role === "student" ? "text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <GraduationCap size={16} strokeWidth={2.5} />
              I'm a Student
            </button>
            <button 
              onClick={() => setRole("advisor")} 
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${role === "advisor" ? "text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              I'm an Advisor
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className={`bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md`} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                  Referral Code
                  <span className="text-[9px] opacity-70 italic font-medium lowercase">optional</span>
                </label>
                <input 
                  type="text" 
                  placeholder="REF123" 
                  value={referralCode} 
                  onChange={(e) => setReferralCode(e.target.value)} 
                  className={`bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md uppercase tracking-wider`} 
                />
              </div>
              <Button 
                onClick={() => name ? nextStep() : alert("Please enter your name")} 
                className={`w-full font-black uppercase tracking-[0.2em] rounded-xl h-14 mt-2 transition-all active:scale-[0.98] ${activeColor} text-white shadow-lg shadow-black/5`}
              >
                Continue <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md`} 
                />
                {role === "advisor" && (
                  <div className={`flex items-center gap-2 mt-1 px-1 ${email && isPersonalEmail(email) ? "text-[#F5A623] animate-pulse" : "text-slate-400"}`}>
                    <ShieldCheck size={12} />
                    <p className="text-[9px] font-bold uppercase tracking-wide">
                      Advisors require college ID email.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" onClick={prevStep} className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px]">Back</Button>
                <Button 
                  onClick={() => email ? nextStep() : alert("Please enter your email")} 
                  className={`flex-[2] font-black uppercase tracking-[0.2em] rounded-xl h-14 transition-all active:scale-[0.98] ${activeColor} text-white shadow-lg shadow-black/5`}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <PasswordField 
                label="PASSWORD" 
                value={password} 
                onChange={setPassword} 
                className="font-black"
                variant={role === "student" ? "teal" : "orange"} 
              />
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={prevStep} className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px]">Back</Button>
                <Button 
                  onClick={() => handleSendOtp(false)} 
                  disabled={busy} 
                  className={`flex-[2] font-black uppercase tracking-[0.2em] rounded-xl h-14 transition-all active:scale-[0.98] ${activeColor} text-white shadow-lg shadow-black/5`}
                >
                  {busy ? <Loader size={18} className="animate-spin mx-auto" /> : "Verify & Sign Up"}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verification Code</label>
                <input 
                  type="text" 
                  placeholder="000000" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className={`bg-white border border-slate-100 rounded-xl px-5 py-4 text-2xl font-black text-center transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md tracking-[0.5em]`} 
                />
              </div>
              <Button 
                onClick={handleVerifyAndSignup} 
                disabled={busy} 
                className={`w-full font-black uppercase tracking-[0.2em] rounded-xl h-14 transition-all active:scale-[0.98] ${activeColor} text-white shadow-lg shadow-black/5`}
              >
                {busy ? <Loader size={18} className="animate-spin" /> : <><CheckCircle size={18} className="mr-3" />Finish Signup</>}
              </Button>
              
              <div className="flex flex-col items-center gap-4 py-2">
                <button 
                  onClick={() => handleSendOtp(true)} 
                  disabled={busy || resendTimer > 0} 
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${resendTimer > 0 ? "text-slate-300 cursor-not-allowed" : `${textColor} hover:opacity-80`}`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
                <button onClick={() => setStep(2)} className="text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Wrong email? Change it</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Session Price (₹)</label>
                <select 
                  value={sessionPrice} 
                  onChange={(e) => setSessionPrice(e.target.value)}
                  className={`bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md`}
                >
                  <option value="99">₹99 / Session</option>
                  <option value="199">₹199 / Session</option>
                  <option value="299">₹299 / Session</option>
                  <option value="399">₹399 / Session</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Add Preferred Slots</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferredTimings.map((t, i) => (
                    <div key={i} className="bg-navy text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
                      {t}
                      <button onClick={() => setPreferredTimings(p => p.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 10 AM - 12 PM" 
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value)}
                    className={`flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs transition-all outline-none shadow-sm ${accentBorder} focus:shadow-md`} 
                  />
                  <button 
                    onClick={() => {
                      if (newTiming.trim()) {
                        setPreferredTimings(p => [...p, newTiming.trim()]);
                        setNewTiming("");
                      }
                    }}
                    className={`px-4 rounded-xl text-[10px] font-black text-white ${activeColor}`}
                  >
                    ADD
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleFinishAdvisorProfile} 
                disabled={busy} 
                className={`w-full font-black uppercase tracking-[0.2em] rounded-xl h-14 transition-all active:scale-[0.98] ${activeColor} text-white shadow-lg shadow-black/5`}
              >
                {busy ? <Loader size={18} className="animate-spin" /> : "Complete Profile"}
              </Button>
            </div>
          )}

          <p className="text-center text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
            Member? <Link to="/auth/signin" className="text-foreground transition-colors hover:text-slate-900 border-b border-slate-900 ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
