'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Judging your homepage…',
  'Checking if Google can understand this…',
  'Counting unnecessary JavaScript…',
  'Inspecting your buttons…',
  'Reading your meta description out loud…',
  'Measuring how many CTAs is "too many"…',
  'Preparing emotional damage…',
  'Almost done…',
];

export function LoadingSequence() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-500/30" />
        <span className="relative text-3xl animate-flicker">🔥</span>
      </div>
      <p key={index} className="animate-rise-in font-display text-lg font-semibold text-white/90">
        {MESSAGES[index]}
      </p>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-[loading-slide_1.4s_ease-in-out_infinite] rounded-full bg-flame-gradient" />
      </div>
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
