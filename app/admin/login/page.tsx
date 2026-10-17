"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

// Only a genuine wrong email or password says "incorrect". Anything else is a different problem
// (no internet, wrong Supabase settings), so it gets its own message instead of blaming the password.
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Incorrect email or password";
  if (m.includes("email not confirmed")) return "Email not confirmed yet. Check your inbox";
  if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Wait a minute and try again";
  if (m.includes("fetch") || m.includes("network")) return "No connection. Check your internet";
  return "Could not sign in right now. Please try again";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [toast, setToast] = useState(params.get("reason") === "notadmin" ? "That account is not an admin" : "");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Shows a message in the top-right corner and hides it by itself after 4 seconds.
  const show = useCallback((text: string) => {
    setOk(false);
    setToast(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  }, []);
  useEffect(() => {
    if (toast) { clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 4000); }
    return () => clearTimeout(timer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      console.error("Sign-in error:", error.message); // the real reason, for debugging
      setPassword("");
      show(friendly(error.message));
      return;
    }
    // Success: show the popup for a moment, then go to the dashboard.
    setOk(true);
    setBusy(true);
    setToast("Signed in successfully");
    clearTimeout(timer.current);
    setTimeout(() => router.replace("/admin"), 1000);
  }

  const input = "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-2 focus:ring-black/10";
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-2xl shadow-white/5">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">DC</span>
          <div>
            <p className="text-base font-bold tracking-wide text-black">DANNY CYRUZ</p>
            <p className="text-xs text-neutral-500">Admin sign in</p>
          </div>
        </div>
        <input className={input} type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50">
          {ok ? "Signed in ✓" : busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {toast && (
        <div role={ok ? "status" : "alert"} className={`fixed right-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${ok ? "bg-black text-white ring-1 ring-white/30" : "border border-black bg-white text-black"}`}>
          {ok && <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-black">✓</span>}
          <span>{toast}</span>
          {!ok && <button onClick={() => setToast("")} aria-label="Dismiss" className="text-lg leading-none opacity-80 hover:opacity-100">×</button>}
        </div>
      )}
    </main>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}