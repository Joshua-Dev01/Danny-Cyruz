"use client";
import { useState } from "react";
import { services, DEPOSIT_NGN } from "@/lib/content";
import { createBooking, type BookingInput } from "@/app/book/actions";

const empty: BookingInput = { full_name: "", email: "", phone: "", service: "", package_name: "Standard", event_date: "", event_time: "", location: "", notes: "" };
const steps = ["Service", "Date & place", "Your details"];

export default function BookingForm({ initialService = "" }: { initialService?: string }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<BookingInput>({ ...empty, service: initialService });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof BookingInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV({ ...v, [k]: e.target.value });

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0 && !v.service) e.service = "Choose a service to continue.";
    if (s === 1) {
      if (!v.event_date) e.event_date = "Pick your preferred date.";
      if (!v.event_time) e.event_time = "Pick a preferred time.";
      if (!v.location.trim()) e.location = "Tell us where the shoot will happen.";
    }
    if (s === 2) {
      if (v.full_name.trim().length < 2) e.full_name = "Enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
      if (!/^[+\d][\d\s-]{8,}$/.test(v.phone.trim())) e.phone = "Enter a valid phone or WhatsApp number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate(2)) return;
    setBusy(true); setServerError("");
    const r = await createBooking(v);
    setBusy(false);
    if (r.ok) setDone(true); else setServerError(r.error);
  }

  if (done) {
    return (
      <div role="status" className="border border-stone-200 bg-white p-10 text-center">
        <h2 className="font-serif text-4xl">Request received</h2>
        <p className="mx-auto mt-4 max-w-md text-stone-600">
          Thank you, {v.full_name.split(" ")[0]}. To secure {v.event_date}, the next step is the ₦{DEPOSIT_NGN.toLocaleString()} deposit.
          We will confirm by email or WhatsApp.
        </p>
      </div>
    );
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);
  const cls = (k: string) => `field ${errors[k] ? "field-error" : ""}`;

  return (
    <div>
      <ol className="mb-10 flex gap-6 text-sm" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={i === step ? "border-b border-ink pb-2" : "pb-2 text-stone-400"}>{s}</li>
        ))}
      </ol>

      <div className="grid gap-6">
        {step === 0 && (
          <>
            <label>Service
              <select className={cls("service")} value={v.service} onChange={set("service")}>
                <option value="">Choose a service</option>
                {services.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
              </select>
              <Err k="service" />
            </label>
            <label>Package
              <select className="field" value={v.package_name} onChange={set("package_name")}>
                <option>Standard</option><option>Premium</option><option>Custom</option>
              </select>
            </label>
          </>
        )}
        {step === 1 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <label>Preferred date
                <input type="date" className={cls("event_date")} value={v.event_date} min={new Date().toISOString().split("T")[0]} onChange={set("event_date")} />
                <Err k="event_date" />
              </label>
              <label>Preferred time
                <input type="time" className={cls("event_time")} value={v.event_time} onChange={set("event_time")} />
                <Err k="event_time" />
              </label>
            </div>
            <label>Event location
              <input className={cls("location")} value={v.location} onChange={set("location")} placeholder="Venue or area" />
              <Err k="location" />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <label>Full name<input className={cls("full_name")} value={v.full_name} onChange={set("full_name")} autoComplete="name" /><Err k="full_name" /></label>
            <div className="grid gap-6 sm:grid-cols-2">
              <label>Email<input type="email" className={cls("email")} value={v.email} onChange={set("email")} autoComplete="email" /><Err k="email" /></label>
              <label>Phone or WhatsApp<input type="tel" className={cls("phone")} value={v.phone} onChange={set("phone")} autoComplete="tel" /><Err k="phone" /></label>
            </div>
            <label>Additional notes<textarea className="field min-h-28" value={v.notes} onChange={set("notes")} /></label>
            <p className="text-sm text-stone-600">A ₦{DEPOSIT_NGN.toLocaleString()} deposit secures your slot.</p>
          </>
        )}
        {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}
      </div>

      <div className="mt-10 flex gap-4">
        {step > 0 && <button type="button" className="btn-line" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 ? (
          <button type="button" className="btn-dark" onClick={() => validate(step) && setStep(step + 1)}>Continue</button>
        ) : (
          <button type="button" className="btn-dark" disabled={busy} onClick={submit}>{busy ? "Sending..." : "Submit Booking Request"}</button>
        )}
      </div>
    </div>
  );
}
