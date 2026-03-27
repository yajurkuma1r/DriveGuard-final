"use client";

import { useEffect, useState } from "react";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) setResult(JSON.parse(decodeURIComponent(data)));
  }, []);

  if (!result) return (
    <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white p-8">
      <h1 className="text-2xl font-semibold mb-6">Result Analysis</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-400">Violations</p>
        <p className="text-lg">{result.violations.join(", ")}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-400">State</p>
        <p>{result.state}</p>
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Breakdown</p>
        {result.breakdown.map((b: any, i: number) => (
          <div key={i} className="flex justify-between py-1">
            <span>{b.violation || b.name || b.document}</span>
            <span>₹{b.fine}</span>
          </div>
        ))}
      </div>
      <div className="text-3xl font-bold text-green-400 mb-6">₹{result.total_fine}</div>
      <div className="mb-4">
        <p className="text-sm text-gray-400">Law Sections</p>
        <p>{result.law_sections.join(", ")}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Actions</p>
        <p>{result.actions.join(", ")}</p>
      </div>
    </div>
  );
}
