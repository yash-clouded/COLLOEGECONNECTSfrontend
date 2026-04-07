import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PaymentStatusPage() {
  const search = useSearch({ from: "/payment-status" }) as any;
  const [status, setStatus] = useState<"success" | "failure" | "pending">("pending");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // 1. Get status from URL
    const urlStatus = search.status || (search.code === "PAYMENT_SUCCESS" ? "success" : null);
    if (urlStatus === "success") {
      setStatus("success");
    } else if (urlStatus === "failure" || search.code === "PAYMENT_ERROR") {
      setStatus("failure");
    }

    // 2. Extrapolate booking details from search params or localStorage
    const details = {
      advisorName: search.advisorName || "",
      selectedSlot: search.selectedSlot || "",
      advisorId: search.advisorId || "",
    };
    
    if (details.advisorName) {
      setBookingDetails(details);
    } else {
      const saved = localStorage.getItem("pending_booking");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Date.now() < parsed.expires) {
            setBookingDetails(parsed);
          }
        } catch (e) {
          console.error("Failed to parse pending booking", e);
        }
      }
    }
  }, [search]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-32">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl border border-border p-8 text-center"
        >
          {status === "pending" ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-neon-teal animate-spin" />
              <h1 className="text-2xl font-bold text-foreground">Verifying Payment…</h1>
              <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neon-teal/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-neon-teal" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your session with <span className="text-foreground font-semibold">{bookingDetails?.advisorName || "your advisor"}</span> has been booked.
              </p>
              {bookingDetails?.selectedSlot && (
                <div className="bg-background/50 rounded-xl px-4 py-2 border border-border/50 text-sm mt-2">
                  <p className="text-muted-foreground text-xs">Scheduled Slot</p>
                  <p className="font-medium text-foreground">{bookingDetails.selectedSlot}</p>
                </div>
              )}
              <div className="w-full h-px bg-border/50 my-6" />
              <div className="flex flex-col gap-3 w-full">
                <Button asChild className="bg-neon-teal hover:bg-neon-teal/90 text-black font-semibold rounded-xl h-12 gap-2">
                  <Link to="/student/dashboard">
                    Go to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neon-orange/20 flex items-center justify-center mb-2">
                <XCircle className="w-10 h-10 text-neon-orange" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
              <p className="text-muted-foreground">
                Something went wrong with your transaction. No money was charged, or it will be refunded shortly.
              </p>
              <div className="w-full h-px bg-border/50 my-6" />
              <div className="flex flex-col gap-3 w-full">
                <Button asChild variant="outline" className="rounded-xl h-12">
                  <Link to="/student/dashboard">Back to Dashboard</Link>
                </Button>
                {bookingDetails?.advisorId && (
                  <Button asChild className="bg-neon-teal hover:bg-neon-teal/90 text-black font-semibold rounded-xl h-12">
                    <Link to="/student/advisor/$advisorId" params={{ advisorId: bookingDetails.advisorId }}>
                      Try Again
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
