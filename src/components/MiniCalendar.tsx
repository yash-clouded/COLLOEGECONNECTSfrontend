import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Session = {
  date: string; // YYYY-MM-DD
  title: string;
  status: string;
};

export function MiniCalendar({ sessions }: { sessions: Session[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getSessionsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sessions.filter((s) => s.date === dateStr);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{monthNames[month]} {year}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronLeft size={16} className="text-slate-400" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-[10px] font-black text-slate-300 text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}
        {days.map((d) => {
          const daySessions = getSessionsForDay(d);
          const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
          return (
            <div key={d} className={`h-10 flex flex-col items-center justify-center rounded-xl relative group transition-all ${isToday ? "bg-navy/5" : "hover:bg-slate-50"}`}>
              <span className={`text-xs font-bold ${isToday ? "text-navy" : "text-slate-600"}`}>{d}</span>
              {daySessions.length > 0 && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-mango" />
              )}
              
              {daySessions.length > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                  <div className="bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl">
                    {daySessions.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'confirmed' ? 'bg-emerald-400' : 'bg-mango'}`} />
                        {s.title}
                      </div>
                    ))}
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
