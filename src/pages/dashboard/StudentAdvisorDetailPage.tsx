import {
  bookAdvisorSession,
  getAdvisorById,
  getMyStudentProfile,
  createPaymentOrder,
  verifyPayment,
  type AdvisorPublicDetail,
} from "@/lib/restApi";
import { computeEffectiveStudyYear, formatStudyYearLabel } from "@/lib/advisorStudyYear";
import { getFirebaseAuth } from "@/lib/firebase";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Star, MapPin, GraduationCap, Clock, IndianRupee, Award, Brain, Languages, Calendar, ShieldCheck, Loader } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const BOOKINGS_STORAGE_KEY = "collegeconnect_bookings_v1";

type SessionBooking = {
  id: string;
  advisorId: string;
  advisorName: string;
  studentName: string;
  studentEmail: string;
  sessionPrice: string;
  selectedSlot: string;
  bookedAt: string;
  status?: "pending" | "accepted" | "rejected" | "changed";
};

function formatLanguages(a: AdvisorPublicDetail): string {
  const langs = a.languages?.length ? a.languages.join(", ") : "";
  const other = a.language_other?.trim();
  if (langs && other) return `${langs} (${other})`;
  return langs || other || "";
}

const ADVISOR_COLORS = [
  { from: "from-navy", to: "to-blue-400", bg: "bg-navy" },
  { from: "from-emerald-600", to: "to-teal-400", bg: "bg-emerald-600" },
  { from: "from-mango", to: "to-orange-400", bg: "bg-mango" },
  { from: "from-violet-600", to: "to-purple-400", bg: "bg-violet-600" },
  { from: "from-rose-600", to: "to-pink-400", bg: "bg-rose-600" },
];

function getAdvisorColor(name: string) {
  const code = (name || "").charCodeAt(0) || 0;
  return ADVISOR_COLORS[code % ADVISOR_COLORS.length];
}

export default function StudentAdvisorDetailPage() {
  const { advisorId } = useParams({ from: "/student/advisor/$advisorId" });
  const [advisor, setAdvisor] = useState<AdvisorPublicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdvisorById(advisorId);
        if (!cancelled) setAdvisor(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load advisor.");
          setAdvisor(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [advisorId]);

  const name = advisor?.name?.trim() || "Advisor";
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const college = advisor?.detected_college?.trim() || "";
  const branch = advisor?.branch?.trim() || "";
  const studyYearLabel = formatStudyYearLabel(computeEffectiveStudyYear(advisor ?? {}));
  const sessionPrice = Number(advisor?.session_price || "0");
  const slots = advisor?.preferred_timezones?.length ? advisor.preferred_timezones : [];
  const theme = getAdvisorColor(name);

  useEffect(() => {
    setSelectedSlot(slots[0] || "");
  }, [advisorId, slots.join("|")]);

  const handleBookSession = async () => {
    if (!advisor) return;
    if (!selectedSlot.trim()) {
      alert("Please select one preferred time slot before booking.");
      return;
    }
    if (!selectedDate.trim()) {
      alert("Please select a date for your session.");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!razorpayKey) {
      alert("Razorpay key is not configured in environment variables (VITE_RAZORPAY_KEY).");
      return;
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Sign in as a student to book a session.");
      return;
    }

    setBookingBusy(true);
    try {
      let studentName = user.displayName?.trim() || "";
      let studentEmail = user.email?.trim() || "";
      let studentPhone = "";
      const token = await user.getIdToken(true);
      try {
        const me = await getMyStudentProfile(token);
        if (me.name?.trim()) studentName = me.name.trim();
        if (me.email?.trim()) studentEmail = me.email.trim();
        if (me.phone?.trim()) studentPhone = me.phone.trim();
      } catch { /* fallback */ }

      const price = Number(advisor.session_price || "0");
      if (price <= 0) throw new Error("Invalid session price.");

      const amountInPaise = Math.round(price * 100);
      const order = await createPaymentOrder(token, amountInPaise);
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Collegeconnects",
        description: `Booking session with ${advisor.name}`,
        order_id: order.id,
        prefill: { name: studentName, email: studentEmail, contact: studentPhone },
        theme: { color: "#1E3A8A" },
        handler: async (response: any) => {
          try {
            setBookingBusy(true);
            await verifyPayment(token, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            await bookAdvisorSession(token, advisor.id, selectedSlot.trim(), selectedDate.trim());
            const booking: SessionBooking = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              advisorId: advisor.id,
              advisorName: advisor.name?.trim() || "Advisor",
              studentName: studentName || "Student",
              studentEmail: studentEmail || "unknown@email",
              sessionPrice: String(advisor.session_price || ""),
              selectedSlot: `${selectedDate.trim()} at ${selectedSlot.trim()}`,
              bookedAt: new Date().toISOString(),
              status: "pending",
            };
            const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
            const existing: SessionBooking[] = raw ? (JSON.parse(raw) as SessionBooking[]) : [];
            existing.unshift(booking);
            localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existing));
            alert("Payment successful and session booked! The advisor has been notified.");
          } catch (e) {
            alert(e instanceof Error ? e.message : "Payment verification or booking failed.");
          } finally {
            setBookingBusy(false);
          }
        },
        modal: { ondismiss: () => setBookingBusy(false) },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setBookingBusy(false);
      });
      rzp.open();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not initiate payment process.");
      setBookingBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-navy/8 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-mango/5 to-transparent blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 relative z-10">
        {/* Back link */}
        <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-navy transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Advisors
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader size={32} className="animate-spin text-navy" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        )}

        {!loading && advisor && !error && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* === HERO CARD === */}
            <div className={`bg-gradient-to-br ${theme.from} ${theme.to} rounded-[2.5rem] p-8 sm:p-10 mb-6 relative overflow-hidden shadow-2xl`}>
              {/* Abstract decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />

              <div className="relative z-10 flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">{name}</h1>
                      {college && (
                        <div className="flex items-center gap-1.5 text-white/80 text-sm font-bold mb-1">
                          <BookOpen size={14} />
                          <span>{college}</span>
                        </div>
                      )}
                      {branch && (
                        <div className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                          <GraduationCap size={14} />
                          <span>{branch}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5">
                      <Star size={14} className="text-yellow-300 fill-yellow-300" />
                      <span className="text-white font-black text-sm">4.8</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {studyYearLabel}
                    </span>
                    {advisor.college_id_front_key && (
                      <span className="bg-emerald-400/30 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                    {sessionPrice > 0 && (
                      <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <IndianRupee size={10} /> ₹{sessionPrice} / session
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* === BIO === */}
            {advisor.bio?.trim() && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 mb-6 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About</p>
                <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">{advisor.bio.trim()}</p>
              </div>
            )}

            {/* === STATS GRID === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {advisor.jee_mains_rank?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">JEE Mains Rank</p>
                  <p className="text-xl font-black text-navy">#{advisor.jee_mains_rank.trim()}</p>
                </div>
              )}
              {advisor.jee_mains_percentile?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Percentile</p>
                  <p className="text-xl font-black text-emerald-600">{advisor.jee_mains_percentile.trim()}%</p>
                </div>
              )}
              {advisor.jee_advanced_rank?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">JEE Advanced</p>
                  <p className="text-xl font-black text-violet-600">#{advisor.jee_advanced_rank.trim()}</p>
                </div>
              )}
              {advisor.state?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                  <MapPin size={18} className="text-mango shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                    <p className="text-sm font-black text-slate-900">{advisor.state.trim()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* === SKILLS & ACHIEVEMENTS === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {advisor.skills?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-navy/10 flex items-center justify-center">
                      <Brain size={16} className="text-navy" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Skills</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{advisor.skills.trim()}</p>
                </div>
              )}
              {advisor.achievements?.trim() && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-mango/10 flex items-center justify-center">
                      <Award size={16} className="text-mango" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Achievements</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{advisor.achievements.trim()}</p>
                </div>
              )}
              {formatLanguages(advisor) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Languages size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Languages</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{formatLanguages(advisor)}</p>
                </div>
              )}
            </div>

                <div className="mb-8 p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-mango/10 flex items-center justify-center">
                      <Calendar size={18} className="text-mango" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 1</p>
                      <p className="text-sm font-black text-slate-900">Choose Session Date</p>
                    </div>
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-navy transition-all shadow-sm"
                  />
                </div>

                {slots.length > 0 ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-navy/10 flex items-center justify-center">
                        <Clock size={18} className="text-navy" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 2</p>
                        <p className="text-sm font-black text-slate-900">Pick Available Time Slot</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slots.map((slot) => (
                        <label
                          key={slot}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedSlot === slot
                              ? "border-navy bg-navy/5 shadow-md"
                              : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="booking-slot"
                            value={slot}
                            checked={selectedSlot === slot}
                            onChange={() => setSelectedSlot(slot)}
                            className="accent-navy"
                          />
                          <div className="flex items-center gap-2">
                            <Clock size={14} className={selectedSlot === slot ? "text-navy" : "text-slate-400"} />
                            <span className={`text-sm font-bold ${selectedSlot === slot ? "text-navy" : "text-slate-700"}`}>
                              {slot}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-amber-50 border border-amber-100 rounded-[2rem]">
                    <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-1">No Slots Available</p>
                    <p className="text-xs text-amber-700 font-medium">This advisor hasn't set their availability yet.</p>
                  </div>
                )}
              </div>

          </motion.div>
        )}
      </div>

      {/* === STICKY BOOK NOW FOOTER === */}
      {!loading && advisor && !error && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.12)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Fee</p>
              <p className="text-2xl font-black text-slate-900">
                {sessionPrice > 0 ? `₹${sessionPrice}` : "Free"}
                <span className="text-xs font-bold text-slate-400 ml-1">/ 60 min</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleBookSession}
              disabled={bookingBusy || slots.length === 0}
              className="flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-black rounded-2xl h-14 px-8 transition-all shadow-xl shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {bookingBusy ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>Book Session <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
