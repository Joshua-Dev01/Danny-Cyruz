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
  const [toast, setToast] = useState(params.get("reason") === "notadmin" ? "That account is not an admin" : "");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Shows a message in the top-right corner and hides it by itself after 4 seconds.
  const show = useCallback((text: string) => {
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
    router.replace("/admin");
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/40">DC</span>
          <div>
            <p className="text-base font-bold tracking-wide text-slate-900">DANNY CYRUZ</p>
            <p className="text-xs text-slate-500">Admin sign in</p>
          </div>
        </div>
        <input className={input} type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {toast && (
        <div role="alert" className="fixed right-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white shadow-xl">
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Dismiss" className="text-lg leading-none opacity-80 hover:opacity-100">×</button>
        </div>
      )}
    </main>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}