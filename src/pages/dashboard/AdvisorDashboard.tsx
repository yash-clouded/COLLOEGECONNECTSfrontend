import { useState, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  getMyBookings,
  type AdvisorProfileResponse,
  type BookingResponse,
} from "@/lib/restApi";
import { computeEffectiveStudyYear, formatStudyYearLabel } from "@/lib/advisorStudyYear";
import { computeProfileCompletion, getCompletionBadge } from "@/lib/profileCompletion";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, Calendar, IndianRupee, Star, TrendingUp, Users, Wallet, ArrowUpRight, History, Gift, CheckCircle2, ShieldCheck, Clock, ArrowRight, Edit3, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdvisorReferEarnPage from "./AdvisorReferEarnPage";
import { BrandLogo } from "@/components/BrandLogo";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { MiniCalendar } from "@/components/MiniCalendar";

const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "earnings", label: "Earnings", icon: IndianRupee },
  { id: "refer", label: "Refer & Earn", icon: Gift },
];

const STUDENT_COLORS = [
  { bg: "bg-navy-light", text: "text-navy", border: "border-navy/10" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  { bg: "bg-mango-light", text: "text-mango-dark", border: "border-mango/10" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
];

const getStudentTheme = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  return STUDENT_COLORS[charCode % STUDENT_COLORS.length];
};

function StatCard({ label, value, icon: Icon, colorClass, delay = 0 }: { label: string; value: string | number; icon: any; colorClass: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay }}
      className="card-solid rounded-2xl p-8 group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-mango transition-all duration-300`}>
          <Icon size={22} className={`${colorClass} group-hover:text-white transition-colors`} />
        </div>
        <div className="stat-badge bg-slate-50 text-slate-500 font-black border-slate-100">MONTHLY</div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className={`text-4xl font-black text-slate-900 group-hover:text-mango transition-colors tracking-tight`}>{value}</p>
      </div>
    </motion.div>
  );
}

export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);

  useEffect(() => {
    document.title = "Advisor Dashboard | CollegeConnects";
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
      if (storedRole && storedRole !== "advisor") {
        navigate({ to: "/student/dashboard" });
        return;
      }

      const token = await u.getIdToken(true);
      const profile = await getMyAdvisorProfile(token);
      setAdvisor(profile);
      localStorage.setItem("user_role", "advisor");
    } catch (e: any) {
      console.error("AdvisorDashboard profile load failed:", e);
      if (e.status === 403 || (e.message && e.message.includes("403"))) {
        alert("Access Denied: You are registered as a Student.");
        navigate({ to: "/student/dashboard" });
      } else {
        // Not found or other error
        navigate({ to: "/auth/signup" });
      }
    }
  };

  const handleSync = async (bookingId: string) => {
    if (!authUser) return;
    const token = await authUser.getIdToken(true);
    const res = await fetch(`/api/payments/sync-status/${bookingId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.ok) {
      alert("Status synced!");
      window.location.reload();
    } else {
      alert(data.message || "No update.");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    finalized: "bg-navy-light text-navy border-navy/10",
    changed: "bg-violet-50 text-violet-700 border-violet-100",
  };

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

  const welcomeName = advisor?.name?.split(' ')[0] || authUser?.displayName?.split(' ')[0] || "Advisor";
  const advisorTotalEarnings = advisor?.total_earnings ?? 0;
  const advisorTotalSessions = advisor?.total_sessions ?? 0;
  const advisorTotalStudents = advisor?.total_students ?? 0;
  const completionPct = computeProfileCompletion(advisor);
  const isCompleteEnough = completionPct >= 50;
  const badge = getCompletionBadge(completionPct);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-mango/10 selection:text-mango relative overflow-hidden">
      {/* ── Rich Background Design ── */}
      {/* Large mango gradient blob — top right */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-mango/12 via-amber-300/5 to-transparent blur-3xl pointer-events-none" />
      {/* Warm accent blob — bottom left */}
      <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-orange-100/30 via-amber-50/10 to-transparent blur-2xl pointer-events-none" />
      {/* Fine diagonal line grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `repeating-linear-gradient(-45deg, #F5A623 0px, #F5A623 1px, transparent 1px, transparent 28px)`, backgroundSize: '40px 40px' }}
      />
      {/* Dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(#F5A623 0.8px, transparent 0.8px)`, backgroundSize: '32px 32px' }} />
      
      <div className="pt-32 pb-28 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3">
               <span className={`stat-badge flex items-center gap-1 px-2.5 ${isCompleteEnough ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                {isCompleteEnough ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                {isCompleteEnough ? "ADVISOR PORTAL ACTIVE" : "REGISTRATION PENDING"}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Hello, <span className="text-mango">{welcomeName}</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 max-w-md leading-relaxed">
              {isCompleteEnough ? "Manage your availability and track your impact." : "Please complete your verification to start guiding students."}
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  disabled={!isCompleteEnough && tab.id !== "overview"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap disabled:opacity-30 disabled:grayscale ${
                    activeTab === tab.id
                      ? "bg-[#F5A623] text-white shadow-lg shadow-mango/20"
                      : "text-slate-500 hover:text-mango-dark hover:bg-slate-50"
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
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Logged in as</p>
                  <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[120px]">{welcomeName}</p>
                </div>
                <ProfileDropdown 
                  role="advisor" 
                  userName={welcomeName} 
                  avatarUrl={authUser.photoURL || undefined} 
                />
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isCompleteEnough ? (
            <motion.div 
               key="locked" 
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }} 
               className="card-solid rounded-[3rem] p-12 overflow-hidden relative flex flex-col items-center text-center py-24"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-mango/5 blur-3xl -mr-32 -mt-32 rounded-full" />
               <div className="w-24 h-24 rounded-[2rem] bg-mango/10 flex items-center justify-center text-mango mb-8">
                  <ShieldCheck size={48} strokeWidth={3} />
               </div>
               <h2 className="text-4xl font-display font-black text-slate-900 mb-4">Verification Required</h2>
               <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 leading-relaxed text-lg">
                 You are currently at <span className={badge.color}>{completionPct}%</span> completion. Reach 50% to unlock the dashboard.
               </p>
               
               <div className="w-full max-w-md bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 mb-12">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    className={`h-full transition-all duration-1000 ${badge.color.replace('text-', 'bg-')}`}
                  />
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mb-12">
                 {[
                   { label: "Branch Name", done: !!advisor?.branch },
                   { label: "College ID Card", done: !!advisor?.college_id_front_key },
                   { label: "JEE Mains Rank", done: !!advisor?.jee_mains_rank },
                 ].map((req, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-3 ${req.done ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"}`}>
                       {req.done ? <CheckCircle2 size={16} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                       <span className="text-xs font-black uppercase tracking-widest">{req.label}</span>
                    </div>
                 ))}
               </div>

               <button 
                onClick={() => navigate({ to: "/advisor/profile" })}
                className="btn-primary h-16 px-12 text-sm bg-mango hover:bg-mango-dark flex items-center gap-3 shadow-2xl shadow-mango/30"
               >
                 COMPLETE 50% TO UNLOCK <ArrowRight size={20} />
               </button>
            </motion.div>
          ) : activeTab === "overview" && (
            <motion.div key="overview" variants={staggerContainer()} initial="initial" animate="animate" exit={{ opacity: 0, y: -10 }} className="space-y-10">
              {(!advisor?.preferred_timezones || advisor.preferred_timezones.length === 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-6 flex items-start gap-5 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Set Your Availability</h4>
                    <p className="text-sm text-amber-700 font-bold mb-4">Students cannot book sessions with you until you add your preferred time slots. This is required for your profile to appear to students.</p>
                    <button 
                      onClick={() => navigate({ to: "/advisor/profile" })}
                      className="bg-amber-600 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                      Setup Availability Now
                    </button>
                  </div>
                </motion.div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard label="Total Earnings" value={`₹${advisorTotalEarnings}`} icon={IndianRupee} colorClass="text-emerald-600" delay={0.1} />
                  <StatCard label="Sessions" value={advisorTotalSessions} icon={Calendar} colorClass="text-orange-600" delay={0.2} />
                  <StatCard label="Rating" value="5.0 / 5" icon={Star} colorClass="text-amber-500" delay={0.3} />
                </div>
                <div className="lg:col-span-1">
                  <MiniCalendar sessions={sessionBookings.map(b => ({
                    date: b.scheduled_time ? b.scheduled_time.split('T')[0] : "",
                    title: b.student_name,
                    status: b.status
                  }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-solid rounded-[2rem] p-8 flex flex-col sm:flex-row gap-8 items-center">
                  <div className="w-28 h-28 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl font-bold text-slate-800 shrink-0">
                    {welcomeName.charAt(0)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                      <span className={`stat-badge ${isCompleteEnough ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'} px-3`}>
                        {isCompleteEnough ? 'IDENTITY VERIFIED' : 'PENDING REVIEW'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{advisor?.name}</p>
                    <p className="text-sm text-slate-500 font-bold mb-5">{advisor?.detected_college} • {advisor?.branch}</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session Rate</p>
                        <p className="text-lg font-bold text-slate-900">₹{advisor?.session_price}/hr</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Availability</p>
                        <p className="text-lg font-bold text-slate-900">{advisor?.preferred_timezones?.length || 0} Slots</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.5rem] p-10 flex flex-col justify-between bg-mango text-white shadow-2xl shadow-mango/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8 relative z-10">
                    <Users size={28} className="text-white" />
                  </div>
                   <div>
                     <p className="text-6xl font-black text-white leading-none tracking-tighter">{advisorTotalStudents}</p>
                     <p className="text-lg font-black text-white mt-1">Students Guided</p>
                     <p className="text-sm text-white/90 mt-4 leading-relaxed font-bold">
                       Great job! Your profile response rate is currently in the <span className="text-white font-black underline decoration-white/30 underline-offset-4">top 5%</span>.
                     </p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "sessions" && (
            <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
               <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Booked Sessions</h2>
                  <p className="text-slate-500 font-bold mt-1">Accept and manage your mentor calls.</p>
                </div>
              </div>

              {sessionBookings.length === 0 ? (
                <div className="text-center py-24 card-solid rounded-[2.5rem]">
                   <Calendar size={40} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">No active sessions</h3>
                  <p className="text-slate-500 font-medium">New student bookings will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {sessionBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => navigate({ to: "/advisor/session/$bookingId", params: { bookingId: booking.id } })}
                      className="card-solid group rounded-2xl p-6 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Student</p>
                          <p className="text-lg font-bold text-slate-900">{booking.student_name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`stat-badge ${statusColors[booking.status] || "bg-slate-50 text-slate-700"}`}>
                            {booking.status?.toUpperCase() || "PENDING"}
                          </span>
                          {booking.status === "pending" && (
                            <button onClick={() => handleSync(booking.id)} className="text-[10px] text-amber-600 font-bold hover:underline">
                              SYNC STATUS
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Payout</p>
                          <p className="text-sm font-bold text-slate-900">₹{booking.session_price}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Time</p>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{booking.selected_slot}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                        <span>EST. SESSION COMPLETION</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center transition-all group-hover:bg-navy group-hover:text-white">
                          <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                   ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "earnings" && (
            <motion.div key="earnings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
               <div className="rounded-[2.5rem] p-10 bg-slate-900 text-white overflow-hidden relative border-none shadow-2xl shadow-slate-900/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-mango/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                          <Wallet size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Your Wallet</h3>
                          <p className="text-sm text-slate-400 font-medium tracking-tight">Financial settlement and reports.</p>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest border border-emerald-500/30">PENDING PAYOUTS: ₹0</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Escrow Balance (Net)</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-6xl font-extrabold text-white tracking-tight">₹{Math.floor(advisorTotalEarnings * 0.7)}</span>
                          <span className="text-slate-500 text-xl font-bold uppercase tracking-widest">INR</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-5 font-medium">* Settlement after 30% platform fee coverage.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mb-2">
                        <button 
                          onClick={() => alert("Banking settlement feature is being enabled for your account. Please check back in 24-48 hours.")}
                          className="flex-1 btn-primary bg-mango hover:bg-mango-dark border-none px-8 py-5 text-base active:scale-95 transition-transform"
                        >
                          Transfer to Bank
                        </button>
                        <button 
                          onClick={() => alert("Payout history will be available after your first successful settlement.")}
                          className="flex-1 bg-white border-2 border-white hover:bg-slate-50 text-mango px-8 py-5 text-base font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-black/10"
                        >
                          History
                        </button>
                      </div>
                    </div>
                  </div>
               </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card-solid rounded-[2rem] p-10">
                    <h4 className="text-lg font-bold text-slate-900 mb-8">Payout Information</h4>
                    <div className="space-y-5">
                       {[
                         { l: "Platform Retention", v: "30%", c: "text-red-600" },
                         { l: "Taxes & Duties", v: "Inclusive", c: "text-slate-900" },
                         { l: "Settlement Cycle", v: "Weekly (Mon)", c: "text-orange-600" },
                         { l: "Payment Status", v: "Linked Account", c: "text-emerald-600" },
                       ].map(i => (
                         <div key={i.l} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{i.l}</p>
                           <p className={`text-sm font-extrabold ${i.c}`}>{i.v}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="card-solid rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                     <TrendingUp size={48} className="text-slate-100 mb-6" />
                     <h4 className="text-lg font-bold text-slate-900 mb-2">Grow your earnings</h4>
                     <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mb-8">Complete more sessions to unlock lower platform fees and priority payouts.</p>
                     <button onClick={() => setActiveTab('refer')} className="text-orange-600 font-bold text-sm hover:underline">Refer students to earn more</button>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === "refer" && (
            <motion.div key="refer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <AdvisorReferEarnPage />
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
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                activeTab === tab.id ? "text-mango-dark" : "text-slate-400"
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? "bg-mango/10" : ""
              }`}>
                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
              </div>
              <span className={`text-[10px] font-black tracking-wide ${
                activeTab === tab.id ? "text-mango-dark" : "text-slate-400"
              }`}>{tab.label.split(" ")[0].toUpperCase()}</span>
            </button>
          ))}

          {/* Profile avatar on mobile */}
          {authUser && (
            <div className="flex flex-col items-center gap-1">
              <ProfileDropdown
                role="advisor"
                userName={authUser.displayName || advisor?.name}
                avatarUrl={authUser.photoURL || undefined}
              />
              <span className="text-[10px] font-black text-slate-400 tracking-wide">ME</span>
            </div>
          )}
        </div>
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}