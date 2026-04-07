import React, { useState, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  getMyBookings,
  type AdvisorProfileResponse,
  type BookingResponse,
  updateMyAdvisorProfile,
  joinBookingAction,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, Calendar, IndianRupee, Star, TrendingUp, Users, Wallet, ArrowUpRight, History, Gift, Video, Monitor, Mail, Apple, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import AdvisorReferEarnPage from "./AdvisorReferEarnPage";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICalFile, type CalendarEvent } from "@/lib/calendarUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "earnings", label: "Earnings", icon: IndianRupee },
  { id: "refer", label: "Refer & Earn", icon: Gift },
  { id: "profile", label: "My Profile", icon: User },
];

const HOURLY_TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:00 ${suffix}`;
});

function parsePreferredTimezoneSlots(
  slots: string[] | undefined,
): Array<{ from: string; to: string }> {
  const parsed = (slots || []).map((slot) => {
    const [from = "", to = ""] = slot.split(" - ").map((v) => v.trim());
    return { from, to };
  });
  if (parsed.length >= 4) return parsed;
  return [...parsed, ...Array.from({ length: 4 - parsed.length }, () => ({ from: "", to: "" }))];
}

function BookingCardContent({ booking }: { booking: BookingResponse }) {
  const navigate = useNavigate();
  const { isMeetActive, countdownText } = useMeetingTimer(booking.scheduled_time);

  const getCalendarEvent = (): CalendarEvent => ({
    title: `Session with ${booking.student_name}`,
    description: `CollegeConnect Session\nJoin here: ${window.location.origin}/advisor/session/${booking.id}\nMeet Link: ${booking.meet_link || "Will be available 10 mins before"}`,
    location: booking.meet_link || "Google Meet",
    startTime: booking.scheduled_time,
    endTime: booking.end_time,
  });

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!booking.meet_link) return;
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (token) await joinBookingAction(token, booking.id);
      window.open(booking.meet_link, "_blank");
    } catch (err) {
      console.error("Join tracking failed", err);
      window.open(booking.meet_link, "_blank");
    }
  };

  return (
    <div className="glass rounded-2xl border border-border p-5 hover:border-neon-orange/50 transition-colors group flex flex-col h-full cursor-pointer overflow-hidden">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Student</p>
            <p className="text-lg font-semibold text-foreground">{booking.student_name}</p>
          </div>
          <p
            className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-medium ${
              booking.status === "confirmed" || booking.status === "finalized"
                ? "bg-neon-teal/10 border-neon-teal/30 text-neon-teal"
                : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            }`}
          >
            {booking.status || "pending"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-background/50 rounded-xl px-3 py-2 border border-border/60">
            <p className="text-[11px] text-muted-foreground">Price</p>
            <p className="text-sm font-medium text-neon-orange">
              {booking.session_price ? `₹${booking.session_price}` : "—"}
            </p>
          </div>
          <div className="bg-background/50 rounded-xl px-3 py-2 border border-border/60">
            <p className="text-[11px] text-muted-foreground">Slot</p>
            <p className="text-sm font-medium text-foreground truncate" title={booking.selected_slot}>
              {booking.selected_slot || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={!booking.meet_link || !isMeetActive}
            className="flex-1 gap-1.5 bg-neon-orange hover:bg-neon-orange/90 text-black text-xs h-9"
            onClick={handleJoin}
          >
            <Video size={14} />
            {!isMeetActive ? countdownText : "Join"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-9 p-0 border-border/50 hover:bg-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={() => window.open(getGoogleCalendarUrl(getCalendarEvent()), "_blank")}
              >
                <Monitor size={14} className="mr-2" />
                Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(getOutlookCalendarUrl(getCalendarEvent()), "_blank")}
              >
                <Mail size={14} className="mr-2" />
                Outlook Web
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadICalFile(getCalendarEvent())}>
                <Apple size={14} className="mr-2" />
                Apple / iCal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate({
              to: "/advisor/session/$bookingId",
              params: { bookingId: booking.id },
            });
          }}
          className="text-[11px] text-center text-muted-foreground hover:text-neon-orange transition-colors py-1"
        >
          View Full Details
        </button>
      </div>
    </div>
  );
}


export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    branch: "",
    phone: "",
    state: "",
    bio: "",
    skills: "",
    achievements: "",
    session_price: "",
    preferred_timezones: [{ from: "", to: "" }, { from: "", to: "" }, { from: "", to: "" }, { from: "", to: "" }],
  });
  useEffect(() => {
    document.title = "Advisor Dashboard — CollegeConnect";
  }, []);

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
        setProfileError("Sign in to view advisor profile.");
        return;
      }
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const token = await u.getIdToken(true);
        const profile = await getMyAdvisorProfile(token);
        if (!cancelled) setAdvisor(profile);
      } catch (e) {
        if (!cancelled) {
          setProfileError(
            e instanceof Error ? e.message : "Could not load advisor profile.",
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    void loadProfile();
    const timer = setInterval(() => void loadProfile(), 30000); // 30s polling
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid]);
  useEffect(() => {
    if (!advisor) return;
    setEditForm({
      name: advisor.name || "",
      branch: advisor.branch || "",
      phone: advisor.phone || "",
      state: advisor.state || "",
      bio: advisor.bio || "",
      skills: advisor.skills || "",
      achievements: advisor.achievements || "",
      session_price: advisor.session_price || "",
      preferred_timezones: parsePreferredTimezoneSlots(advisor.preferred_timezones),
    });
  }, [advisor]);


  const advisorName = advisor?.name || "Advisor";
  const advisorCollege = advisor?.detected_college || "Not available";
  const advisorBranch = advisor?.branch || "Not available";
  const advisorSessionPrice = Number(advisor?.session_price || "0");
  const advisorLanguages =
    advisor?.languages && advisor.languages.length > 0
      ? advisor.languages.join(", ")
      : "Not specified";
  const advisorSkills = advisor?.skills || "Not specified";
  const advisorAchievements = advisor?.achievements || "Not specified";
  const advisorPreferredTimezones =
    advisor?.preferred_timezones && advisor.preferred_timezones.length > 0
      ? advisor.preferred_timezones.join(", ")
      : "Not specified";
  const advisorBio = advisor?.bio || "No bio added yet.";
  const advisorTotalEarnings = advisor?.total_earnings ?? 0;
  const advisorTotalSessions = advisor?.total_sessions ?? 0;
  const advisorTotalStudents = advisor?.total_students ?? 0;
  const mySessionBookings = sessionBookings; // backend already filters by advisor
  const welcomeName =
    advisorName ||
    authUser?.displayName?.trim() ||
    authUser?.email?.split("@")[0] ||
    "Advisor";
  const handleAdvisorSave = async () => {
    const u = getFirebaseAuth().currentUser;
    if (!u) {
      setProfileError("Sign in to edit advisor profile.");
      return;
    }
    const parsedPreferredTimezones = editForm.preferred_timezones
      .filter((slot) => slot.from && slot.to && slot.from !== slot.to)
      .map((slot) => `${slot.from} - ${slot.to}`);
    if (parsedPreferredTimezones.length < 4) {
      setProfileError("Please add at least 4 preferred time slots.");
      return;
    }
    setSavingProfile(true);
    try {
      const token = await u.getIdToken(true);
      const updated = await updateMyAdvisorProfile(token, {
        name: editForm.name.trim(),
        branch: editForm.branch.trim(),
        phone: editForm.phone.trim(),
        state: editForm.state.trim(),
        bio: editForm.bio.trim(),
        skills: editForm.skills.trim(),
        achievements: editForm.achievements.trim(),
        session_price: editForm.session_price.trim(),
        preferred_timezones: parsedPreferredTimezones,
      });
      setAdvisor(updated);
      setIsEditingProfile(false);
      setProfileError(null);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Welcome header — brand lives in navbar; full width avoids overlap with tall stacked logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full min-w-0"
        >
          <h1 className="text-3xl font-display font-bold text-foreground break-words">
            Welcome back, <span className="gradient-text-orange">{welcomeName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Manage your sessions and connect with students</p>
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
                  ? "bg-neon-orange text-black"
                  : "glass border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {loadingProfile && activeTab !== "profile" && (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Earnings", value: `₹${advisorTotalEarnings}`, icon: IndianRupee, color: "text-neon-orange" },
                { label: "Total Sessions", value: advisorTotalSessions, icon: Calendar, color: "text-neon-teal" },
                { label: "Students Helped", value: advisorTotalStudents, icon: Users, color: "text-neon-blue" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon size={20} className={stat.color} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="glass rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3">
                <Star size={20} className="text-neon-orange fill-neon-orange" />
                <p className="text-sm text-muted-foreground">Your Rating</p>
              </div>
              <p className="text-3xl font-bold text-neon-orange mt-2">5.0 / 5.0</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {advisorTotalSessions} sessions</p>
            </div>

            {/* Quick info */}
            <div className="glass rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Profile Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "College", value: advisorCollege },
                  { label: "Branch", value: advisorBranch },
                  { label: "Session Price", value: advisorSessionPrice > 0 ? `₹${advisorSessionPrice}` : "Not set" },
                  { label: "Languages", value: advisorLanguages },
                  { label: "Skills", value: advisorSkills },
                  { label: "Preferred Time Slots", value: advisorPreferredTimezones },
                ].map(item => (
                  <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {mySessionBookings.length === 0 ? (
              <div className="glass rounded-2xl border border-border p-8 text-center">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No sessions booked yet</h3>
                <p className="text-muted-foreground">Students will book sessions with you once your profile is live!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySessionBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      navigate({
                        to: "/advisor/session/$bookingId",
                        params: { bookingId: booking.id },
                      });
                    }}
                  >
                    <BookingCardContent booking={booking} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* EARNINGS TAB (Wallet) */}
        {activeTab === "earnings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Wallet Card */}
            <div className="glass rounded-3xl border border-border overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-orange/10 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="p-8 sm:p-10 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neon-orange/20 flex items-center justify-center">
                      <Wallet size={24} className="text-neon-orange" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">My Wallet</h3>
                      <p className="text-sm text-muted-foreground">Manage your earnings and payouts</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 rounded-full bg-neon-teal/10 text-neon-teal text-xs font-medium border border-neon-teal/20">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Available Balance (Net)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold text-foreground">₹{Math.floor(advisorTotalEarnings * 0.7)}</span>
                      <span className="text-muted-foreground text-sm font-medium">INR</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">* Balance after 30% platform fee</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 bg-neon-orange hover:bg-neon-orange/90 text-black font-semibold rounded-2xl h-14 transition-all shadow-lg shadow-neon-orange/20 group">
                      <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      Withdraw Money
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-2 glass border border-border hover:bg-white/5 text-foreground font-semibold rounded-2xl h-14 transition-all">
                      <History size={20} />
                      Payout History
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Access Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border">
                {[
                  { label: "Pending Payout", value: "₹0", color: "text-muted-foreground" },
                  { label: "Total Tax Paid", value: "₹0", color: "text-muted-foreground" },
                  { label: "Last Payout", value: "None", color: "text-muted-foreground" },
                  { label: "Platform Fee", value: "30%", color: "text-neon-teal" },
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 border-r border-border last:border-r-0 text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="glass rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Recent Transactions</h3>
                <button className="text-xs text-neon-orange hover:underline font-medium">View All</button>
              </div>

              {advisorTotalEarnings === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <IndianRupee size={24} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">No transactions yet</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Your earnings will show here once students start booking sessions with you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* We could map over real bookings that are 'accepted' or 'paid' here */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border/50 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-teal/20 flex items-center justify-center text-neon-teal">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Session Credit</p>
                        <p className="text-xs text-muted-foreground">From Recent Bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neon-teal">+ ₹{advisorTotalEarnings}</p>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payout Information Alert */}
            <div className="bg-neon-teal/5 border border-neon-teal/20 rounded-2xl p-4 flex gap-4">
              <TrendingUp size={20} className="text-neon-teal shrink-0" />
              <div className="text-sm">
                <p className="text-neon-teal font-semibold">Automatic Weekly Payouts</p>
                <p className="text-muted-foreground mt-0.5">
                  Your earnings are processed every Monday and credited to your linked bank account within 2-3 business days.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* REFER TAB */}
        {activeTab === "refer" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdvisorReferEarnPage />
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-6 sm:p-8"
          >
            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Loading profile…</p>
            ) : null}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-orange to-orange-400 flex items-center justify-center text-2xl font-bold text-white">
                {advisorName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{advisorName}</h2>
                <p className="text-muted-foreground text-sm">{advisorCollege} • {advisorBranch}</p>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    ["Name", "name"],
                    ["Branch", "branch"],
                    ["Phone", "phone"],
                    ["State", "state"],
                    ["Session Price", "session_price"],
                    ["Skills", "skills"],
                    ["Achievements", "achievements"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="text-xs text-muted-foreground flex flex-col gap-1">
                    {label}
                    <input
                      value={editForm[key]}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                ))}
                <label className="sm:col-span-2 text-xs text-muted-foreground flex flex-col gap-1">
                  Bio
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, bio: e.target.value }))
                    }
                    rows={4}
                    className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="sm:col-span-2 text-xs text-muted-foreground flex flex-col gap-1">
                  Preferred Time Slots
                  <div className="grid grid-cols-1 gap-2">
                    {editForm.preferred_timezones.map((slot, index) => (
                      <div key={`edit-timezone-slot-${index}`} className="grid grid-cols-2 gap-2">
                        <select
                          value={slot.from}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              preferred_timezones: prev.preferred_timezones.map((item, i) =>
                                i === index ? { ...item, from: e.target.value } : item,
                              ),
                            }))
                          }
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
                        >
                          <option value="">From</option>
                          {HOURLY_TIME_OPTIONS.map((time) => (
                            <option key={`edit-from-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <select
                          value={slot.to}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              preferred_timezones: prev.preferred_timezones.map((item, i) =>
                                i === index ? { ...item, to: e.target.value } : item,
                              ),
                            }))
                          }
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
                        >
                          <option value="">To</option>
                          {HOURLY_TIME_OPTIONS.map((time) => (
                            <option key={`edit-to-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          preferred_timezones: [...prev.preferred_timezones, { from: "", to: "" }],
                        }))
                      }
                      className="text-xs underline text-neon-orange"
                    >
                      + Add another slot
                    </button>
                    {editForm.preferred_timezones.length > 4 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            preferred_timezones:
                              prev.preferred_timezones.length > 4
                                ? prev.preferred_timezones.slice(0, -1)
                                : prev.preferred_timezones,
                          }))
                        }
                        className="text-xs underline text-muted-foreground"
                      >
                        Remove last slot
                      </button>
                    ) : null}
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground">{advisorBio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Skills", value: advisorSkills },
                    { label: "Achievements", value: advisorAchievements },
                    { label: "Languages", value: advisorLanguages },
                    { label: "Preferred Time Slots", value: advisorPreferredTimezones },
                    { label: "Session Price", value: advisorSessionPrice > 0 ? `₹${advisorSessionPrice}` : "Not set" },
                  ].map(item => (
                    <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-sm text-foreground font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {isEditingProfile ? (
                <>
                  <button
                    onClick={handleAdvisorSave}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 bg-neon-orange hover:bg-neon-orange/90 text-black rounded-xl px-5 py-2.5 text-sm transition-all disabled:opacity-60"
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
                  className="inline-flex items-center gap-2 border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/10 rounded-xl px-5 py-2.5 text-sm transition-all"
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