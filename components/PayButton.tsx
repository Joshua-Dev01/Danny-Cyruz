"use client";
import { useState } from "react";
import { Lock } from "lucide-react";
import { startPayment } from "@/app/book/actions";

export default function PayButton({ reference, label }: { reference: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setBusy(true);
    setError("");
    try {
      const r = await startPayment(reference);
      if (r.ok) { window.location.href = r.url; return; }
      setError(r.error);
    } catch {
      setError("We could not reach the server. Check your internet connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button type="button" onClick={go} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50">
        <Lock size={16} /> {busy ? "Opening payment…" : label}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}