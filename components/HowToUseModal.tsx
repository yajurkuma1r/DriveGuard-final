"use client";

import { useState } from "react";

export default function HowToUseModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button in Navbar */}
      <button
        onClick={() => setOpen(true)}
        className="hover:text-white transition-all duration-200"
      >
        Help
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          
          {/* Modal Box */}
          <div className="bg-[#16181D] w-[90%] max-w-lg p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-fadeIn">
            
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <h2 className="text-xl font-semibold mb-4 text-white">
              How to Use DriveGuard
            </h2>

            <ul className="text-sm text-gray-300 space-y-3">
              <li>• Type or speak your situation in AI Chat → click Analyze</li>
              <li>• Click 🎤 to use voice input (speech will auto-fill)</li>
              <li>• Or manually select violations → click Calculate</li>
              <li>• Toggle missing documents to adjust fine</li>
              <li>• Choose first / second / repeat offense</li>
              <li>• View total fine, laws, and actions instantly</li>
            </ul>

          </div>
        </div>
      )}
    </>
  );
}