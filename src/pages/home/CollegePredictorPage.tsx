import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Search, Send, Trophy, CheckCircle2, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

interface College {
  Institute: string;
  Program: string;
  ClosingRank: number;
}

export default function CollegePredictorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rank, setRank] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Gender-Neutral");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<College[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [leadSaved, setLeadSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleBack = () => {
    const role = localStorage.getItem("user_role");
    if (user && role === "student") navigate({ to: "/student/dashboard" });
    else if (user && role === "advisor") navigate({ to: "/advisor/dashboard" });
    else navigate({ to: "/" });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setLeadSaved(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_REST_API_URL || ""}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rank: parseInt(rank),
          category,
          gender
        }),
      });

      const data = await response.json();
      if (data.colleges && data.colleges.length > 0) {
        setResults(data.colleges);
      } else {
        setError("no colleges found with your rank");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch(`${import.meta.env.VITE_REST_API_URL || ""}/api/predict/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank: parseInt(rank), email }),
      });
      setLeadSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen px-4 sm:px-6 overflow-hidden bg-background">
      {/* Premium Background Accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 175) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, oklch(0.67 0.19 40) 0%, transparent 70%)",
            filter: "blur(55px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.6 0.01 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.01 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto pt-24 sm:pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            {user ? "Back to dashboard" : "Back to home"}
          </button>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground mb-4">
            <Trophy size={14} className="text-neon-teal" />
            ML Powered Predictions
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            Find Your Dream College
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Enter your JEE Main rank to see your estimated colleges based on previous year CSAB/JoSAA cutoffs.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border/70 bg-background/50 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-neon-teal/5"
        >
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-muted-foreground ml-1">
                  Seat Type / Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background/50 border-2 border-border/50 rounded-2xl py-4 px-6 text-lg font-medium text-foreground focus:outline-none focus:border-neon-teal/50 focus:ring-4 focus:ring-neon-teal/10 transition-all appearance-none cursor-pointer"
                >
                  {["OPEN", "EWS", "OBC-NCL", "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)"].map((cat) => (
                    <option key={cat} value={cat} className="bg-background text-foreground">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium text-muted-foreground ml-1">
                  Gender Pool
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-background/50 border-2 border-border/50 rounded-2xl py-4 px-6 text-lg font-medium text-foreground focus:outline-none focus:border-neon-teal/50 focus:ring-4 focus:ring-neon-teal/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Gender-Neutral" className="bg-background text-foreground">Gender-Neutral</option>
                  <option value="Female-only (including Supernumerary)" className="bg-background text-foreground">Female Only</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="rank" className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                Your AIR Rank
              </label>
              <div className="relative">
                <input
                  id="rank"
                  type="number"
                  placeholder="e.g. 15000"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full bg-background/50 border-2 border-border/50 rounded-2xl py-4 px-6 text-xl font-semibold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-neon-teal/50 focus:ring-4 focus:ring-neon-teal/10 transition-all"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-neon-teal/10 text-neon-teal">
                  <Search size={24} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !rank}
              className="w-full py-4 px-8 bg-foreground text-background font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Predict Colleges
                  <GraduationCap size={22} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4">
                  Estimated Colleges
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              
              <div className="grid gap-4">
                {results.map((college, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative p-6 rounded-2xl border border-border/50 bg-background/40 hover:bg-background/60 hover:border-neon-teal/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-neon-teal transition-colors">
                          {college.Institute}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {college.Program}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Closing Rank</div>
                        <div className="text-xl font-mono font-bold text-foreground">
                          #{college.ClosingRank.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <div className="rounded-3xl border border-dashed border-border p-8 text-center bg-background/30 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                  <XCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {error}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Please try for CSAB or leave your email, we'll get back to you sooner with more options!
                </p>

                {leadSaved ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 text-neon-teal p-6 rounded-2xl bg-neon-teal/5 border border-neon-teal/20"
                  >
                    <CheckCircle2 size={32} />
                    <span className="font-semibold text-lg">Thank you! We'll be in touch soon.</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto">
                    <div className="relative flex gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-teal/20 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-neon-teal text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                      >
                        Notify Me
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-sm"
        >
          <Info size={18} className="shrink-0" />
          <p>
            Note: Predictions are based on historical 2024 cutoff data. Actual results may vary depending on seat matrix and current trends.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
