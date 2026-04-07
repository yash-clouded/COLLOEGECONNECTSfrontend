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
import { Video, AlertTriangle, Calendar, ChevronDown, Monitor, Apple, Mail } from "lucide-react";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadICalFile, type CalendarEvent } from "@/lib/calendarUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function AdvisorSessionDetailPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: "/advisor/session/$bookingId" });
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const { isMeetActive, countdownText } = useMeetingTimer(booking?.scheduled_time);
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
    // Optionally call backend to accept
    setStatusMsg("Session accepted.");
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
        action: "reject",
        student_email: booking.student_email,
        student_name: booking.student_name,
        old_slot: booking.selected_slot,
      });
      setStatusMsg("Rejected and email sent to student.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Could not reject session.");
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
        action: "change",
        student_email: booking.student_email,
        student_name: booking.student_name,
        old_slot: booking.selected_slot,
        new_slot: newSlot,
      });
      setStatusMsg("Preferred time changed and email sent to student.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Could not change preferred time.");
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

  const getCalendarEvent = (): CalendarEvent | null => {
    if (!booking) return null;
    return {
      title: `Session with ${booking.student_name}`,
      description: `CollegeConnect Session\nJoin here: ${window.location.origin}/advisor/session/${booking.id}\nMeet Link: ${booking.meet_link || "Will be available 10 mins before"}`,
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border/50 hover:bg-white/5">
                    <Calendar size={16} className="text-neon-orange" />
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
                disabled={!booking.meet_link || !isMeetActive}
                className="gap-2 bg-neon-orange hover:bg-neon-orange/90 text-black min-w-[140px]"
                onClick={handleJoin}
              >
                <Video size={16} />
                {!isMeetActive ? `Starts in ${countdownText}` : "Join Meeting"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Student selected slot</p>
              <p className="text-sm font-medium text-foreground">{booking.selected_slot || "—"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-medium text-foreground">{booking.status || "pending"}</p>
            </div>
            <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Session price</p>
              <p className="text-sm font-medium text-foreground">
                {booking.session_price ? `₹${booking.session_price}` : "—"}
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

