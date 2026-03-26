"use client";

import { Dispatch, SetStateAction } from "react";

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

type OffenseLevel = "First" | "Second" | "Repeat" | null;

type DocumentsBoxProps = {
  documents: DocumentAnswers;
  setDocuments: Dispatch<SetStateAction<DocumentAnswers>>;
  offenseHistory: OffenseLevel;
  setOffenseHistory: Dispatch<SetStateAction<OffenseLevel>>;
};

const documentLabels: Record<keyof DocumentAnswers, string> = {
  license: "License",
  rc: "RC",
  insurance: "Insurance",
  puc: "PUC",
  permit: "Permit",
  fitness: "Fitness Certificate",
  road_tax: "Road Tax Receipt",
  fastag: "FASTag",
};

export default function DocumentsBox({
  documents,
  setDocuments,
  offenseHistory,
  setOffenseHistory,
}: DocumentsBoxProps) {
  const toggleDocument = (key: keyof DocumentAnswers) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: prev[key] === true ? false : true,
    }));
  };

  return (
    <div className="bg-[#16181D] rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
      <h2 className="text-sm font-semibold mb-4">📄 Documents & History</h2>

      {(Object.keys(documents) as (keyof DocumentAnswers)[]).map((key) => (
        <div key={key} className="flex justify-between items-center gap-3 mb-3">
          <span className="text-sm text-gray-300 leading-tight">* {documentLabels[key]}</span>

          <div
            onClick={() => toggleDocument(key)}
            className={`w-10 h-5 rounded-full cursor-pointer transition ${
              documents[key] === true ? "bg-green-400" : "bg-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-0.5 transition ${
                documents[key] === true ? "ml-5" : "ml-1"
              }`}
            />
          </div>
        </div>
      ))}

      <div className="mt-5">
        <p className="text-xs text-gray-400 mb-2">* Offense History</p>

        <div className="flex flex-wrap gap-2">
          {["First", "Second", "Repeat"].map((type) => {
            const active = offenseHistory === type;

            return (
              <button
                key={type}
                onClick={() => setOffenseHistory(type as OffenseLevel)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 ${
                  active
                    ? "bg-green-400 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}