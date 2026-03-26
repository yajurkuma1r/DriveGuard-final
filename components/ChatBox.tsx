"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLoading } from "@/context/LoadingContext";

const VIOLATION_KEYWORDS: Record<string, string[]> = {
  no_helmet: ["no helmet", "without helmet", "helmet nahi", "helmet not wearing"],
  no_seatbelt: ["no seatbelt", "without seatbelt", "seat belt nahi", "no seat belt"],
  red_light_jump: ["red light jump", "jumped signal", "broke signal", "signal jump"],
  overspeeding: ["overspeed", "speeding", "high speed", "over speed"],
  drunk_driving: [
    "drunk", "alcohol", "drink and drive", "drunken driving",
    "drinking and driving", "driving after drinking", "drink driving", "drunk driving",
  ],
  no_license: ["no license", "without license", "licence nahi", "no licence"],
  no_rc: ["no rc", "without rc", "registration not available"],
  no_insurance: ["no insurance", "without insurance", "insurance expired"],
  no_puc: ["no puc", "without puc", "pollution certificate expired", "puc expired"],
  dangerous_driving: ["dangerous driving"],
  mobile_usage: ["using mobile", "phone while driving", "mobile usage", "talking on phone"],
  wrong_lane: ["wrong lane", "lane violation"],
  triple_riding: ["triple riding", "three people on bike", "3 people on bike"],
  overloading: ["overloading", "over load"],
  no_number_plate: ["no number plate", "without number plate"],
  illegal_parking: ["illegal parking", "no parking"],
  signal_violation: ["signal violation", "traffic signal violation"],
  rash_driving: ["rash driving", "reckless driving"],
  without_permit: ["without permit", "no permit"],
  no_fastag: ["no fastag", "without fastag", "fastag missing"],
};

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const detectViolations = (input: string) => {
  const text = input.toLowerCase();
  return Object.entries(VIOLATION_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([ruleKey]) => ruleKey);
};

const toTitleCase = (value: string) =>
  value.split(" ").filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const detectLocation = (input: string) => {
  const text = input.toLowerCase();
  const matchedState = INDIAN_STATES_AND_UTS.find((state) =>
    text.includes(state.toLowerCase())
  );
  if (matchedState) return matchedState;

  const cityMatch = text.match(
    /\b(?:in|at|from)\s+([a-z]+(?:[\s-][a-z]+){0,3})(?=\b(?:for|with|without|while|and|,|\.|$))/i
  );
  if (cityMatch?.[1]) {
    return toTitleCase(cityMatch[1].replace(/\s+/g, " ").trim());
  }
  return "Unknown";
};

type OffenseLevel = "First" | "Second" | "Repeat" | null;
type DocumentAnswers = {
  license: boolean | null;
  rc: boolean | null;
  insurance: boolean | null;
  puc: boolean | null;
  permit: boolean | null;
  fitness: boolean | null;
  road_tax: boolean | null;
  fastag: boolean | null;
};

type ChatBoxProps = {
  isComplianceReady: boolean;
  offenseHistory: OffenseLevel;
  documents: DocumentAnswers;
};

const toRepeatNumber = (offenseHistory: OffenseLevel) => {
  if (offenseHistory === "Second") return 2;
  if (offenseHistory === "Repeat") return 3;
  return 1;
};

export default function ChatBox({ isComplianceReady, offenseHistory, documents }: ChatBoxProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  // ✅ Global loader instead of local loading state
  const { setLoading } = useLoading();

  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    },
    onError: (error) => {
      if (error === "not-allowed") {
        setVoiceError("Mic access denied. Please allow microphone permission.");
      } else if (error === "no-speech") {
        setVoiceError("No speech detected. Try again.");
      } else {
        setVoiceError("Voice input failed. Try again.");
      }
      setTimeout(() => setVoiceError(null), 3000);
    },
  });

  const handleMicDown = () => {
    setIsRecording(true);
    setVoiceError(null);
    startListening();
  };

  const handleMicUp = () => {
    setIsRecording(false);
    stopListening();
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    if (!isComplianceReady) {
      alert("Please complete Documents & Offense History panel first.");
      return;
    }

    // ✅ Triggers global steering wheel loader
    setLoading(true);

    try {
      const detectedViolations = detectViolations(text);
      const detectedLocation = detectLocation(text);

      if (detectedViolations.length === 0) {
        alert(
          "Could not detect a violation. Try phrases like: drunk driving, no helmet, red light jump, overspeeding."
        );
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://driveguard.onrender.com"}/api/calculate-fine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violations: detectedViolations,
          documents,
          state: detectedLocation,
          repeat: toRepeatNumber(offenseHistory),
        }),
      });

      const result = await res.json();

      if (isAuthenticated && token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://driveguard.onrender.com"}/api/save-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(result),
        });
      }

      router.push(`/result?data=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // ✅ Stops global steering wheel loader
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16181D] rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
      <h2 className="text-sm font-semibold mb-2">✨ AI Assistant</h2>

      <p className="text-xs text-gray-400 mb-4">
        Describe your traffic incident and let AI analyze the situation
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your traffic incident in detail..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full min-h-36 h-36 sm:h-40 bg-[#0F1115] rounded-xl p-3 text-sm outline-none border transition-all duration-300 ${
          focused
            ? "border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            : isRecording
            ? "border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            : "border-white/5"
        }`}
      />

      {isRecording && (
        <p className="text-[11px] text-red-400 mt-2 animate-pulse">
          🎙️ Listening... release to stop
        </p>
      )}

      {voiceError && (
        <p className="text-[11px] text-red-400 mt-2">{voiceError}</p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {/* Mic Button */}
        <button
          onMouseDown={handleMicDown}
          onMouseUp={handleMicUp}
          onMouseLeave={handleMicUp}
          onTouchStart={handleMicDown}
          onTouchEnd={handleMicUp}
          className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
            isRecording
              ? "bg-red-500/20 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}
          title="Hold to speak"
          type="button"
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.364a.75.75 0 0 1 .75.75A7.002 7.002 0 0 1 12.75 18.93V21h2.25a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5H11.25v-2.07A7.002 7.002 0 0 1 4.886 11.114a.75.75 0 0 1 1.5 0 5.5 5.5 0 0 0 11 0 .75.75 0 0 1 .978-.75z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.364a.75.75 0 0 1 .75.75A7.002 7.002 0 0 1 12.75 18.93V21h2.25a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5H11.25v-2.07A7.002 7.002 0 0 1 4.886 11.114a.75.75 0 0 1 1.5 0 5.5 5.5 0 0 0 11 0 .75.75 0 0 1 .978-.75z" />
            </svg>
          )}
        </button>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!isComplianceReady}
          className="w-full sm:w-auto bg-white/10 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze →
        </button>
      </div>

      {!isComplianceReady && (
        <p className="text-[11px] text-amber-400 mt-2">
          Complete Documents & Offense History to continue.
        </p>
      )}

      <p className="text-[11px] text-gray-500 mt-4">
        💡 Example: Driving without helmet in Mumbai, second time...
      </p>
    </div>
  );
}