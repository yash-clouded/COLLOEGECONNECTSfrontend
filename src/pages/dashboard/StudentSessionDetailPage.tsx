import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Calendar, Video, AlertTriangle, ChevronDown, Monitor, Apple, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";
import { getAdvisorById, notifyAdvisorFinalSlot, getBookingById, joinBookingAction, reportNoShowAction, syncBookingStatus, type BookingResponse } from "@/lib/restApi";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICalFile, type CalendarEvent } from "@/lib/calendarUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function StudentSessionDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: "/student/session/$bookingId" });
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const { isMeetActive, countdownText } = useMeetingTimer(booking?.scheduled_time);
  const [advisorSlots, setAdvisorSlots] = useState<string[]>([]);
  const [finalSlot, setFinalSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadBooking = async () => {
      try {
        const u = getFirebaseAuth().currentUser;
        if (!u) return;
        const token = await u.getIdToken(true);
        const data = await getBookingById(token, bookingId);
        if (!cancelled) {
          setBooking(data);
          setFinalSlot(data.selected_slot || "");
          
          // Load advisor slots
          const detail = await getAdvisorById(data.advisor_id);
          const slots = Array.isArray(detail.preferred_timezones) ? detail.preferred_timezones : [];
          setAdvisorSlots(slots);
        }
      } catch (e) {
        if (!cancelled) setBooking(null);
      }
    };
    void loadBooking();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);


  const handleFinalize = async () => {
    if (!booking) return;
    if (!finalSlot || !advisorSlots.includes(finalSlot)) {
      setMsg("Choose one of advisor preferred slots.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) {
        setMsg("Sign in required.");
        return;
      }
      await notifyAdvisorFinalSlot(token, {
        advisor_id: booking.advisor_id,
        old_slot: booking.selected_slot,
        new_slot: finalSlot,
      });
      // Optionally update status to finalized in backend if endpoint exists
      setMsg("Final slot saved and advisor notified.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not finalize slot.");
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
        setMsg("No-show reported successfully.");
      } else {
        setMsg(res.message || "Could not report no-show yet.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error reporting no-show.");
    } finally {
      setBusy(false);
    }
  };

  const handleSyncStatus = async () => {
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u || !booking) return;

    setBusy(true);
    setMsg("Syncing status with Razorpay...");
    try {
      const token = await u.getIdToken(true);
      const res = await syncBookingStatus(token, booking.id);
      if (res.ok) {
        setMsg("Payment verified! Success.");
        window.location.reload();
      } else {
        setMsg(res.message || "Payment not yet received by Razorpay.");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  };

  const getCalendarEvent = (): CalendarEvent | null => {
    if (!booking) return null;
    return {
      title: `Session with ${booking.advisor_name}`,
      description: `CollegeConnect Session\nJoin here: ${window.location.origin}/student/session/${booking.id}\nMeet Link: ${booking.meet_link || "Will be available 10 mins before"}`,
      location: booking.meet_link || "Google Meet",
      startTime: booking.scheduled_time,
      endTime: booking.end_time,
    };
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Session not found.</p>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/student/dashboard" })}>
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
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-teal mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Sessions
        </Link>

        <div className="glass rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{booking.advisor_name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Status: {booking.status || "pending"}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border/50 hover:bg-white/5">
                    <Calendar size={16} className="text-neon-teal" />
                    Add to Calendar
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    const ev = getCalendarEvent();
                    if (ev) window.open(getGoogleCalendarUrl(ev), "_blank");
                  }}>
                    <Monitor size={14} className="mr-2" />
                    Google Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const ev = getCalendarEvent();
                    if (ev) window.open(getOutlookCalendarUrl(ev), "_blank");
                  }}>
                    <Mail size={14} className="mr-2" />
                    Outlook / Office 365
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const ev = getCalendarEvent();
                    if (ev) downloadICalFile(ev);
                  }}>
                    <Apple size={14} className="mr-2" />
                    Apple / iCal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                disabled={!booking.meet_link || (booking.status !== "confirmed" && booking.status !== "finalized") || !isMeetActive}
                className="gap-2 bg-neon-teal hover:bg-neon-teal/90 text-black min-w-[140px]"
                onClick={handleJoin}
              >
                <Video size={16} />
                {booking.status === "pending" 
                  ? "Payment Pending" 
                  : !isMeetActive 
                    ? `Starts in ${countdownText}` 
                    : "Join Meeting"}
              </Button>

              {booking.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={handleSyncStatus}
                  className="gap-2 border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10"
                >
                  <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
                  Check Payment Status
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Booked slot</p>
              <p className="text-sm font-medium text-foreground">{booking.selected_slot || "—"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Scheduled Date/Time</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(booking.scheduled_time).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Final preferred time slot (student final change)
            </p>
            <div className="flex gap-2">
              <select
                value={finalSlot}
                onChange={(e) => setFinalSlot(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
              >
                <option value="">Select preferred slot</option>
                {advisorSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={busy}
                onClick={handleFinalize}
                className="bg-neon-teal hover:bg-neon-teal/90 text-black"
              >
                <CheckCircle2 size={16} />
                Finalize
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
              Report Advisor No-Show
            </Button>
            <p className="text-[10px] text-muted-foreground italic">
              * Available 15 minutes after session start if advisor hasn't joined.
            </p>
          </div>

          {msg ? (
            <div className="bg-white/5 border border-border/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{msg}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

