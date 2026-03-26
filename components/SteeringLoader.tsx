"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";

const MESSAGES = [
  "Analyzing violation...",
  "Calculating fine...",
  "Checking legal sections...",
  "Preparing result...",
];

export default function SteeringLoader() {
  const { isLoading } = useLoading();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Spinning Steering Wheel */}
      <div style={{ animation: "spin 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            cx="60" cy="60" r="54"
            stroke="url(#outerGrad)"
            strokeWidth="5"
            fill="none"
            filter="url(#glow)"
          />
          {/* Inner hub */}
          <circle
            cx="60" cy="60" r="10"
            stroke="url(#hubGrad)"
            strokeWidth="3"
            fill="#1a1a1a"
          />
          {/* Top spoke */}
          <path d="M60 50 L60 20" stroke="url(#spokeGrad)" strokeWidth="4" strokeLinecap="round" />
          {/* Bottom-left spoke */}
          <path d="M53 67 L30 95" stroke="url(#spokeGrad)" strokeWidth="4" strokeLinecap="round" />
          {/* Bottom-right spoke */}
          <path d="M67 67 L90 95" stroke="url(#spokeGrad)" strokeWidth="4" strokeLinecap="round" />
          {/* Top-left grip */}
          <path d="M20 55 Q15 35 35 22" stroke="url(#outerGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Top-right grip */}
          <path d="M100 55 Q105 35 85 22" stroke="url(#outerGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Bottom grip */}
          <path d="M25 75 Q30 105 95 75" stroke="url(#outerGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />

          <defs>
            <linearGradient id="outerGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#aaaaaa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#555555" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="hubGrad" x1="50" y1="50" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#666666" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="spokeGrad" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#cccccc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#444444" stopOpacity="0.5" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Cycling message */}
      <p
        key={msgIndex}
        className="mt-8 text-sm tracking-[0.2em] uppercase text-white/60"
        style={{ animation: "fadeIn 0.4s ease" }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Dot pulse */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-white/40"
            style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}