"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

const violations = [
  { key: "overspeeding",  label: "Overspeeding",              icon: "⚡" },
  { key: "no_helmet",     label: "No Helmet",                 icon: "⛑️" },
  { key: "no_seatbelt",   label: "No Seatbelt",               icon: "🪢" },
  { key: "red_light_jump",label: "Red Light Jump",            icon: "🚦" },
  { key: "wrong_lane",    label: "Wrong Lane",                icon: "↔️" },
  { key: "drunk_driving", label: "Drunk Driving",             icon: "🍺" },
  { key: "no_license",    label: "No License",                icon: "🪪" },
  { key: "no_insurance",  label: "No Insurance",              icon: "📄" },
  { key: "mobile_usage",  label: "Mobile Usage While Driving",icon: "📱" },
  { key: "triple_riding", label: "Triple Riding",             icon: "👥" },
];

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

type ManualEntryProps = {
  isComplianceReady: boolean;
  offenseHistory: OffenseLevel;
  documents: DocumentAnswers;
};

const toRepeatNumber = (offenseHistory: OffenseLevel) => {
  if (offenseHistory === "Second") return 2;
  if (offenseHistory === "Repeat") return 3;
  return 1;
};

export default function ManualEntry({
  isComplianceReady,
  offenseHistory,
  documents,
}: ManualEntryProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("");
  const { isAuthenticated, token } = useAuth();
  const { setLoading } = useLoading();

  const toggleViolation = (v: string) => {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleCalculate = async () => {
    if (selected.length === 0) return;
    if (!isComplianceReady) {
      alert("Please complete Documents & Offense History panel first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://driveguard.onrender.com"}/api/calculate-fine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violations: selected,
          documents,
          state: city.trim()
            ? `${city.trim()}, ${state.trim() || "Unknown"}`
            : state.trim() || "Unknown",
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
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16181D] rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
      <h2 className="text-sm font-semibold mb-4">🧾 Manual Entry</h2>

      {/* State */}
      <input
        placeholder="State"
        list="india-states"
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="w-full mb-3 bg-[#0F1115] p-2 rounded-lg text-sm outline-none border border-white/5 focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
      />
      <datalist id="india-states">
        {INDIAN_STATES_AND_UTS.map((stateName) => (
          <option key={stateName} value={stateName} />
        ))}
      </datalist>

      {/* City */}
      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full mb-4 bg-[#0F1115] p-2 rounded-lg text-sm outline-none border border-white/5 focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
      />

      {/* Violations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {violations.map((v) => {
          const active = selected.includes(v.key);
          return (
            <button
              key={v.key}
              onClick={() => toggleViolation(v.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all duration-200 hover:scale-105 ${
                active
                  ? "bg-blue-500/20 border border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : "bg-[#0F1115] border border-white/5 hover:border-white/20"
              }`}
            >
              <span className="text-base leading-none">{v.icon}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Button */}
      <button
        onClick={handleCalculate}
        disabled={!isComplianceReady}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-black font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Calculate Fine
      </button>

      {!isComplianceReady && (
        <p className="text-[11px] text-amber-400 mt-2">
          Complete Documents & Offense History to continue.
        </p>
      )}
    </div>
  );
}