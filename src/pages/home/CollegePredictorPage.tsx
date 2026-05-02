import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, GraduationCap, Table2, Search, Send, Trophy, CheckCircle2, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

const JOSAA_2025_URL =
  "https://docs.google.com/spreadsheets/d/1UOihhPYYDPUcLN5coF2-wGxlR7DJQxGR/edit?usp=sharing&ouid=102708880640851630376&rtpof=true&sd=true";

const JOSAA_2024_URL =
  "https://docs.google.com/spreadsheets/d/1il-AcBuWqMUDY6uvaXmOGATRA1bO1Gme/edit?usp=sharing&ouid=102708880640851630376&rtpof=true&sd=true";

interface College {
  Institute: string;
  Program: string;
  ClosingRank: number;
  Type: string;
  Status: "Dream" | "Safe";
}

function CollegeCard({ college, index }: { college: College; index: number }) {
  const typeColors: Record<string, string> = {
    IIT: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    NIT: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    IIIT: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    Other: "bg-gray-500/10 border-gray-500/20 text-gray-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-2xl border border-border/50 bg-background/40 hover:border-neon-teal/30 transition-all group"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${typeColors[college.Type] || typeColors.Other}`}>
              {college.Type}
            </span>
            <h3 className="font-bold text-foreground leading-tight group-hover:text-neon-teal transition-colors">
              {college.Institute}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {college.Program}
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-border/20 pt-3 sm:pt-0 w-full sm:w-auto">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mb-0.5">Closing Rank</div>
          <div className="text-xl font-mono font-bold text-foreground">
            #{college.ClosingRank.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
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
    <div className="relative min-h-screen px-4 sm:px-6 overflow-hidden">
      {/* Background Grid Accent omitted content for brevity ... */}
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
           transition={{ duration: 0.35 }}
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
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-neon-teal/20 bg-neon-teal/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neon-teal mb-6 shadow-sm shadow-neon-teal/5">
            <Trophy size={12} className="shrink-0" />
            ML Powered Predictions
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            Find Your Dream College
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Enter your JEE Main rank to see your estimated colleges based on **JoSAA/CSAB 2025** cutoffs.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border/70 bg-background/50 backdrop-blur-sm p-6 sm:p-8 mb-8"
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
                  className="w-full bg-background/50 border border-border/50 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-neon-teal/50 transition-all appearance-none cursor-pointer"
                >
                  {["OPEN", "EWS", "OBC-NCL", "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)"].map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0d0d0d] text-white">
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
                  className="w-full bg-background/50 border border-border/50 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-neon-teal/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Gender-Neutral" className="bg-[#0d0d0d] text-white">Gender-Neutral</option>
                  <option value="Female-only (including Supernumerary)" className="bg-[#0d0d0d] text-white">Female Only</option>
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
                  className="w-full bg-background/50 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-neon-teal/50 transition-all"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-neon-teal/10 text-neon-teal">
                  <Search size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !rank}
              className="w-full py-4 px-8 bg-neon-teal text-black font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-lg shadow-neon-teal/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Predict Colleges
                  <GraduationCap size={22} />
                </>
              )}
            </button>
          </form>
        </motion.section>

        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12 space-y-10"
            >
              {/* Dream Options Group */}
              {results.some(r => r.Status === "Dream") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-mango/10 border border-mango/20 text-[10px] font-bold text-mango uppercase tracking-widest">
                      Dream / Reach
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-mango/20 to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {results.filter(r => r.Status === "Dream").map((college, i) => (
                      <CollegeCard key={`dream-${i}`} college={college} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Options Group */}
              {results.some(r => r.Status === "Safe") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-neon-teal/10 border border-neon-teal/20 text-[10px] font-bold text-neon-teal uppercase tracking-widest">
                      Safe Bets
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-teal/20 to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {results.filter(r => r.Status === "Safe").map((college, i) => (
                      <CollegeCard key={`safe-${i}`} college={college} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center bg-background/30">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {error}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Please try for CSAB or leave your email, we'll get back to you sooner with more options!
                </p>

                {leadSaved ? (
                  <div className="flex flex-col items-center gap-2 text-neon-teal p-4 rounded-xl bg-neon-teal/5 border border-neon-teal/20">
                    <CheckCircle2 size={24} />
                    <span className="font-semibold text-sm">Thank you! We'll be in touch soon.</span>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="max-w-sm mx-auto">
                    <div className="relative flex gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal/50 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-neon-teal text-black font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                      >
                        Notify Me
                        <Send size={14} />
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
          transition={{ delay: 0.3 }}
          className="mb-12 flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs"
        >
          <Info size={16} className="shrink-0" />
          <p>
            Note: Predictions are based on historical **2025** cutoff data. Actual results may vary depending on seat matrix and current trends.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-2xl border border-border/70 bg-background/50 backdrop-blur-sm p-6 sm:p-8 mb-8"
        >
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground mb-5">
            <span className="shrink-0" aria-hidden>
              🔍
            </span>
            How to Search the JoSAA Cutoff Database
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              To keep our data secure and ensure multiple students can search at the exact same time without
              interrupting each other, this database is set to <span className="text-foreground font-medium">View Only</span>.
            </p>
            <p>
              However, you can still easily search and filter the data using a{" "}
              <span className="text-foreground font-medium">Temporary Filter View</span>. Here is how to do it in 3
              quick steps:
            </p>

            <div className="space-y-5 pt-1">
              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 1: Open the Database</h3>
                <p>
                  Click one of the JoSAA sheet links in the <span className="text-foreground font-medium">JoSAA Cutoff Data</span>{" "}
                  section below to open the official College Connects JoSAA Database in Google Sheets.
                </p>
              </div>

              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 2: Create Your Private Filter</h3>
                <p className="mb-3">
                  Because the sheet is View Only, the normal filter button is locked. Instead, look at the top menu
                  bar:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-0.5 marker:text-neon-teal marker:font-semibold">
                  <li>
                    Click on <span className="text-foreground font-medium">Data</span>.
                  </li>
                  <li>
                    Hover over <span className="text-foreground font-medium">Filter views</span>.
                  </li>
                  <li>
                    Click on <span className="text-foreground font-medium">Create new temporary filter view</span>.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 3: Search Your Dream Colleges!</h3>
                <p className="mb-3">
                  The edges of your screen will turn dark grey. This means you are now in a private, temporary
                  workspace!
                </p>
                <p className="mb-3">
                  You will now see the filter icons (little funnels) at the top of every column.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-0.5 marker:text-neon-teal">
                  <li>
                    Click the funnel on the <span className="text-foreground font-medium">Institute Name</span> column to
                    search for specific IITs or NITs.
                  </li>
                  <li>
                    Click the funnel on the <span className="text-foreground font-medium">Program Name</span> to filter
                    for CSE, Electrical, etc.
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xs sm:text-sm pt-4 border-t border-border/50 text-muted-foreground">
              <span className="text-foreground font-medium">Note:</span> Since this is a temporary view, your filtering
              will not affect anyone else looking at the sheet, and it will disappear as soon as you close the tab.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl border border-border/70 bg-background/50 backdrop-blur-sm p-6 sm:p-8"
        >
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground mb-5">
            <Table2 size={22} className="text-neon-orange shrink-0" aria-hidden />
            JoSAA Cutoff Data
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Open the sheet for the year you need. Each link opens in a new tab.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <a
              href={JOSAA_2025_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neon-teal/50 bg-neon-teal/10 hover:bg-neon-teal/20 text-foreground font-medium px-5 py-3 text-sm transition-colors"
            >
              JoSAA 2025
              <ExternalLink size={16} className="opacity-80" aria-hidden />
            </a>
            <div className="flex flex-col gap-1.5 sm:items-start">
              <a
                href={JOSAA_2024_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border hover:border-neon-orange/50 hover:bg-neon-orange/5 text-foreground font-medium px-5 py-3 text-sm transition-colors w-full sm:w-auto"
              >
                JoSAA 2024
                <ExternalLink size={16} className="opacity-80" aria-hidden />
              </a>
              <p className="text-xs text-muted-foreground px-1">
                For JoSAA 2024 or 2025: if the sheet asks for a password, use <span className="font-mono text-foreground">1234</span>.
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-5">
            After opening a sheet, follow the steps above to create a temporary filter view and narrow down institutes
            and programs.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
