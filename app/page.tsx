"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ChatBox from "@/components/ChatBox";
import DocumentsBox from "@/components/DocumentsBox";
import ManualEntry from "@/components/ManualEntry";
import HistorySection from "@/components/HistorySection";
import Navbar from "@/components/Navbar";

const TrafficLightBackground = dynamic(
  () => import("@/components/TrafficLightBackground"),
  { ssr: false }
);

const DriverPOVBackground = dynamic(
  () => import("@/components/DriverPOVBackground"),
  { ssr: false }
);

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

export default function Home() {
  const [documents, setDocuments] = useState<DocumentAnswers>({
    license: true,
    rc: true,
    insurance: true,
    puc: true,
    permit: true,
    fitness: true,
    road_tax: true,
    fastag: true,
  });

  const [offenseHistory, setOffenseHistory] = useState<OffenseLevel>("First");

  const isComplianceReady = useMemo(() => {
    return (
      Object.values(documents).every((value) => value !== null) &&
      offenseHistory !== null
    );
  }, [documents, offenseHistory]);

  return (
    <div className="relative min-h-screen bg-[#0B0B0C] text-white">
      <TrafficLightBackground />
      <DriverPOVBackground />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <Navbar />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ChatBox
            isComplianceReady={isComplianceReady}
            offenseHistory={offenseHistory}
            documents={documents}
          />
          <DocumentsBox
            documents={documents}
            setDocuments={setDocuments}
            offenseHistory={offenseHistory}
            setOffenseHistory={setOffenseHistory}
          />
          <ManualEntry
            isComplianceReady={isComplianceReady}
            offenseHistory={offenseHistory}
            documents={documents}
          />
        </div>

        <div className="mx-auto max-w-7xl mt-6">
          <HistorySection />
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          <p>
            Contact: <span className="text-white">Yajur</span>
            <span className="mx-2">|</span>
            Email: <span className="text-white">toyajurgupta@gmail.com</span>
            <span className="mx-2">|</span>
            Phone: <span className="text-white">9971960283</span>
          </p>
        </div>
      </div>
    </div>
  );
}
