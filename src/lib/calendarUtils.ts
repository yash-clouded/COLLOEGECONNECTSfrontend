/**
 * Universal Calendar Utilities for generating Google, Outlook, and iCal/Apple Calendar URLs.
 */

export type CalendarEvent = {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
};

/**
 * Format date for Google/Outlook (YYYYMMDDTHHMMSSZ)
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
}

/**
 * Google Calendar TEMPLATE URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Outlook.com / Live.com Web Calendar URL
 */
export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const start = event.startTime;
  const end = event.endTime;
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  return `https://outlook.office.com/calendar/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`;
}

/**
 * Generate .ics Content iCal/Apple Calendar
 */
export function getICalContent(event: CalendarEvent): string {
  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);
  const title = event.title.replace(/[,;]/g, "\\$1");
  const details = event.description.replace(/[,;]/g, "\\$1");
  const location = event.location.replace(/[,;]/g, "\\$1");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PROID:-//CollegeConnect//Session Booking//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Create a Downloadable Blob URL for the .ics file
 */
export function downloadICalFile(event: CalendarEvent): void {
  const content = getICalContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
