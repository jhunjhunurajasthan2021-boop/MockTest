import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDateISO?: string; // For expiry countdown
  durationMinutes?: number; // For live test countdown
  startTimeMs?: number; // For active test run
  onExpire?: () => void;
  warnAtSeconds?: number;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDateISO,
  durationMinutes,
  startTimeMs,
  onExpire,
  warnAtSeconds = 300,
  compact = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      let remaining = 0;
      if (targetDateISO) {
        const target = new Date(targetDateISO).getTime();
        const now = Date.now();
        remaining = Math.max(0, Math.floor((target - now) / 1000));
      } else if (durationMinutes && startTimeMs) {
        const end = startTimeMs + durationMinutes * 60 * 1000;
        const now = Date.now();
        remaining = Math.max(0, Math.floor((end - now) / 1000));
      }
      setSecondsRemaining(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateISO, durationMinutes, startTimeMs]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const isWarning = secondsRemaining > 0 && secondsRemaining <= warnAtSeconds;
  const isExpired = secondsRemaining === 0;

  const formatted = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isExpired
            ? 'bg-rose-100 text-rose-800'
            : isWarning
            ? 'bg-amber-100 text-amber-800 animate-pulse'
            : 'bg-emerald-100 text-emerald-800'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        {isExpired ? 'Expired' : formatted}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm transition-all ${
        isExpired
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse ring-2 ring-amber-200'
          : 'bg-slate-900 text-slate-100 border-slate-800'
      }`}
    >
      <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-600' : 'text-blue-400'}`} />
      <span>{isExpired ? 'TIME EXPIRED' : formatted}</span>
    </div>
  );
};
