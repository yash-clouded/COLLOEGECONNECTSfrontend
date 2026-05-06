import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  notifyStudentSessionUpdate,
  getBookingById,
  joinBookingAction,
  reportNoShowAction,
  type AdvisorProfileResponse,
  type BookingResponse,
} from "@/lib/restApi";
import { Button } from "@/components/ui/button";
import { Video, AlertTriangle, Calendar } from "lucide-react";


export default function AdvisorSessionDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: "/advisor/session/$bookingId" });
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u) return;
      try {
        const token = await u.getIdToken(true);
        const [prof, data] = await Promise.all([
          getMyAdvisorProfile(token),
          getBookingById(token, bookingId)
        ]);
        if (!cancelled) {
          setAdvisor(prof);
          setBooking(data);
          setNewSlot(data.selected_slot || "");
        }
      } catch (e) {
        if (!cancelled) setBooking(null);
      }
    };
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const preferredSlots = useMemo(
    () => (advisor?.preferred_timezones && advisor.preferred_timezones.length > 0 ? advisor.preferred_timezones : []),
    [advisor],
  );


  const handleAccept = async () => {
    if (!booking) return;
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) return;
      await notifyStudentSessionUpdate(token, {
        booking_id: bookingId,
        action: "accept",
        student_email: booking.student_email,
        student_name: booking.student_name,
        old_slot: booking.selected_slot,
      });
      setStatusMsg("Session accepted and confirmed!");
      setBooking(prev => prev ? { ...prev, status: "confirmed" } : null);
    } catch (e) {
      alert("Failed to accept session.");
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setStatusMsg("Sign in required.");
        return;
      }
      await notifyStudentSessionUpdate(token, {
        booking_id: bookingId,
        action: "reject",
        student_email: booking.student_email,
        student_name: booking.student_name,
        old_slot: booking.selected_slot,
      });
      setStatusMsg("Session rejected.");
      setBooking(prev => prev ? { ...prev, status: "cancelled" } : null);
    } catch (e) {
      alert("Failed to reject session.");
    } finally {
      setBusy(false);
    }
  };

  const handleChangeSlot = async () => {
    if (!booking) return;
    if (!newSlot || !preferredSlots.includes(newSlot)) {
      setStatusMsg("Choose one of your preferred time slots.");
      return;
    }
    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setStatusMsg("Sign in required.");
        return;
      }
      await notifyStudentSessionUpdate(token, {
        booking_id: bookingId,
        action: "change",
        student_email: booking.student_email,
        student_name: booking.student_name,
        old_slot: booking.selected_slot,
        new_slot: newSlot,
      });
      setStatusMsg(`Proposed new slot: ${newSlot}`);
      setBooking(prev => prev ? { ...prev, status: "changed", selected_slot: newSlot } : null);
    } catch (e) {
      alert("Failed to propose new slot.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!booking?.meet_link) return;
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (token) await joinBookingAction(token, booking.id);
      window.open(booking.meet_link, "_blank");
    } catch (e) {
      console.error("Join tracking failed", e);
      window.open(booking.meet_link, "_blank");
    }
  };

  const handleNoShow = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) return;
      const res = await reportNoShowAction(token, booking.id);
      if (res.ok) {
        setStatusMsg("No-show reported successfully.");
      } else {
        setStatusMsg(res.message || "Could not report no-show yet.");
      }
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Error reporting no-show.");
    } finally {
      setBusy(false);
    }
  };

  const getCalendarUrl = () => {
    if (!booking) return "";
    const start = new Date(booking.scheduled_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(booking.end_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`Session with ${booking.student_name}`);
    const details = encodeURIComponent(`Google Meet: ${booking.meet_link || "Link will be available 10 mins before"}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${encodeURIComponent(booking.meet_link || "")}`;
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Session not found.</p>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/advisor/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/advisor/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-orange mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Sessions
        </Link>

        <div className="glass rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{booking.student_name}</h1>
              <p className="text-sm text-muted-foreground">{booking.student_email}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2 border-border/50 hover:bg-white/5"
                onClick={() => window.open(getCalendarUrl(), "_blank")}
              >
                <Calendar size={16} className="text-neon-orange" />
                Add to Calendar
              </Button>
              
              <Button
                disabled={!booking.meet_link}
                className="gap-2 bg-neon-orange hover:bg-neon-orange/90 text-black"
                onClick={handleJoin}
              >
                <Video size={16} />
                Join Meeting
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Student selected slot</p>
              <p className="text-sm font-medium text-foreground">{booking.selected_slot || " - "}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-medium text-foreground">{booking.status || "pending"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Session price</p>
              <p className="text-sm font-medium text-foreground">
                {booking.session_price ? `��${booking.session_price}` : " - "}
              </p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Scheduled Time</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(booking.scheduled_time).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={busy}
              className="bg-neon-teal hover:bg-neon-teal/90 text-black"
            >
              <CheckCircle2 size={16} />
              Accept
            </Button>
            <Button
              type="button"
              onClick={handleReject}
              disabled={busy}
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <XCircle size={16} />
              Reject
            </Button>
            <div className="flex gap-2 sm:col-span-1">
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
              >
                <option value="">Select preferred slot</option>
                {preferredSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleChangeSlot}
                disabled={busy}
                className="bg-neon-orange hover:bg-neon-orange/90 text-black"
              >
                <Clock3 size={16} />
                OK
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              disabled={busy || (booking.scheduled_time ? (new Date().getTime() < new Date(booking.scheduled_time).getTime() + 15 * 60 * 1000) : true)}
              onClick={handleNoShow}
              className="w-full sm:w-auto gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
            >
              <AlertTriangle size={16} />
              Report Student No-Show
            </Button>
            <p className="text-[10px] text-muted-foreground italic">
              * Available 15 minutes after session start if student hasn't joined.
            </p>
          </div>

          {statusMsg ? (
            <div className="bg-white/5 border border-border/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{statusMsg}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

