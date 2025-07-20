"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  endTime: Date;
  onTimeExpired?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({
  endTime,
  onTimeExpired,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = new Date().getTime();
    const endTimeMs = endTime.getTime();
    const difference = endTimeMs - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  }, [endTime]);

  useEffect(() => {
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft.total <= 0) {
      setIsExpired(true);
      onTimeExpired?.();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      setTimeLeft((prevTime) => {
        if (
          prevTime.seconds !== newTimeLeft.seconds ||
          prevTime.minutes !== newTimeLeft.minutes ||
          prevTime.hours !== newTimeLeft.hours ||
          prevTime.days !== newTimeLeft.days
        ) {
          return newTimeLeft;
        }
        return prevTime;
      });

      if (newTimeLeft.total <= 0 && !isExpired) {
        setIsExpired(true);
        clearInterval(timer);
        onTimeExpired?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onTimeExpired, isExpired]);

  const { isUrgent, isCritical, isLastSeconds } = useMemo(
    () => ({
      isUrgent: timeLeft.total <= 5 * 60 * 1000, // 5 minutes
      isCritical: timeLeft.total <= 60 * 1000, // 1 minute
      isLastSeconds: timeLeft.total <= 10 * 1000, // 10 seconds
    }),
    [timeLeft.total]
  );

  if (isExpired) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">Zakończone</span>
        </div>
      </div>
    );
  }

  // Format time for mobile display
  const formatTime = () => {
    const parts = [];

    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
    }
    if (timeLeft.hours > 0 || timeLeft.days > 0) {
      parts.push(`${timeLeft.hours}h`);
    }
    parts.push(`${timeLeft.minutes}m`);
    parts.push(`${timeLeft.seconds}s`);

    return parts.join(" ");
  };

  const getStatusColor = () => {
    if (isLastSeconds) return "text-red-600 bg-red-50 border-red-200";
    if (isCritical) return "text-orange-600 bg-orange-50 border-orange-200";
    if (isUrgent) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Clock
          className={`w-4 h-4 ${
            isCritical
              ? "text-red-500"
              : isUrgent
              ? "text-orange-500"
              : "text-blue-500"
          } flex-shrink-0`}
        />

        {/* Unified compact layout for all screen sizes */}
        <motion.div
          key={formatTime()}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`px-2.5 py-1 rounded-md border font-mono text-sm font-medium ${getStatusColor()}`}
        >
          {formatTime()}
        </motion.div>
      </div>

      {/* Critical warning indicator */}
      {isCritical && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </motion.div>
      )}
    </div>
  );
}
