"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdEmail, MdLock } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";


function IconEmail() {
  return (
    <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  );
}

function IconLock() {
  return (
    <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  );
}

function StatusChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#e0ddd8] rounded-xl px-4 py-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
      <span className="text-base leading-none">{icon}</span>
      <span className="font-dm text-[0.82rem] font-medium text-gray-800">{label}</span>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const router = useRouter();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("LOGIN CLICKED");

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json", // 🔥 WAJIB
        },
        body: JSON.stringify(form),
      });

      // 🔥 langsung coba ambil JSON
      let data;
      try {
        data = await res.json();
      } catch (err) {
        // kalau gagal → berarti HTML
        const text = await res.text();
        console.error("NOT JSON RESPONSE:", text);
        throw new Error("Server error (bukan JSON)");
      }

      console.log("RESPONSE JSON:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login gagal");
      }

      localStorage.setItem("token", data.access_token);

      console.log("LOGIN SUCCESS");
      router.push("/dashboard");

    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      setError((err as Error).message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`);
      const data = await res.json();

      console.log("GOOGLE LOGIN RESPONSE:", data);

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <div className="min-h-screen flex flex-col font-dm" style={{ backgroundColor: "#f0ede8" }}>

        {/* ── Navbar ──────────────────────────────────────── */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between h-16 px-8 md:px-12 bg-white"
          style={{ borderBottom: "1px solid #e8e4de" }}
        >
          <span className="font-syne text-xl font-bold tracking-tight text-gray-900">
            Velofit
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="font-dm text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#c45c0a" }}
            >
              Login
            </Link>
            <Link
              href="/registration"
              className="font-dm text-sm font-semibold text-white px-5 py-2 rounded-md transition-colors"
              style={{ backgroundColor: "#b85c08" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9a4d06")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#b85c08")}>
              Sign Up
            </Link>
          </div>
        </nav>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-6xl w-full mx-auto py-14">
          {/* kiri */}
          <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="font-dm text-[0.68rem] font-bold tracking-widest text-white px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#b8961a", letterSpacing: "0.08em" }}>
                V1.0 VERSION
              </span>
              <span className="flex gap-1.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#e07230" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f0a870" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#d94f2b" }} />
              </span>
            </div>

            <h1
              className="font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-5"
              style={{ fontSize: "clamp(2.3rem, 4vw, 3.1rem)" }}>
              Gear up for the<br />
              <span style={{ color: "#c45c0a" }}>next ride.</span>
            </h1>

            <div
              className="rounded-full mb-5 hidden lg:block"
              style={{
                width: "4px",
                height: "52px",
                background: "linear-gradient(to bottom, #e07230, #f5c5a8)",
              }}
            />
            <div
              className="rounded-full mb-5 block lg:hidden"
              style={{
                width: "52px",
                height: "4px",
                background: "linear-gradient(to right, #e07230, #f5c5a8)",
              }}
            />

            <p
              className="font-dm leading-relaxed text-gray-600 max-w-sm mb-8"
              style={{ fontSize: "0.95rem" }}>
              Access your helmet&apos;s telemetry, safety logs, and
              heads-up display preferences in one secure cockpit.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <StatusChip icon="💀" label="Active Sync" />
              <StatusChip icon="🔋" label="Battery 98%" />
              <StatusChip icon="🛡️" label="System OK" />
            </div>
          </section>

          <section className="flex justify-center">
            <div
              className="w-full bg-white rounded-2xl px-8 md:px-10 py-10 animate-fade-up"
              style={{
                maxWidth: "460px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
              }}
            >
              <h2 className="text-[1.85rem] font-bold tracking-tight text-gray-900 mb-1.5">
                Welcome Back
              </h2>
              <p className="font-dm text-sm mb-7" style={{ color: "#7a7a7a" }}>
                Sign in to sync your velofit data.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-5 font-dm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-dm text-[0.85rem] font-semibold text-gray-900">
                    Email Address
                  </label>
                  <div className="relative">
                    <IconEmail />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                      className="w-full rounded-xl pl-10 pr-4 py-3 font-dm text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                      style={{
                        backgroundColor: "#f4f4f4",
                        border: "1.5px solid transparent",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#c45c0a";
                        e.target.style.backgroundColor = "#fffcfa";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "transparent";
                        e.target.style.backgroundColor = "#f4f4f4";
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-dm text-[0.85rem] font-semibold text-gray-900">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="font-dm text-[0.82rem] font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "#c45c0a" }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <IconLock />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl pl-10 pr-4 py-3 font-dm text-sm text-gray-900 outline-none transition-all placeholder-gray-400"
                      style={{
                        backgroundColor: "#f4f4f4",
                        border: "1.5px solid transparent",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#c45c0a";
                        e.target.style.backgroundColor = "#fffcfa";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "transparent";
                        e.target.style.backgroundColor = "#f4f4f4";
                      }}
                    />
                  </div>
                </div>

                {/* Remember */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: "#c45c0a" }}
                  />
                  <span className="font-dm text-[0.88rem] text-gray-600">
                    Remember this device
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-dm font-semibold text-[1rem] py-3.5 rounded-xl transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)",
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}>
                  {loading ? "Signing in..." : "Login to Dashboard"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <span className="flex-1 h-px" style={{ backgroundColor: "#e0ddd8" }} />
                <span
                  className="font-dm text-[0.7rem] font-semibold tracking-widest whitespace-nowrap"
                  style={{ color: "#b0b0b0" }}
                >
                  OR CONTINUE WITH
                </span>
                <span className="flex-1 h-px" style={{ backgroundColor: "#e0ddd8" }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl py-3 font-dm text-[0.92rem] font-medium text-gray-800 transition-all"
                style={{ border: "1.5px solid #e0ddd8" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f6f3";
                  e.currentTarget.style.borderColor = "#c8c4be";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e0ddd8";
                }}
              >
                <FcGoogle size={20} />
                Google
              </button>

              {/* Register */}
              <p className="text-center font-dm text-[0.88rem] mt-5" style={{ color: "#7a7a7a" }}>
                New to Velofit?{" "}
                <Link
                  href="/registration"
                  className="font-bold transition-opacity hover:opacity-75"
                  style={{ color: "#c45c0a" }}>
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer
          className="flex items-center justify-between px-8 md:px-12 py-4 flex-wrap gap-2"
          style={{
            borderTop: "1px solid #e0ddd8",
            backgroundColor: "#f0ede8",
          }}
        >
          <span className="font-syne text-sm font-semibold" style={{ color: "#7a7a7a" }}>
            Velofit
          </span>
          {/* <Link
            href="/contact"
            className="font-dm text-[0.85rem] transition-colors hover:text-gray-900"
            style={{ color: "#7a7a7a" }}
          >
            Contact Us
          </Link> */}
          <span className="font-dm text-[0.82rem]" style={{ color: "#9a9a9a" }}>
            © 2026 Velofit. Precision &amp; Safety.
          </span>
        </footer>
      </div>
    </>
  );
}