import { useState, useEffect, useRef } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getAdvisorsDirectory,
  getMyStudentProfile,
  getMyBookings,
  type AdvisorDirectoryItem,
  type StudentProfileResponse,
  type BookingResponse,
  syncBookingStatus,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Search, ChevronDown, Star, ArrowRight, Gift, Video, RefreshCw, IndianRupee, Monitor, Loader, CheckCircle2, MapPin, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StudentReferEarnPage from "./StudentReferEarnPage";
import { BrandLogo } from "@/components/BrandLogo";
import { use3DTilt } from "@/hooks/use3DTilt";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/animations";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { MiniCalendar } from "@/components/MiniCalendar";

const TABS = [
  { id: "advisors", label: "Find Advisors", icon: Search },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "predictor", label: "College Predictor", icon: Trophy },
  { id: "refer", label: "Refer & Earn", icon: Gift },
];

const ADVISOR_COLORS = [
  { bg: "bg-navy-light", text: "text-navy", border: "border-navy/10", gradient: "from-blue-500/10 to-navy/10" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", gradient: "from-emerald-400/10 to-emerald-600/10" },
  { bg: "bg-mango-light", text: "text-mango-dark", border: "border-mango/10", gradient: "from-mango/10 to-orange-500/10" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", gradient: "from-rose-400/10 to-rose-600/10" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", gradient: "from-indigo-400/10 to-indigo-600/10" },
];

const getAdvisorTheme = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  return ADVISOR_COLORS[charCode % ADVISOR_COLORS.length];
};

function AdvisorCard({ advisor, onClick }: { advisor: AdvisorDirectoryItem; onClick: () => void }) {
  const theme = getAdvisorTheme(advisor.name);
  const dummyBio = "Top-tier student advisor specialized in navigating campus culture, academic excellence, and career roadmaps. Passionate about helping peers succeed.";
  const dummyFocus = advisor.branch || "General Mentorship";

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={onClick}
      className="card-solid group rounded-[2.5rem] p-8 flex flex-col h-full cursor-pointer relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50"
    >
      {/* Decorative Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex items-start gap-6 mb-6">
        <div className={`w-16 h-16 rounded-[1.5rem] ${theme.bg} ${theme.border} border flex items-center justify-center text-2xl font-black ${theme.text} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          {advisor.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <h4 className="text-xl font-black text-slate-900 group-hover:text-navy transition-colors truncate">
              {advisor.name}
            </h4>
            {advisor.session_price > 150 && (
              <span className="bg-mango/10 text-mango-dark text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Top Rated</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] truncate mb-3">{advisor.college || "Leading University"}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-900 group-hover:bg-white group-hover:border-navy/10 transition-all">
             <IndianRupee size={12} className="text-navy" />
             ₹{advisor.session_price || 100} / session
          </div>
        </div>
      </div>

      <div className="flex-1 mb-8">
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
          "{advisor.bio?.length > 10 ? advisor.bio : dummyBio}"
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex flex-col">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300 mb-1">Focus Area</p>
          <p className="text-xs font-black text-slate-900 group-hover:text-navy transition-colors">{dummyFocus}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center ${theme.text} transition-all duration-500 group-hover:bg-navy group-hover:text-white group-hover:border-navy group-hover:shadow-xl group-hover:shadow-navy/20`}>
          <ArrowRight size={22} strokeWidth={3} />
        </div>
      </div>
    </motion.div>
  );
}

function BookingCardContent({ booking }: { booking: BookingResponse }) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const u = getFirebaseAuth().currentUser;
    if (!u) return;
    setSyncing(true);
    try {
      const token = await u.getIdToken(true);
      const res = await syncBookingStatus(token, booking.id);
      if (res.ok) {
        alert("Payment verified!");
        window.location.reload(); 
      } else {
        alert(res.message || "Payment pending.");
      }
    } catch (err) {
      alert("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="card-solid rounded-2xl p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Session</p>
          <p className="text-lg font-bold text-slate-900">{booking.advisor_name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`stat-badge ${
            booking.status === "confirmed" || booking.status === "finalized"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : booking.status === "cancelled"
              ? "bg-red-50 text-red-700 border-red-100"
              : booking.status === "changed"
              ? "bg-violet-50 text-violet-700 border-violet-100"
              : "bg-orange-50 text-orange-700 border-orange-100"
          }`}>
            {booking.status?.toUpperCase() || "PENDING"}
          </span>
          {booking.status === "pending" && (
            <button onClick={handleSyncStatus} disabled={syncing} className="text-[10px] text-orange-600 font-bold hover:underline flex items-center gap-1 transition-all">
              <RefreshCw size={10} className={syncing ? "animate-spin" : ""} />
              VERIFY NOW
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
          <Calendar size={14} className="text-slate-400" />
          <span>{booking.selected_slot || "No date set"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
          <Video size={14} className="text-slate-400" />
          <span>Google Meet Room</span>
        </div>
      </div>

      <button
        disabled={!booking.meet_link || (booking.status !== "confirmed" && booking.status !== "finalized")}
        className="btn-primary w-full h-11 text-sm disabled:opacity-30"
        onClick={() => booking.meet_link && window.open(booking.meet_link, "_blank")}
      >
        {booking.status === "pending" ? "Waiting for Approval" : "Join Session"}
      </button>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("advisors");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorDirectoryItem[]>([]);
  const [advisorsLoading, setAdvisorsLoading] = useState(true);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Student Dashboard | CollegeConnects";
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, u => {
      setAuthUser(u);
      if (u) {
        loadProfile(u);
      }
    });
  }, []);

  const loadProfile = async (u: FirebaseUser) => {
    try {
      const storedRole = localStorage.getItem("user_role");
      if (storedRole && storedRole !== "student") {
        navigate({ to: "/advisor/dashboard" });
        return;
      }

      const token = await u.getIdToken(true);
      const profile = await getMyStudentProfile(token);
      setStudent(profile);
      localStorage.setItem("user_role", "student");
    } catch (e: any) {
      console.error("StudentDashboard profile load failed:", e);
      if (e.status === 403 || (e.message && e.message.includes("403"))) {
        alert("Access Denied: You are registered as an Advisor.");
        navigate({ to: "/advisor/dashboard" });
      } else {
        // Not found or other error
        navigate({ to: "/auth/signup" });
      }
    }
  };

  useEffect(() => {
    const loadAdvisors = async () => {
      setAdvisorsLoading(true);
      try {
        const list = await getAdvisorsDirectory();
        setAdvisors(Array.isArray(list) ? list : []);
      } catch (e) {
        setAdvisors([]);
      } finally {
        setAdvisorsLoading(false);
      }
    };
    void loadAdvisors();
  }, []);

  useEffect(() => {
    if (activeTab !== "sessions" || !authUser) return;
    const loadBookings = async () => {
      try {
        const token = await authUser.getIdToken(true);
        const list = await getMyBookings(token);
        setSessionBookings(list);
      } catch (e) {
        setSessionBookings([]);
      }
    };
    void loadBookings();
  }, [authUser, activeTab]);

  const welcomeName = student?.name || authUser?.displayName || "Student";
  const dynamicColleges = ["All Colleges", ...new Set(advisors.map(a => a.college).filter(Boolean).sort() as string[])];
  const dynamicBranches = ["All Branches", ...new Set(advisors.map(a => a.branch).filter(Boolean).sort() as string[])];

  const filteredAdvisors = advisors.filter((a) => {
    const name = String(a.name ?? "").toLowerCase();
    const college = String(a.college ?? a.detected_college ?? "").toLowerCase();
    const branch = String(a.branch ?? "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const collegeMatch = selectedCollege === "All Colleges" || college.includes(selectedCollege.toLowerCase());
    const branchMatch = selectedBranch === "All Branches" || branch.includes(selectedBranch.toLowerCase());
    const searchMatch = query === "" || name.includes(query) || college.includes(query) || branch.includes(query);

    return collegeMatch && branchMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-navy/10 selection:text-navy relative overflow-hidden">
      {/* ── Rich Background Design ── */}
      {/* Large navy gradient blob — top left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-navy/10 via-blue-400/5 to-transparent blur-3xl pointer-events-none" />
      {/* Accent blob — bottom right */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-blue-200/20 via-slate-200/10 to-transparent blur-2xl pointer-events-none" />
      {/* Fine diagonal line grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: `repeating-linear-gradient(45deg, #1E3A8A 0px, #1E3A8A 1px, transparent 1px, transparent 28px)`, backgroundSize: '40px 40px' }}
      />
      {/* Dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#1E3A8A 0.8px, transparent 0.8px)`, backgroundSize: '32px 32px' }} />
      
      <div className="pt-32 pb-28 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy">Student Dashboard</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Hello, <span className="text-navy">{welcomeName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-bold max-w-lg leading-relaxed">
              Find and connect with verified student advisors.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "bg-[#1E3A8A] text-white shadow-lg shadow-navy/20" 
                      : "text-slate-500 hover:text-navy hover:bg-slate-50"
                  }`}
                >
                  <tab.icon size={14} strokeWidth={3} />
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>

            {authUser && (
              <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Logged in as</p>
                  <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[120px]">{welcomeName}</p>
                </div>
                <ProfileDropdown role="student" userName={authUser.displayName || student?.name} avatarUrl={authUser.photoURL || undefined} />
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "advisors" && (
            <motion.div
              key="advisors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Search Bar Professional */}
              <div className="bg-white border border-slate-200 p-2 sm:p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-2 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search advisors, colleges, or courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50/50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-navy/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="flex-1 md:w-52 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50"
                  >
                    {dynamicColleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="flex-1 md:w-52 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50"
                  >
                    {dynamicBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {advisorsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card-solid rounded-2xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : filteredAdvisors.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-3xl">
                  <Search size={40} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-1">No advisors found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer()} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAdvisors.map((advisor) => (
                    <AdvisorCard key={advisor.id} advisor={advisor} onClick={() => navigate({ to: `/student/advisor/${advisor.id}` })} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "sessions" && (
            <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="card-solid p-6 md:col-span-1 lg:col-span-2 bg-white border-l-4 border-l-navy flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Active Bookings</p>
                    <p className="text-3xl font-black text-slate-900">{sessionBookings.length}</p>
                 </div>
                 <div className="lg:col-span-1">
                    <MiniCalendar sessions={sessionBookings.map(b => ({
                      date: b.scheduled_time ? b.scheduled_time.split('T')[0] : "",
                      title: b.advisor_name,
                      status: b.status
                    }))} />
                 </div>
              </div>

              {sessionBookings.length === 0 ? (
                <div className="text-center py-24 card-solid rounded-3xl">
                  <Calendar size={40} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">No sessions scheduled</h3>
                  <p className="text-slate-500 font-medium mt-1 mb-6">Start your journey by booking a call with an advisor.</p>
                  <button onClick={() => setActiveTab('advisors')} className="text-orange-600 font-bold hover:gap-2 transition-all inline-flex items-center gap-1.5">
                    Browse Advisors <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessionBookings.map((booking) => (
                    <BookingCardContent key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "predictor" && (
            <motion.div key="predictor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
               <div className="card-solid p-8 text-center bg-white border-l-4 border-l-navy relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-navy/10 rounded-3xl flex items-center justify-center text-navy mx-auto mb-6 shadow-sm">
                      <Trophy size={40} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">College Predictor 2025</h3>
                    <p className="text-slate-500 font-bold max-w-lg mx-auto mb-8 leading-relaxed">
                      Estimate your chances in IITs, NITs, and IIITs based on your JEE Main rank, category, and gender pool.
                    </p>
                    <button 
                      onClick={() => navigate({ to: "/college-predictor" })}
                      className="btn-primary py-4 px-10 text-sm font-black flex items-center gap-3 mx-auto shadow-xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      OPEN PREDICTOR <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === "refer" && (
            <motion.div key="refer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <StudentReferEarnPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Sticky Bottom Nav (hidden on sm+) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_30px_-8px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? "text-navy"
                  : "text-slate-400"
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? "bg-navy/10" : ""
              }`}>
                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
              </div>
              <span className={`text-[10px] font-black tracking-wide ${
                activeTab === tab.id ? "text-navy" : "text-slate-400"
              }`}>{tab.label.split(" ")[0].toUpperCase()}</span>
            </button>
          ))}

          {/* Profile avatar on mobile */}
          {authUser && (
            <div className="flex flex-col items-center gap-1">
              <ProfileDropdown
                role="student"
                userName={authUser.displayName || student?.name}
                avatarUrl={authUser.photoURL || undefined}
              />
              <span className="text-[10px] font-black text-slate-400 tracking-wide">PROFILE</span>
            </div>
          )}
        </div>
        {/* Home Indicator Safe Area */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}