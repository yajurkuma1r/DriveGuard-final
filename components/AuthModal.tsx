"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

type AuthMode = "login" | "signup";

type AuthModalProps = {
  mode: AuthMode;
  open: boolean;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export default function AuthModal({
  mode,
  open,
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const { login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  // ✅ Global loader
  const { setLoading } = useLoading();

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ✅ Close modal first so wheel shows cleanly without overlap
    onClose();
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ name, email, password });
      }
      if (!rememberMe) {
        sessionStorage.setItem("tfa_logged_in_session_only", "1");
      }
      resetForm();
    } catch (e) {
      // ✅ Reopen modal and show error if auth fails
      setError(e instanceof Error ? e.message : "Authentication failed");
      onClose(); // keep closed, error shown on retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#16181D]/90 p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.65)] transition-all duration-300 animate-[fadeIn_0.2s_ease-out]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-2 py-1 text-sm text-gray-300 transition hover:bg-white/10"
          >
            x
          </button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:shadow-[0_0_14px_rgba(59,130,246,0.35)]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-3 py-2 text-sm outline-none transition focus:border-green-400 focus:shadow-[0_0_14px_rgba(34,197,94,0.35)]"
          />
          {mode === "signup" && (
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-3 py-2 text-sm outline-none transition focus:border-green-400 focus:shadow-[0_0_14px_rgba(34,197,94,0.35)]"
            />
          )}
        </div>

        {mode === "login" && (
          <label className="mt-4 flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-green-400"
            />
            Remember me
          </label>
        )}

        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

        <button
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-400 to-green-400 px-4 py-2 text-sm font-semibold text-black transition duration-200 hover:scale-105 hover:shadow-[0_0_22px_rgba(59,130,246,0.3)] active:scale-95"
        >
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => onSwitchMode(mode === "login" ? "signup" : "login")}
            className="text-blue-300 transition hover:text-blue-200"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}