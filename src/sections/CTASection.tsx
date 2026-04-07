import { Search, ChevronDown, BookOpen, Star, ArrowRight, UserPlus, AlertCircle, Send, CheckCircle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";


const COLLEGES_WITH_BRANCHES: Record<string, string[]> = {
  "RGIPT": ["Computer Science", "Information Technology", "Computer Science and Design Engineering", "Mathematics and Computing", "Electronics Engineering", "Electrical Engineering (Major in E-Vehicle)", "Chemical Engineering", "Chemical(Major in Renewable / Major in Petrochemicals and Polymer)", "Petroleum Engineering", "Mechanical Engineering", "Civil Engineering"],
  "IIT Delhi": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering"],
  "IIT Bombay": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering", "Civil Engineering"],
  "NIT Trichy": ["Computer Science", "Information Technology", "Electronics Engineering", "Mechanical Engineering", "Civil Engineering"],
  "BITS Pilani": ["Computer Science", "Electronics Engineering", "Mathematics and Computing", "Mechanical Engineering", "Chemical Engineering"],
  "IIT Madras": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering"],
  "IIT Kharagpur": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering"],
};

const OTHER_ADVISORS: { id: string; name: string; college: string; branch: string; year: number; rating: number; sessionPrice: number }[] = [
  // { id: "b1", name: "Advisor Name", college: "IIT Delhi", branch: "Computer Science", year: 2, rating: 4.8, sessionPrice: 599 },
];

const avatarColors = [
  "from-neon-orange to-orange-400",
  "from-neon-teal to-teal-400",
  "from-neon-blue to-blue-400",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

// 🔧 TEMP: Change this to true when user is logged in via Supabase
const isLoggedIn = false;
const loggedInAs: "student" | "advisor" | null = null;

export default function CTASection() {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searched, setSearched] = useState(false);
  const [showStudentBlock, setShowStudentBlock] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryCollege, setInquiryCollege] = useState("");
  const [inquiryBranch, setInquiryBranch] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const availableBranches = selectedCollege ? COLLEGES_WITH_BRANCHES[selectedCollege] || [] : [];

  const filteredAdvisors = OTHER_ADVISORS.filter(a => {
    const collegeMatch = !selectedCollege || a.college === selectedCollege;
    const branchMatch = !selectedBranch || a.branch === selectedBranch;
    return collegeMatch && branchMatch;
  });

  const handleSearch = () => {
    if (!selectedCollege) {
      alert("Please select a college first!");
      return;
    }
    // ✅ If not logged in — show auth prompt
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      setSearched(false);
      return;
    }
    setSearched(true);
    setShowAuthPrompt(false);
    setShowStudentBlock(false);
    setInquirySent(false);
    setInquiryCollege(selectedCollege);
    setInquiryBranch(selectedBranch);
  };

  const handleSendInquiry = async () => {
    if (!inquiryName || !inquiryEmail || !inquiryCollege || !inquiryBranch) {
      alert("Please fill all fields!");
      return;
    }
    setSendingInquiry(true);
    await new Promise((res) => setTimeout(res, 2000));
    setSendingInquiry(false);
    setInquirySent(true);
    console.log("Inquiry sent:", { inquiryName, inquiryEmail, inquiryCollege, inquiryBranch });
    // TODO: Save to Supabase + send email to CollegeConnect
  };

  return (
    <section id="cta" className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 80% at 20% 50%, oklch(0.67 0.19 40 / 0.12), transparent 60%), radial-gradient(ellipse 60% 80% at 80% 50%, oklch(0.78 0.15 175 / 0.1), transparent 60%), radial-gradient(ellipse 40% 60% at 50% 20%, oklch(0.72 0.16 230 / 0.08), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(oklch(0.6 0.01 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.01 265) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass neon-border-orange rounded-full px-5 py-2 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />
            <span className="text-foreground/80">500+ advisors waiting to help you</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Find Your College
            <br />
            <span className="gradient-text-multi">Advisor Now</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Make the most important educational decision of your life with
            clarity and confidence. One session could change everything.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="glass border border-border rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedCollege}
                  onChange={(e) => {
                    setSelectedCollege(e.target.value);
                    setSelectedBranch("");
                    setSearched(false);
                    setShowAuthPrompt(false);
                    setShowStudentBlock(false);
                    setInquirySent(false);
                  }}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select College</option>
                  {Object.keys(COLLEGES_WITH_BRANCHES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSearched(false);
                    setShowAuthPrompt(false);
                    setShowStudentBlock(false);
                    setInquirySent(false);
                  }}
                  disabled={!selectedCollege}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Select Branch</option>
                  {availableBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
              </div>

              <button
                onClick={handleSearch}
                className="bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 glow-orange"
              >
                <Search size={16} />
                Find Advisor
              </button>
            </div>
          </div>

          {/* ✅ Auth Prompt — shown when not logged in */}
          <AnimatePresence>
            {showAuthPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl border border-neon-orange/30 py-10 px-6 max-w-md mx-auto mt-6"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Sign in to Find Advisors 🎓
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  You selected{" "}
                  {selectedBranch && <span className="text-foreground font-semibold">{selectedBranch}</span>}
                  {selectedBranch && " at "}
                  <span className="text-neon-teal font-semibold">{selectedCollege}</span>.
                  Please sign in or create an account to continue.
                </p>

                <div className="flex flex-col gap-3">
                  {/* Student buttons */}
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">As a Student</p>
                  <div className="flex gap-3">
                    <Link
                      to="/auth/student/login"
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 rounded-xl px-4 py-2.5 text-sm transition-all"
                    >
                      <LogIn size={14} />
                      Sign In
                    </Link>
                    <Link
                      to="/auth/student/signup"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-neon-teal hover:bg-neon-teal/80 text-black font-semibold rounded-xl px-4 py-2.5 text-sm transition-all"
                    >
                      <UserPlus size={14} />
                      Sign Up
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Advisor buttons */}
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">As an Advisor</p>
                  <div className="flex gap-3">
                    <Link
                      to="/auth/advisor/login"
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/10 rounded-xl px-4 py-2.5 text-sm transition-all"
                    >
                      <LogIn size={14} />
                      Sign In
                    </Link>
                    <Link
                      to="/auth/advisor/signup"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-neon-orange hover:bg-neon-orange/80 text-black font-semibold rounded-xl px-4 py-2.5 text-sm transition-all"
                    >
                      <UserPlus size={14} />
                      Sign Up
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results — only shown when logged in */}
          <AnimatePresence>
            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {filteredAdvisors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                    {filteredAdvisors.map((advisor, i) => {
                      const initials = advisor.name.split(" ").map(n => n[0]).join("");
                      return (
                        <motion.div
                          key={advisor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="glass rounded-2xl border border-border p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-lg font-bold text-white`}>
                              {initials}
                            </div>
                            <div className="flex items-center gap-1 glass rounded-full px-3 py-1">
                              <Star size={12} className="text-neon-orange fill-neon-orange" />
                              <span className="text-sm font-semibold">{advisor.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-foreground mb-1">{advisor.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen size={13} className="text-neon-teal" />
                            <span className="text-sm text-neon-teal">{advisor.college}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{advisor.branch}</p>
                          <p className="text-sm text-muted-foreground mb-4">Year {advisor.year}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                              <span className="text-xs text-muted-foreground">per session</span>
                              <div className="text-xl font-bold text-neon-orange">₹{advisor.sessionPrice}</div>
                            </div>
                            <Button size="sm" className="bg-neon-orange/90 hover:bg-neon-orange text-background font-semibold rounded-xl text-xs px-4">
                              Book Session
                              <ArrowRight size={12} className="ml-1" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* No Advisors Found — Inquiry Form */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl border border-border py-10 px-6 text-left"
                  >
                    <p className="text-muted-foreground text-lg mb-1 text-center">
                      No advisors yet for{" "}
                      {selectedBranch && <span className="text-foreground font-semibold">{selectedBranch}</span>}
                      {selectedBranch && " at "}
                      <span className="text-neon-teal font-semibold">{selectedCollege}</span>
                    </p>
                    <p className="text-muted-foreground text-sm mb-8 text-center">
                      Send your details to CollegeConnect and we'll notify you when an advisor joins!
                    </p>

                    {!inquirySent ? (
                      <div className="flex flex-col gap-4 max-w-md mx-auto">
                        <h3 className="text-foreground font-semibold text-center">📬 Notify Me</h3>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-muted-foreground">Your Name</label>
                          <input type="text" placeholder="Your full name" value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-muted-foreground">Your Email</label>
                          <input type="email" placeholder="you@gmail.com" value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-muted-foreground">College You Want</label>
                          <input type="text" placeholder="e.g. IIT Delhi" value={inquiryCollege}
                            onChange={(e) => setInquiryCollege(e.target.value)}
                            className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-muted-foreground">Branch You Want</label>
                          <input type="text" placeholder="e.g. Computer Science" value={inquiryBranch}
                            onChange={(e) => setInquiryBranch(e.target.value)}
                            className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
                        </div>

                        <button onClick={handleSendInquiry} disabled={sendingInquiry}
                          className="inline-flex items-center justify-center gap-2 bg-neon-orange hover:bg-neon-orange/80 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-300 glow-orange mt-2"
                        >
                          {sendingInquiry ? (
                            <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending...</>
                          ) : (
                            <><Send size={15} />Send to CollegeConnect</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">You're on the list! 🎉</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          We'll notify <span className="text-foreground font-medium">{inquiryEmail}</span> as soon as an advisor joins for
                        </p>
                        <p className="text-neon-teal font-semibold">{inquiryBranch} at {inquiryCollege}</p>
                      </motion.div>
                    )}

                    <div className="border-t border-border/50 mt-8 pt-6 text-center">
                      <p className="text-muted-foreground text-sm mb-4">
                        Are you a student from <span className="text-neon-teal font-semibold">{selectedCollege}</span>?
                      </p>

                      <AnimatePresence>
                        {showStudentBlock && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 glass border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-sm text-red-400 justify-center"
                          >
                            <AlertCircle size={16} />
                            Students cannot register as advisors. Only college students with a valid college email can apply.
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/auth/advisor/signup">
                          <Button className="bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-6 glow-orange">
                            <UserPlus size={16} className="mr-2" />
                            Become an Advisor
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => setShowStudentBlock(true)}
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl px-6">
                          I'm a Student
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-border/30">
            {[
              "✓ No subscription required",
              "✓ Book in under 2 minutes",
              "✓ Verified student advisors",
              "✓ Satisfaction guaranteed",
            ].map((item) => (
              <span key={item} className="text-sm text-muted-foreground">{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}