import {
  bookAdvisorSession,
  getAdvisorById,
  getMyStudentProfile,
  createPaymentOrder,
  verifyPayment,
  type AdvisorPublicDetail,
} from "@/lib/restApi";
import { getFirebaseAuth } from "@/lib/firebase";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  return langs || other || "—";
}

export default function StudentAdvisorDetailPage() {
  const { advisorId } = useParams({ from: "/student/advisor/$advisorId" });
  const [advisor, setAdvisor] = useState<AdvisorPublicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

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
    return () => {
      cancelled = true;
    };
  }, [advisorId]);

  const name = advisor?.name?.trim() || "Advisor";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 3).toUpperCase() || "?";
  const college =
    advisor?.detected_college?.trim() || "—";
  const branch = advisor?.branch?.trim() || "—";
  const sessionPrice = Number(advisor?.session_price || "0");
  const slots = advisor?.preferred_timezones?.length
    ? advisor.preferred_timezones
    : [];
  useEffect(() => {
    setSelectedSlot(slots[0] || "");
  }, [advisorId, slots.join("|")]);

  const handleBookSession = async () => {
    if (!advisor) return;
    if (!selectedSlot.trim()) {
      alert("Please select one preferred time slot before booking.");
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
      } catch {
        // Fallback to Firebase user info if profile fetch fails.
      }

      const price = Number(advisor.session_price || "0");
      if (price <= 0) {
        throw new Error("Invalid session price.");
      }

      // 1. Create PRELIMINARY Booking in Database (Status: Pending)
      const bookingData = await bookAdvisorSession(token, advisor.id, selectedSlot.trim());
      if (!bookingData.ok || !bookingData.booking_id) {
        throw new Error(bookingData.email_error || "Could not initialize booking.");
      }

      // 2. Create Payment Order on Backend (Linked to Booking ID)
      const amountInPaise = Math.round(price * 100);
      const order = await createPaymentOrder(token, amountInPaise, bookingData.booking_id);

      // 3. Open Razorpay Checkout widget
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "CollegeConnect",
        description: `Booking session with ${advisor.name}`,
        order_id: order.id,
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentPhone,
        },
        theme: {
          color: "#22d3ee", // neon-teal
        },
        handler: async (response: any) => {
          try {
            setBookingBusy(true);
            // 4. Verify Payment on Backend (Updates booking status to 'confirmed')
            await verifyPayment(
              token,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );

            // 5. Success redirect
            window.location.href = `/payment-status?status=success&advisorName=${encodeURIComponent(advisor.name || "")}&selectedSlot=${encodeURIComponent(selectedSlot.trim())}&advisorId=${advisor.id}`;
          } catch (e) {
            alert(e instanceof Error ? e.message : "Payment verification failed.");
          } finally {
            setBookingBusy(false);
          }
        },

        modal: {
          ondismiss: () => {
            setBookingBusy(false);
          },
        },
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

  const row = (label: string, value: string) => (
    <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium whitespace-pre-wrap break-words">
        {value || "—"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-teal mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Find Advisors
        </Link>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading advisor…</p>
        ) : null}
        {error ? (
          <p className="text-sm text-amber-500 mb-4">{error}</p>
        ) : null}

        {!loading && advisor && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-teal to-teal-400 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-foreground truncate">{name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-neon-teal text-sm">
                    <BookOpen size={14} className="shrink-0" />
                    <span className="truncate">{college}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{branch}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 glass rounded-full px-3 py-1 shrink-0">
                <Star size={14} className="text-neon-orange fill-neon-orange" />
                <span className="text-sm font-semibold">4.8</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bio</p>
                <p className="text-sm text-foreground font-medium whitespace-pre-wrap">
                  {advisor.bio?.trim() || "—"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {row("gender", advisor.gender?.trim() || "")}
                {row("state", advisor.state?.trim() || "")}
                {row("JEE Mains percentile", advisor.jee_mains_percentile?.trim() || "")}
                {row("JEE Mains rank", advisor.jee_mains_rank?.trim() || "")}
                {row("JEE Advanced rank", advisor.jee_advanced_rank?.trim() || "")}
                {row("Session price", sessionPrice > 0 ? `₹${sessionPrice}` : "—")}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {row("skills", advisor.skills?.trim() || "")}
                {row("achievements", advisor.achievements?.trim() || "")}
                {row("languages", formatLanguages(advisor))}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Preferred time slots</p>
                {slots.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {slots.map((slot) => (
                      <li
                        key={slot}
                        className="text-sm text-foreground font-medium border border-border/60 rounded-xl px-3 py-2 bg-background/50"
                      >
                        <label className="inline-flex items-center gap-2 w-full cursor-pointer">
                          <input
                            type="radio"
                            name="booking-slot"
                            value={slot}
                            checked={selectedSlot === slot}
                            onChange={() => setSelectedSlot(slot)}
                            className="accent-[#22d3ee]"
                          />
                          <span>{slot}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {!loading && advisor && !error ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              type="button"
              className="flex-1 bg-neon-orange hover:bg-neon-orange/90 text-black font-semibold rounded-xl h-12 gap-2"
              onClick={handleBookSession}
              disabled={bookingBusy}
            >
              {bookingBusy ? "Booking..." : "Book session"}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
