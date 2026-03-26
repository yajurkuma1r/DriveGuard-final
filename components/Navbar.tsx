"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import HowToUseModal from "@/components/HowToUseModal";
import AuthModal from "@/components/AuthModal";

type AuthMode = "login" | "signup";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <Image
            src="/driveguard-logo.png"
            alt="DriveGuard Logo"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />
          <div>
            <h1 className="font-semibold text-lg leading-none">
              <span className="text-white">Drive</span>
              <span className="text-emerald-400">Guard</span>
            </h1>
            <p className="text-xs text-gray-400">India</p>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">

          <Link href="/" className="hover:text-white transition">
            Dashboard
          </Link>

          <Link href="/about" className="hover:text-white transition">
            About
          </Link>

          <HowToUseModal />

          {!isAuthenticated ? (
            <>
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 sm:px-4 text-gray-200 hover:scale-105 transition"
              >
                Login
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                className="rounded-xl bg-gradient-to-r from-blue-400 to-green-400 px-3 py-2 sm:px-4 font-medium text-black hover:scale-105 transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="h-10 w-10 rounded-full bg-white/10 text-white hover:scale-105 transition"
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#16181D] p-3 shadow-lg z-50">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <button
                    onClick={logout}
                    className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}