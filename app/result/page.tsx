import { Suspense } from "react";
import ResultClient from "./ResultClient";

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        Loading...
      </div>
    }>
      <ResultClient />
    </Suspense>
  );
}
