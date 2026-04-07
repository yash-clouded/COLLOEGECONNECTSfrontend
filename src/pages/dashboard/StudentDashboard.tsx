import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getAdvisorsDirectory,
  getMyStudentProfile,
  getMyBookings,
  getStudentReferralSummary,
  type AdvisorDirectoryItem,
  type StudentProfileResponse,
  type BookingResponse,
  type ReferralSummaryResponse,
  updateMyStudentProfile,
  syncBookingStatus,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, User, Calendar, Search, ChevronDown, Star, ArrowRight, Gift, Video, RefreshCw, IndianRupee, CreditCard, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import StudentReferEarnPage from "./StudentReferEarnPage";

const COLLEGES = ["All Colleges", "RGIPT", "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani"];
const BRANCHES = ["All Branches", "Computer Science", "Petroleum Engineering", "Information Technology", "Electronics Engineering", "Mathematics and Computing"];

const avatarColors = [
  "from-neon-orange to-orange-400",
  "from-neon-teal to-teal-400",
  "from-neon-blue to-blue-400",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

const TABS = [
  { id: "advisors", label: "Find Advisors", icon: Search },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "refer", label: "Refer & Earn", icon: Gift },
  { id: "profile", label: "My Profile", icon: User },
];

function BookingCardContent({ booking }: { booking: BookingResponse }) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) return;

    setSyncing(true);
    try {
      const token = await u.getIdToken(true);
      const res = await syncBookingStatus(token, booking.id);
      if (res.ok) {
        alert("Payment verified! Your session is now confirmed.");
        window.location.reload(); 
      } else {
        alert(res.message || "Payment not yet received.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!booking.meet_link) return;
    window.open(booking.meet_link, "_blank");
  };

  return (
    <div className="glass rounded-2xl border border-border p-5 hover:border-neon-teal/50 transition-colors group flex flex-col h-full cursor-pointer overflow-hidden">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Advisor</p>
            <p className="text-lg font-semibold text-foreground">{booking.advisor_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p
              className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-medium ${
                booking.status === "confirmed" || booking.status === "finalized"
                  ? "bg-neon-teal/10 border-neon-teal/30 text-neon-teal"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500"
              }`}
            >
              {booking.status || "pending"}
            </p>
            {booking.status === "pending" && (
              <button
                onClick={handleSyncStatus}
                disabled={syncing}
                className="inline-flex items-center gap-1 text-neon-teal hover:text-neon-teal/80 transition-colors"
                title="Already paid? Click to sync status"
              >
                <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                <span className="text-[10px] font-semibold underline">Check Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            disabled={!booking.meet_link || (booking.status !== "confirmed" && booking.status !== "finalized")}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-neon-teal hover:bg-neon-teal/90 text-black text-xs font-semibold h-9 rounded-xl transition-all disabled:opacity-50"
            onClick={handleJoin}
          >
            <Video size={14} />
            {booking.status === "pending" ? "Pending" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("advisors");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorDirectoryItem[]>([]);
  const [advisorsLoading, setAdvisorsLoading] = useState(true);
  const [advisorsError, setAdvisorsError] = useState<string | null>(null);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    state: "",
    academic_status: "",
    jee_mains_percentile: "",
    jee_mains_rank: "",
  });
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    document.title = "Student Dashboard — CollegeConnect";
  }, []);
  const [referralSummary, setReferralSummary] = useState<ReferralSummaryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadBookings = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u || activeTab !== "sessions") return;
      try {
        const token = await u.getIdToken(true);
        const list = await getMyBookings(token);
        if (!cancelled) setSessionBookings(list);
      } catch (e) {
        if (!cancelled) setSessionBookings([]);
      }
    };
    void loadBookings();
    const timer = setInterval(() => void loadBookings(), 30000); // 30s polling
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, activeTab]);

  useEffect(() => {
    let cancelled = false;
    const loadReferral = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u || activeTab !== "profile") return;
      try {
        const token = await u.getIdToken(true);
        const data = await getStudentReferralSummary(token);
        if (!cancelled) setReferralSummary(data);
      } catch (e) {
        /* ignore */
      }
    };
    void loadReferral();
    return () => {
      cancelled = true;
    };
  }, [authUser?.uid, activeTab]);
  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, setAuthUser);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u) {
        setLoadingProfile(false);
        setProfileError("Sign in to view your student profile.");
        return;
      }
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const token = await u.getIdToken(true);
        const profile = await getMyStudentProfile(token);
        if (!cancelled) setStudent(profile);
      } catch (e) {
        if (!cancelled) {
          setProfileError(
            e instanceof Error ? e.message : "Could not load student profile.",
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [authUser?.uid]);
  useEffect(() => {
    if (!student) return;
    setEditForm({
      name: student.name || "",
      phone: student.phone || "",
      state: student.state || "",
      academic_status: student.academic_status || "",
      jee_mains_percentile: student.jee_mains_percentile || "",
      jee_mains_rank: student.jee_mains_rank || "",
    });
  }, [student]);
  useEffect(() => {
    let cancelled = false;
    const loadAdvisors = async () => {
      setAdvisorsLoading(true);
      setAdvisorsError(null);
      try {
        const list = await getAdvisorsDirectory();
        if (!cancelled) {
          setAdvisors(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (!cancelled) {
          setAdvisorsError(
            e instanceof Error ? e.message : "Could not load advisors.",
          );
          setAdvisors([]);
        }
      } finally {
        if (!cancelled) setAdvisorsLoading(false);
      }
    };
    void loadAdvisors();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentName = student?.name || "Student";
  const studentEmail = student?.email || authUser?.email || "Not available";
  const studentPhone = student?.phone || "Not available";
  const studentState = student?.state || "Not available";
  const studentAcademicStatus = student?.academic_status || "Not available";
  const studentJeeMainsPercentile = student?.jee_mains_percentile || "Not available";
  const studentJeeMainsRank = student?.jee_mains_rank || "Not available";
  const welcomeName =
    studentName ||
    authUser?.displayName?.trim() ||
    authUser?.email?.split("@")[0] ||
    "Student";
  const handleStudentSave = async () => {
    const u = getFirebaseAuth().currentUser;
    if (!u) {
      setProfileError("Sign in to edit your profile.");
      return;
    }
    setSavingProfile(true);
    try {
      const token = await u.getIdToken(true);
      const updated = await updateMyStudentProfile(token, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        state: editForm.state.trim(),
        academic_status: editForm.academic_status.trim(),
        jee_mains_percentile: editForm.jee_mains_percentile.trim(),
        jee_mains_rank: editForm.jee_mains_rank.trim(),
      });
      setStudent(updated);
      setIsEditingProfile(false);
      setProfileError(null);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const dynamicColleges = ["All Colleges", ...new Set(advisors.map(a => a.college).filter(Boolean).sort())];
  const dynamicBranches = ["All Branches", ...new Set(advisors.map(a => a.branch).filter(Boolean).sort())];

  const filteredAdvisors = advisors.filter((a) => {
    const name = String(a.name ?? "");
    const college = String(a.college ?? "");
    const branch = String(a.branch ?? "");
    const collegeMatch =
      selectedCollege === "All Colleges" || college === selectedCollege;
    const branchMatch =
      selectedBranch === "All Branches" || branch === selectedBranch;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      name.toLowerCase().includes(q) ||
      college.toLowerCase().includes(q) ||
      branch.toLowerCase().includes(q);
    return collegeMatch && branchMatch && searchMatch;
  });
  const mySessionBookings = sessionBookings; // backend already filters by student

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Welcome header — brand lives in navbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full min-w-0"
        >
          <h1 className="text-3xl font-display font-bold text-foreground break-words">
            Welcome back, <span className="gradient-text-orange">{welcomeName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Find your perfect college advisor today</p>
        </motion.div>
        {profileError ? (
          <p className="mb-4 text-sm text-amber-500">{profileError}</p>
        ) : null}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-neon-teal text-black"
                  : "glass border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}

        {/* FIND ADVISORS TAB */}
        {activeTab === "advisors" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Search + Filters */}
            <div className="glass border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search advisors, colleges, branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors appearance-none pr-8 cursor-pointer"
                >
                  {dynamicColleges.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors appearance-none pr-8 cursor-pointer"
                >
                  {dynamicBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Advisors Grid */}
            {advisorsError ? (
              <p className="mb-4 text-sm text-amber-500">{advisorsError}</p>
            ) : null}
            {advisorsLoading ? (
              <p className="mb-4 text-sm text-muted-foreground">Loading advisors…</p>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdvisors.map((advisor, i) => {
                const displayName = String(advisor.name ?? "").trim() || "Advisor";
                const initials = displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase() || "?";
                const sessionPrice = Number(advisor.session_price || "0");
                const preferredSlots = Array.isArray(advisor.preferred_timezones)
                  ? advisor.preferred_timezones
                  : [];
                const advisorId = String(advisor.id ?? "").trim();
                return (
                  <motion.div
                    key={advisorId || `advisor-${i}`}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl border border-border p-6 hover:border-neon-teal/40 transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      if (!advisorId) return;
                      navigate({
                        to: "/student/advisor/$advisorId",
                        params: { advisorId },
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!advisorId) return;
                        navigate({
                          to: "/student/advisor/$advisorId",
                          params: { advisorId },
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-lg font-bold text-white`}>
                        {initials}
                      </div>
                      <div className="flex flex-col items-end gap-2 max-w-[55%]">
                        <div className="flex items-center gap-1 glass rounded-full px-3 py-1">
                          <Star size={12} className="text-neon-orange fill-neon-orange" />
                          <span className="text-sm font-semibold">4.8</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground mb-1">Preferred slots</p>
                          {preferredSlots.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {preferredSlots.slice(0, 3).map((slot, si) => (
                                <p
                                  key={`${advisorId}-slot-${si}`}
                                  className="text-[11px] leading-4 text-muted-foreground truncate"
                                  title={slot}
                                >
                                  {slot}
                                </p>
                              ))}
                              {preferredSlots.length > 3 ? (
                                <p className="text-[11px] leading-4 text-muted-foreground">
                                  +{preferredSlots.length - 3} more
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-[11px] leading-4 text-muted-foreground">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{displayName}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={13} className="text-neon-teal" />
                      <span className="text-sm text-neon-teal">{advisor.college || "—"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{advisor.branch || "Branch not set"}</p>
                    <p className="text-sm text-muted-foreground mb-4">Verified advisor</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">per session</p>
                        <p className="text-xl font-bold text-neon-orange">
                          {sessionPrice > 0 ? `₹${sessionPrice}` : "₹0"}
                        </p>
                      </div>
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 bg-neon-orange hover:bg-neon-orange/80 text-black rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                          onClick={() => {
                            if (!advisorId) return;
                            navigate({
                              to: "/student/advisor/$advisorId",
                              params: { advisorId },
                            });
                          }}
                        >
                          Book
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!advisorsLoading && filteredAdvisors.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                {advisors.length === 0
                  ? "No advisors listed yet. Check back soon."
                  : "No advisors match your search or filters."}
              </div>
            )}
          </motion.div>
        )}

        {/* MY SESSIONS TAB */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {mySessionBookings.length === 0 ? (
              <div className="glass rounded-2xl border border-border p-8 text-center">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-6">Book a session with an advisor to get started!</p>
                <button
                  onClick={() => setActiveTab("advisors")}
                  className="inline-flex items-center gap-2 bg-neon-teal hover:bg-neon-teal/80 text-black font-semibold rounded-xl px-6 py-2.5 text-sm transition-all"
                >
                  Find Advisors
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySessionBookings.map((booking) => (
                  <BookingCardContent key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* REFER TAB */}
        {activeTab === "refer" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <StudentReferEarnPage />
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-6 sm:p-8"
          >
            {loadingProfile ? (
              <p className="text-sm text-muted-foreground mb-4">Loading profile…</p>
            ) : null}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-teal to-teal-400 flex items-center justify-center text-2xl font-bold text-white">
                {studentName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{studentName}</h2>
                <p className="text-muted-foreground text-sm">Student</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-6">
              <div className="glass border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-teal/10 flex items-center justify-center text-neon-teal">
                  <Monitor size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sessions</p>
                  <p className="text-xl font-bold text-foreground">{student?.total_sessions || 0}</p>
                </div>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-orange/10 flex items-center justify-center text-neon-orange">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Spent</p>
                  <p className="text-xl font-bold text-foreground">₹{student?.total_spent || 0}</p>
                </div>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Gift size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Referral Rewards</p>
                  <p className="text-xl font-bold text-foreground">₹{referralSummary?.referral_rewards_inr || 0}</p>
                </div>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm text-foreground font-medium">{studentEmail}</p>
                </div>
                {[
                  ["Name", "name"],
                  ["Phone", "phone"],
                  ["State", "state"],
                  ["Academic Status", "academic_status"],
                  ["JEE Mains Percentile", "jee_mains_percentile"],
                  ["JEE Mains Rank", "jee_mains_rank"],
                ].map(([label, key]) => (
                  <label key={key} className="text-xs text-muted-foreground flex flex-col gap-1">
                    {label}
                    <input
                      value={editForm[key as keyof typeof editForm]}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Email", value: studentEmail },
                  { label: "Phone", value: studentPhone },
                  { label: "State", value: studentState },
                  { label: "Academic Status", value: studentAcademicStatus },
                  { label: "JEE Mains Percentile", value: studentJeeMainsPercentile === "Not available" ? studentJeeMainsPercentile : `${studentJeeMainsPercentile}%` },
                  { label: "JEE Mains Rank", value: studentJeeMainsRank },
                ].map(item => (
                  <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {isEditingProfile ? (
                <>
                  <button
                    onClick={handleStudentSave}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 bg-neon-teal hover:bg-neon-teal/90 text-black rounded-xl px-5 py-2.5 text-sm transition-all disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="inline-flex items-center gap-2 border border-border text-foreground rounded-xl px-5 py-2.5 text-sm transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-2 border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 rounded-xl px-5 py-2.5 text-sm transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}