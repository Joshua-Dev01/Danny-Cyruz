"use client";
import { useState } from "react";
import { services } from "@/lib/content";
import { createEnquiry, type EnquiryInput } from "@/app/contact/actions";

const empty: EnquiryInput = { full_name: "", email: "", phone: "", service: "", target_date: "", message: "" };

export default function ContactForm() {
  const [v, setV] = useState<EnquiryInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof EnquiryInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV({ ...v, [k]: e.target.value });

  function validate() {
    const e: Record<string, string> = {};
    if (v.full_name.trim().length < 2) e.full_name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
    if (!/^[+\d][\d\s-]{8,}$/.test(v.phone.trim())) e.phone = "Enter a valid phone or WhatsApp number.";
    if (!v.service) e.service = "Choose a service.";
    if (v.message.trim().length < 5) e.message = "Tell us a little about your shoot.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerError("");
    const r = await createEnquiry(v);
    setBusy(false);
    if (r.ok) setDone(true);
    else setServerError(r.error);
  }

  if (done) {
    return (
      <div role="status" className="border border-ink/10 p-8 md:p-10">
        <h3 className="display text-3xl uppercase">Enquiry sent.</h3>
        <p className="mt-4 max-w-md text-sm text-stone-600">
          Thank you, {v.full_name.trim().split(" ")[0]}. I will reply by email or WhatsApp within 24 hours.
        </p>
      </div>
    );
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-red-700">{errors[k]}</p> : null);
  const cls = (k: string) => `field ${errors[k] ? "field-error" : ""}`;

  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600">Enquiry form</p>
        <p className="mt-2 text-sm text-stone-600">Tell me a little about your shoot. Fields marked * are required.</p>
      </div>

      <div>
        <label htmlFor="full_name">Full name *</label>
        <input id="full_name" className={cls("full_name")} value={v.full_name} onChange={set("full_name")} autoComplete="name" placeholder="e.g. Adebayo Davies" />
        <Err k="full_name" />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="email">Email *</label>
          <input id="email" type="email" className={cls("email")} value={v.email} onChange={set("email")} autoComplete="email" placeholder="name@domain.com" />
          <Err k="email" />
        </div>
        <div>
          <label htmlFor="phone">Phone / WhatsApp *</label>
          <input id="phone" type="tel" className={cls("phone")} value={v.phone} onChange={set("phone")} autoComplete="tel" placeholder="+234 …" />
          <Err k="phone" />
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="service">Service *</label>
          <select id="service" className={cls("service")} value={v.service} onChange={set("service")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
          <Err k="service" />
        </div>
        <div>
          <label htmlFor="target_date">Preferred date</label>
          <input id="target_date" type="date" className="field" value={v.target_date} onChange={set("target_date")} />
        </div>
      </div>

      <div>
        <label htmlFor="message">Message *</label>
        <textarea id="message" rows={4} className={cls("message")} value={v.message} onChange={set("message")} placeholder="Mood, number of people, location, anything I should know" />
        <Err k="message" />
      </div>

      {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={busy} className="btn-dark w-full sm:w-auto">
          {busy ? "Sending" : "Send enquiry"}
        </button>
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600">Reply within 24 hours</p>
      </div>
    </form>
  );
}