"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";

interface DateDisplayProps {
  date: Date;
  className?: string;
}

export default function DateDisplay({
  date,
  className = "",
}: DateDisplayProps) {
  const formattedDate = useMemo(() => {
    const dayNames = ["Nie", "Pon", "Wto", "Śro", "Czw", "Pią", "Sob"];
    const monthNames = [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ];

    const dayOfWeek = dayNames[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthNames[date.getMonth()];
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return {
      dayOfWeek,
      dayOfMonth,
      month,
      time: `${hour}:${minute}`,
      fullDate: `${dayOfWeek}, ${dayOfMonth} ${month}`,
    };
  }, [date]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-600">
        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />

        {/* Mobile: Stacked layout */}
        <div className="flex flex-col sm:hidden text-sm">
          <span className="font-medium text-slate-700">
            {formattedDate.fullDate}
          </span>
          <span className="text-xs text-slate-500">{formattedDate.time}</span>
        </div>

        {/* Desktop: Inline layout */}
        <div className="hidden sm:flex items-center gap-1 text-sm">
          <span className="font-medium text-slate-700">
            {formattedDate.fullDate}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-medium text-slate-600">
            {formattedDate.time}
          </span>
        </div>
      </div>
    </div>
  );
}
