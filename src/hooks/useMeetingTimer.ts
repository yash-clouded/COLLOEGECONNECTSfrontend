import { useState, useEffect } from "react";

export type MeetingTimerStatus = {
  isMeetActive: boolean;
  countdownText: string;
  secondsUntilActive: number;
};

/**
 * Hook to manage meeting activation (e.g., 10 minutes before) and countdown display.
 */
export function useMeetingTimer(scheduledTimeStr: string | undefined): MeetingTimerStatus {
  const [status, setStatus] = useState<MeetingTimerStatus>({
    isMeetActive: false,
    countdownText: "",
    secondsUntilActive: 0,
  });

  useEffect(() => {
    if (!scheduledTimeStr) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledTimeStr).getTime();
      const diffInSeconds = Math.floor((scheduled - now) / 1000);
      const activeThreshold = 10 * 60; // 10 minutes

      if (diffInSeconds <= activeThreshold) {
        setStatus({
          isMeetActive: true,
          countdownText: "",
          secondsUntilActive: 0,
        });
      } else {
        const remainingUntilActive = diffInSeconds - activeThreshold;
        const h = Math.floor(remainingUntilActive / 3600);
        const m = Math.floor((remainingUntilActive % 3600) / 60);
        const s = remainingUntilActive % 60;

        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || h > 0) parts.push(`${m}m`);
        parts.push(`${s}s`);

        setStatus({
          isMeetActive: false,
          countdownText: parts.join(" "),
          secondsUntilActive: remainingUntilActive,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledTimeStr]);

  return status;
}
