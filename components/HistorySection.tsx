"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type HistoryItem = {
  id: string;
  created_at: number;
  violations: string[];
  total_fine: number;
  breakdown: Array<{ violation?: string; name?: string; fine: number }>;
  law_sections: string[];
  actions: string[];
  state: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://driveguard.onrender.com";

export default function HistorySection() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setItems(data.history || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated, token]);

  // ✅ CLEAR HISTORY FUNCTION
  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all history?")) return;

    try {
      await fetch(`${API_BASE}/api/clear-history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems([]); // instantly update UI
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#16181D]/70 p-4 sm:p-6 text-center text-sm text-gray-400">
        Login to save history and personalized analytics.
      </div>
    );
  }

  return (
    <section className="mt-8">

      {/* HEADER + CLEAR BUTTON */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">History</h2>

        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:scale-105 transition"
          >
            Clear History
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading history...</p>}

      <div className="grid gap-4">
        {items.map((item) => {
          const expanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#16181D]/80 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                <p className="text-xs sm:text-sm text-gray-300">
                  {new Date(item.created_at * 1000).toLocaleString()} - {item.state}
                </p>
                <p className="text-base sm:text-lg font-semibold text-green-400">₹{item.total_fine}</p>
              </div>

              <p className="mt-1 text-sm text-gray-200">
                {item.violations.length ? item.violations.join(", ") : "No violation text"}
              </p>

              <button
                onClick={() => setExpandedId(expanded ? null : item.id)}
                className="mt-3 rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:scale-105 hover:bg-white/20 active:scale-95"
              >
                {expanded ? "Hide details" : "View details"}
              </button>

              {expanded && (
                <div className="mt-3 rounded-xl border border-white/10 bg-[#0F1115] p-3 text-xs text-gray-300">
                  <p className="mb-1">Breakdown:</p>
                  {item.breakdown.map((b, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex justify-between py-0.5">
                      <span>{b.violation || b.name || "Entry"}</span>
                      <span>₹{b.fine}</span>
                    </div>
                  ))}
                  <p className="mt-2">Laws: {item.law_sections.join(", ")}</p>
                  <p className="mt-1">Actions: {item.actions.join(", ")}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-400">No history yet. Your searches will appear here.</p>
      )}
    </section>
  );
}