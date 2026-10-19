"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Baby, Building2, Camera, Check, ChevronDown, Copy, MapPin, MessageCircle, Minus, PartyPopper, Plus, User, Users } from "lucide-react";
import { services, DEPOSIT_NGN, site } from "@/lib/content";
import { createBooking } from "@/app/book/actions";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import PayButton from "@/components/PayButton";

/* ------------------------------------------------------------------
   EDIT THESE. Placeholders to replace with Danny's real details.
------------------------------------------------------------------- */

// The one studio clients book "inside the studio".
const STUDIO = { name: "Lekki Phase 1 studio", note: "Lagos" }; // EDIT

// Event types clients can pick. "Other" lets them type their own.
const OCCASIONS = ["Wedding", "Birthday", "Other"]; // EDIT

// Events are priced per event, not per picture.
const EVENT_NAME = "Events";
const EVENT_PRICE_NOTE = "Event prices depend on the event and the coverage you need. We send your quote on WhatsApp after you book."; // EDIT

const MAX_PICTURES = 100;
const MAX_PEOPLE = 50;

// Shown under the outdoor address field.
const OUTDOOR_NOTE = "Travel costs for outdoor locations are agreed with you on WhatsApp before your date is confirmed."; // EDIT

// Days the studio is closed. 0 = Sunday ... 6 = Saturday. Example: [1] closes Mondays.
const CLOSED_WEEKDAYS: number[] = [];

// How many days ahead are shown as quick date buttons.
const QUICK_DAYS = 14;

// Start times offered (24h value, label)
const times = Array.from({ length: 12 }, (_, i) => {
  const h = 8 + i;
  const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
  return { value: `${String(h).padStart(2, "0")}:00`, label };
});

const terms = [
  { t: "Deposit", d: `The ₦${DEPOSIT_NGN.toLocaleString()} deposit is deducted from your final bill. It reserves your date and is not an extra fee.` },
  { t: "Rescheduling", d: "Sessions can be moved free of charge up to 48 hours before the start time. The deposit carries over to the new date." }, // EDIT
  { t: "Punctuality", d: "Please arrive on time. Late arrival shortens your session and does not move the end time." }, // EDIT
  { t: "Delivery", d: "Edited photos are delivered in a private online gallery within 7 to 14 days." }, // EDIT
];

/* ------------------------------------------------------------------ */

type Session = "studio" | "outdoor" | "";
type Kind = "portrait" | "event" | "rental" | "";

type Form = {
  kind: Kind;
  service: string;
  package_name: string;
  session: Session;
  address: string;
  occasion: string;
  occasion_other: string;
  pictures: string;
  event_date: string;
  event_time: string;
  people: number;
  full_name: string;
  email: string;
  phone: string;
  instagram: string;
  notes: string;
  terms: boolean;
};

const empty: Form = {
  kind: "", service: "", package_name: "", session: "", address: "", occasion: "", occasion_other: "", pictures: "", event_date: "", event_time: "", people: 1,
  full_name: "", email: "", phone: "", instagram: "", notes: "", terms: false,
};

const steps = [
  { name: "Choose", title: "What would you like to book?", hint: "Pick one. You can change it later." },
  { name: "Date & place", title: "When and where?", hint: "Choose a day, a time and the place." },
  { name: "Your details", title: "Almost done", hint: "So we can reach you to confirm." },
];
const LAST = steps.length - 1;

const money = (n: number) => `₦${n.toLocaleString()}`;
const cap = "text-xs font-semibold uppercase tracking-wider text-neutral-500";
const lbl = "mb-2 block text-sm font-medium normal-case tracking-normal text-ink";
const input = (bad?: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3.5 text-base normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-4 focus:ring-ink/10 ${bad ? "border-red-600" : "border-neutral-300"}`;

function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function prettyDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function prettyTime(value: string) {
  return times.find((t) => t.value === value)?.label ?? value;
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p role="alert" className="mt-2 text-sm text-red-700">{msg}</p> : null;
}

function Tick() {
  return (
    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
      <Check size={14} strokeWidth={3} />
    </span>
  );
}

function Modal({ children, onClose, labelledBy }: { children: React.ReactNode; onClose: () => void; labelledBy: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center">
        <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={(e) => e.stopPropagation()} className="zoom-in relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl md:p-9">
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg hover:bg-neutral-200">×</button>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BookingForm({ initialService = "" }: { initialService?: string }) {
  const initialSvc = services.find((s) => s.name === initialService);
  const initialKind: Kind = initialService === EVENT_NAME ? "event" : initialSvc ? (initialSvc.slug === "studio" ? "rental" : "portrait") : "";
  const [v, setV] = useState<Form>({
    ...empty,
    kind: initialKind,
    service: initialService,
    session: initialKind === "rental" ? "studio" : initialKind === "event" ? "outdoor" : "",
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [reference, setReference] = useState("");
  const [serverError, setServerError] = useState("");
  const [copied, setCopied] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const accessToken = useRef<string | null>(null);

  // If the client is signed in, fill in their name and email and link the booking to their account.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getBrowserSupabase().auth.getSession();
        const s = data.session;
        if (!active || !s) return;
        accessToken.current = s.access_token;
        const name = String(s.user.user_metadata?.full_name ?? s.user.user_metadata?.name ?? "");
        setV((p) => ({ ...p, full_name: p.full_name || name, email: p.email || (s.user.email ?? "") }));
      } catch { /* not signed in: book as a guest */ }
    })();
    return () => { active = false; };
  }, []);

  const portraitServices = services.filter((s) => s.slug !== "studio");
  const rentalService = services.find((s) => s.slug === "studio")!;
  const svc = services.find((s) => s.name === v.service);
  const pkg = svc?.packages.find((p) => p.title === v.package_name);
  const isEvent = v.kind === "event";
  const isRental = v.kind === "rental";
  const session: Session = isEvent ? "outdoor" : isRental ? "studio" : v.session;
  const locationText = session === "studio" ? `${STUDIO.name}, ${STUDIO.note}` : session === "outdoor" ? v.address.trim() : "";
  const included = pkg ? parseInt(pkg.title, 10) || 1 : 1;
  const picturesWanted = parseInt(v.pictures, 10);
  const occasionText = v.occasion === "Other" ? v.occasion_other.trim() : v.occasion;
  const price = pkg?.price ?? 0;
  // Extra pictures cost the same as the single-picture price of the chosen service (svc.from).
  const unit = v.kind === "portrait" ? svc?.from ?? 0 : 0;
  const wanted = v.kind === "portrait" && Number.isInteger(picturesWanted) && picturesWanted > included ? picturesWanted : included;
  const extraCount = wanted - included;
  const extraCost = extraCount * unit;
  const total = price + extraCost;
  const balance = Math.max(total - DEPOSIT_NGN, 0);
  const setPictures = (n: number) => set("pictures", n <= included ? "" : String(Math.min(n, MAX_PICTURES)));

  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toISO(d); })();
  const quickDates = Array.from({ length: QUICK_DAYS }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1 + i);
    return { iso: toISO(d), wd: d.toLocaleDateString("en-GB", { weekday: "short" }), day: d.getDate(), mon: d.toLocaleDateString("en-GB", { month: "short" }), closed: CLOSED_WEEKDAYS.includes(d.getDay()) };
  });

  const chooseKind = (k: Exclude<Kind, "">) => {
    setV((p) => ({
      ...p,
      kind: k,
      service: k === "event" ? EVENT_NAME : k === "rental" ? rentalService.name : portraitServices.some((s) => s.name === p.service) ? p.service : "",
      package_name: p.kind === k ? p.package_name : "",
      pictures: "",
      occasion: k === "event" ? p.occasion : "",
      occasion_other: k === "event" ? p.occasion_other : "",
      session: k === "rental" ? "studio" : k === "event" ? "outdoor" : "",
    }));
    setErrors({});
  };

  const set = <K extends keyof Form>(k: K, value: Form[K]) => {
    setV((prev) => ({ ...prev, [k]: value }));
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!v.kind) e.kind = "Please choose one option.";
      else if (v.kind === "event") {
        if (!v.occasion) e.occasion = "Choose the type of event.";
        else if (v.occasion === "Other" && v.occasion_other.trim().length < 2) e.occasion_other = "Tell us what the event is.";
      } else {
        if (!v.service) e.service = "Choose who the session is for.";
        else if (!v.package_name) e.package_name = "Choose a package to continue.";
        if (v.kind === "portrait" && v.pictures.trim() && !(Number.isInteger(picturesWanted) && picturesWanted > included && picturesWanted <= MAX_PICTURES)) {
          e.pictures = `Enter a number above ${included} (up to ${MAX_PICTURES}), or leave it empty.`;
        }
      }
    }
    if (s === 1) {
      if (!v.event_date) e.event_date = "Pick a date.";
      else if (v.event_date < tomorrow) e.event_date = "Pick a date from tomorrow onwards.";
      else if (CLOSED_WEEKDAYS.includes(new Date(`${v.event_date}T00:00:00`).getDay())) e.event_date = "We are closed on that day. Please pick another date.";
      if (!v.event_time) e.event_time = "Pick a start time.";
      if (!session) e.session = "Choose studio or outdoor.";
      if (session === "outdoor" && v.address.trim().length < 5) e.address = isEvent ? "Enter the venue and the area or city." : "Enter the place and the area or city.";
      if (!isEvent && (!Number.isInteger(v.people) || v.people < 1 || v.people > MAX_PEOPLE)) e.people = `Enter a group size between 1 and ${MAX_PEOPLE}.`;
    }
    if (s === 2) {
      if (v.full_name.trim().length < 2) e.full_name = "Enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
      if (!/^[+\d][\d\s-]{8,}$/.test(v.phone.trim())) e.phone = "Enter a valid phone or WhatsApp number.";
      if (!v.terms) e.terms = "Please tick the box to confirm.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const back = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)); };
  const goTo = (i: number) => { if (i < step) { setErrors({}); setStep(i); } };

  async function submit() {
    for (let s = 0; s <= LAST; s++) {
      if (!validate(s)) { setStep(s); return; }
    }
    setBusy(true);
    setServerError("");
    try {
      const r = await createBooking({
        full_name: v.full_name, email: v.email, phone: v.phone, instagram: v.instagram,
        service: v.service, package_name: isEvent ? "" : v.package_name, session_type: session === "outdoor" ? "outdoor" : "studio",
        people: isEvent ? 1 : v.people, event_type: isEvent ? occasionText : "", pictures: v.kind === "portrait" && v.pictures.trim() ? picturesWanted : null,
        event_date: v.event_date, event_time: v.event_time, location: locationText,
        notes: v.notes, terms: v.terms, access_token: accessToken.current,
      });
      if (r.ok && r.payUrl) { setRedirecting(true); window.location.href = r.payUrl; return; }
      if (r.ok) { setReference(r.reference); wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else { setServerError(r.error); setErrorOpen(true); }
    } catch {
      setServerError("We could not reach the server. Check your internet connection and try again.");
      setErrorOpen(true);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (step === LAST) { void submit(); return; }
    if (validate(step)) setStep(step + 1);
  }

  const waHelp = encodeURIComponent("Hello Danny, I need help with my booking.");

  /* ---------------- Saved, but payment page did not open ---------------- */
  if (reference) {
    return (
      <div ref={wizardRef} className="step-in mx-auto max-w-xl scroll-mt-24 rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white"><Check size={30} strokeWidth={3} /></div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">Request saved</h2>
        <p className="mt-2 text-neutral-600">Pay the {money(DEPOSIT_NGN)} deposit to hold your date.</p>

        <div className="mt-6 rounded-2xl bg-neutral-100 p-5">
          <p className={cap}>Your reference code</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-2xl font-semibold tracking-wider">{reference}</span>
            <button
              type="button"
              onClick={() => { void navigator.clipboard?.writeText(reference); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium shadow-sm hover:bg-neutral-50"
              aria-label="Copy reference code"
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </div>

        <div className="mt-8"><PayButton reference={reference} label={`Pay ${money(DEPOSIT_NGN)} deposit`} /></div>
        <p className="mt-4 text-sm text-neutral-500">Secure payment by Paystack. Card, bank transfer or USSD.</p>
        <a href={`${site.whatsapp}?text=${waHelp}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"><MessageCircle size={16} /> Need help? Chat with us</a>
      </div>
    );
  }

  /* ---------------- Wizard ---------------- */
  const card = (on: boolean) =>
    `relative block w-full rounded-2xl border-2 p-4 text-left transition md:p-5 ${on ? "border-ink bg-neutral-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-400"}`;
  const chip = (on: boolean) =>
    `rounded-full px-5 py-3 text-sm font-medium transition ${on ? "bg-ink text-white" : "border border-neutral-300 bg-white hover:border-ink"}`;
  const current = isEvent && step === 1 ? { ...steps[1], hint: "Choose a day, a time and the venue." } : steps[step];

  const kinds = [
    { k: "portrait", name: "Portraits", note: "Children, one year olds and adults", from: `From ${money(Math.min(...portraitServices.map((x) => x.from)))}`, Icon: Camera },
    { k: "event", name: "Events", note: "Weddings, birthdays and more", from: "Quote on WhatsApp", Icon: PartyPopper },
    { k: "rental", name: "Studio rental", note: "Hire our studio by the hour", from: `From ${money(rentalService.from)}`, Icon: Building2 },
  ] as const;

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <div ref={wizardRef} className="scroll-mt-24">
          {/* Progress */}
          <ol className="flex items-center" aria-label="Booking progress">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.name} className={`flex items-center ${i < LAST ? "flex-1" : ""}`}>
                  <button type="button" onClick={() => goTo(i)} disabled={!done} aria-current={active ? "step" : undefined} className="flex items-center gap-2.5 disabled:cursor-default">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${done || active ? "bg-ink text-white" : "bg-neutral-200 text-neutral-500"}`}>
                      {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={`hidden text-sm font-medium sm:block ${active ? "text-ink" : "text-neutral-500"}`}>{s.name}</span>
                  </button>
                  {i < LAST && <span className={`mx-3 h-0.5 flex-1 rounded transition-colors ${done ? "bg-ink" : "bg-neutral-200"}`} />}
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm font-medium text-neutral-500 sm:hidden">Step {step + 1} of {steps.length}: {current.name}</p>

          <form key={step} onSubmit={onSubmit} noValidate className="step-in mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-9">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{current.title}</h2>
            <p className="mt-1.5 text-neutral-600">{current.hint}</p>

            <div className="mt-7">
              {/* ---------- STEP 1 ---------- */}
              {step === 0 && (
                <>
                  <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="What are you booking">
                    {kinds.map(({ k, name, note, from, Icon }) => (
                      <button key={k} type="button" role="radio" aria-checked={v.kind === k} onClick={() => chooseKind(k)} className={card(v.kind === k)}>
                        {v.kind === k && <Tick />}
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white"><Icon size={22} /></span>
                        <span className="mt-4 block text-lg font-semibold">{name}</span>
                        <span className="mt-1 block text-sm text-neutral-600">{note}</span>
                        <span className="mt-3 block text-sm font-medium">{from}</span>
                      </button>
                    ))}
                  </div>
                  <Err msg={errors.kind} />

                  {v.kind === "portrait" && (
                    <div className="mt-8">
                      <p className="mb-3 text-sm font-medium">Who is it for?</p>
                      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Portrait type">
                        {portraitServices.map((x) => (
                          <button key={x.slug} type="button" role="radio" aria-checked={v.service === x.name} onClick={() => { setV((p) => ({ ...p, service: x.name, package_name: "", pictures: "" })); setErrors({}); }} className={card(v.service === x.name)}>
                            {v.service === x.name && <Tick />}
                            <span className="text-neutral-700">{x.slug === "adults" ? <User size={20} /> : x.slug === "children" ? <Users size={20} /> : <Baby size={20} />}</span>
                            <span className="mt-2 block font-semibold">{x.name}</span>
                            <span className="mt-0.5 block text-sm text-neutral-600">{x.subtitle}</span>
                          </button>
                        ))}
                      </div>
                      <Err msg={errors.service} />
                    </div>
                  )}

                  {(v.kind === "portrait" || v.kind === "rental") && svc && (
                    <div className="mt-8">
                      <p className="mb-3 text-sm font-medium">{v.kind === "rental" ? "How long do you need the studio?" : "Choose a package"}</p>
                      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Package">
                        {svc.packages.map((p) => (
                          <button key={p.title} type="button" role="radio" aria-checked={v.package_name === p.title} onClick={() => set("package_name", p.title)} className={card(v.package_name === p.title)}>
                            {v.package_name === p.title && <Tick />}
                            <span className="block pr-8 font-semibold">{p.title}</span>
                            <span className="mt-1 block text-2xl font-semibold tracking-tight">{money(p.price)}</span>
                            <span className="mt-2 block text-sm text-neutral-600">{p.detail}</span>
                          </button>
                        ))}
                      </div>
                      <Err msg={errors.package_name} />
                    </div>
                  )}

                  {v.kind === "portrait" && pkg && (
                    <div className="mt-8">
                      <p className="mb-3 text-sm font-medium">How many pictures do you want?</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="inline-flex items-center gap-3 rounded-full border border-neutral-300 p-1.5">
                          <button type="button" aria-label="Fewer pictures" onClick={() => setPictures(wanted - 1)} disabled={wanted <= included} className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"><Minus size={18} /></button>
                          <input aria-label="Total pictures" type="number" inputMode="numeric" min={included} max={MAX_PICTURES} value={wanted} onChange={(e) => { const n = parseInt(e.target.value, 10); setPictures(Number.isNaN(n) ? included : n); }} className="w-14 bg-transparent text-center text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                          <button type="button" aria-label="More pictures" onClick={() => setPictures(wanted + 1)} disabled={wanted >= MAX_PICTURES} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-neutral-700 disabled:opacity-40"><Plus size={18} /></button>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {extraCount > 0 ? `${included} included + ${extraCount} extra × ${money(unit)}` : `${included} included in this package. Add more if you need them.`}
                        </p>
                      </div>
                      <Err msg={errors.pictures} />
                    </div>
                  )}

                  {pkg && (
                    <div className="mt-8 rounded-2xl bg-neutral-100 p-5 text-sm">
                      <dl className="space-y-2">
                        <div className="flex justify-between"><dt className="text-neutral-600">{v.package_name}</dt><dd className="font-medium">{money(price)}</dd></div>
                        {extraCount > 0 && <div className="flex justify-between"><dt className="text-neutral-600">{extraCount} extra {extraCount === 1 ? "picture" : "pictures"} × {money(unit)}</dt><dd className="font-medium">{money(extraCost)}</dd></div>}
                        <div className="flex justify-between border-t border-neutral-300 pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold">{money(total)}</dd></div>
                        <div className="flex justify-between text-neutral-600"><dt>Deposit now</dt><dd>{money(DEPOSIT_NGN)}</dd></div>
                        <div className="flex justify-between text-neutral-600"><dt>Balance on the day</dt><dd>{money(balance)}</dd></div>
                      </dl>
                    </div>
                  )}

                  {isEvent && (
                    <div className="mt-8">
                      <p className="mb-3 text-sm font-medium">What kind of event?</p>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type of event">
                        {OCCASIONS.map((o) => (
                          <button key={o} type="button" role="radio" aria-checked={v.occasion === o} onClick={() => set("occasion", o)} className={chip(v.occasion === o)}>{o}</button>
                        ))}
                      </div>
                      <Err msg={errors.occasion} />
                      {v.occasion === "Other" && (
                        <div className="mt-4 max-w-xs">
                          <label htmlFor="occasion_other" className={lbl}>What is the event?</label>
                          <input id="occasion_other" className={input(!!errors.occasion_other)} value={v.occasion_other} maxLength={60} onChange={(e) => set("occasion_other", e.target.value)} placeholder="e.g. Graduation" autoFocus />
                          <Err msg={errors.occasion_other} />
                        </div>
                      )}
                      <p className="mt-5 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600">{EVENT_PRICE_NOTE}</p>
                    </div>
                  )}
                </>
              )}

              {/* ---------- STEP 2 ---------- */}
              {step === 1 && (
                <div className="space-y-9">
                  {/* Date */}
                  <div>
                    <p className="mb-3 text-sm font-medium">Pick a day</p>
                    <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" role="radiogroup" aria-label="Date">
                      {quickDates.map((d) => {
                        const on = v.event_date === d.iso;
                        return (
                          <button key={d.iso} type="button" role="radio" aria-checked={on} disabled={d.closed} onClick={() => set("event_date", d.iso)}
                            className={`flex w-[4.25rem] shrink-0 flex-col items-center rounded-2xl border-2 py-3 transition disabled:cursor-not-allowed disabled:opacity-35 ${on ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white hover:border-neutral-400"}`}>
                            <span className="text-xs uppercase tracking-wide opacity-70">{d.wd}</span>
                            <span className="text-2xl font-semibold leading-tight">{d.day}</span>
                            <span className="text-xs opacity-70">{d.mon}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label htmlFor="event_date" className="mb-0 text-sm font-normal normal-case tracking-normal text-neutral-600">Another date?</label>
                      <input id="event_date" type="date" min={tomorrow} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm normal-case tracking-normal outline-none focus:border-ink" value={v.event_date} onChange={(e) => set("event_date", e.target.value)} />
                    </div>
                    <Err msg={errors.event_date} />
                  </div>

                  {/* Time */}
                  <div>
                    <p className="mb-3 text-sm font-medium">Start time</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Start time">
                      {times.map((t) => {
                        const on = v.event_time === t.value;
                        return (
                          <button key={t.value} type="button" role="radio" aria-checked={on} onClick={() => set("event_time", t.value)}
                            className={`rounded-xl border-2 py-3 text-sm font-medium transition ${on ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white hover:border-neutral-400"}`}>
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                    <Err msg={errors.event_time} />
                  </div>

                  {/* Place */}
                  <div>
                    <p className="mb-3 text-sm font-medium">{isEvent ? "Where is the event?" : "Where should we shoot?"}</p>
                    {isRental ? (
                      <div className="flex items-start gap-3 rounded-2xl bg-neutral-100 p-4 text-sm">
                        <MapPin size={18} className="mt-0.5 shrink-0" /> <span>Studio rental happens inside our studio, {STUDIO.name}, {STUDIO.note}.</span>
                      </div>
                    ) : !isEvent ? (
                      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Session type">
                        {([
                          { s: "studio", name: "In the studio", note: "Backdrops and lighting, all set up for you." },
                          { s: "outdoor", name: "Outdoor", note: "A park, venue, home or place you choose." },
                        ] as const).map((o) => (
                          <button key={o.s} type="button" role="radio" aria-checked={session === o.s} onClick={() => set("session", o.s)} className={card(session === o.s)}>
                            {session === o.s && <Tick />}
                            <span className="block pr-8 font-semibold">{o.name}</span>
                            <span className="mt-1 block text-sm text-neutral-600">{o.note}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <Err msg={errors.session} />
                    {session === "outdoor" && (
                      <div className="mt-4">
                        <label htmlFor="address" className={lbl}>{isEvent ? "Venue and area" : "Place and area"}</label>
                        <input id="address" className={input(!!errors.address)} value={v.address} onChange={(e) => set("address", e.target.value)} placeholder={isEvent ? "e.g. Eko Hotel, Victoria Island" : "e.g. Landmark Beach, Victoria Island"} />
                        <Err msg={errors.address} />
                        <p className="mt-2 text-sm text-neutral-600">{isEvent ? "Travel costs for events outside Lagos are included in your quote." : OUTDOOR_NOTE}</p>
                      </div>
                    )}
                  </div>

                  {/* People */}
                  {!isEvent && (
                    <div>
                      <p className="mb-3 text-sm font-medium">How many people?</p>
                      <div className="inline-flex items-center gap-4 rounded-full border border-neutral-300 p-1.5">
                        <button type="button" aria-label="Fewer people" onClick={() => set("people", Math.max(1, v.people - 1))} disabled={v.people <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"><Minus size={18} /></button>
                        <span className="w-8 text-center text-lg font-semibold" aria-live="polite">{v.people}</span>
                        <button type="button" aria-label="More people" onClick={() => set("people", Math.min(MAX_PEOPLE, v.people + 1))} disabled={v.people >= MAX_PEOPLE} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-neutral-700 disabled:opacity-40"><Plus size={18} /></button>
                      </div>
                      <Err msg={errors.people} />
                      {v.people >= 3 && <p className="mt-2 text-sm text-neutral-600">Larger groups may affect the price. We confirm with you on WhatsApp.</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ---------- STEP 3 ---------- */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="full_name" className={lbl}>Full name</label>
                    <input id="full_name" autoComplete="name" autoFocus className={input(!!errors.full_name)} value={v.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. Oluwaseun Adeleke" />
                    <Err msg={errors.full_name} />
                  </div>
                  <div>
                    <label htmlFor="phone" className={lbl}>Phone / WhatsApp</label>
                    <input id="phone" type="tel" autoComplete="tel" inputMode="tel" className={input(!!errors.phone)} value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 …" />
                    <Err msg={errors.phone} />
                  </div>
                  <div>
                    <label htmlFor="email" className={lbl}>Email</label>
                    <input id="email" type="email" autoComplete="email" className={input(!!errors.email)} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="name@email.com" />
                    <Err msg={errors.email} />
                  </div>

                  <div>
                    <button type="button" onClick={() => setMoreInfo((m) => !m)} aria-expanded={moreInfo} className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink">
                      Add a note or Instagram <span className="text-neutral-400">(optional)</span> <ChevronDown size={16} className={`transition ${moreInfo ? "rotate-180" : ""}`} />
                    </button>
                    {moreInfo && (
                      <div className="fade-in mt-4 space-y-5">
                        <div>
                          <label htmlFor="instagram" className={lbl}>Instagram</label>
                          <input id="instagram" className={input()} value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourhandle" />
                        </div>
                        <div>
                          <label htmlFor="notes" className={lbl}>Anything we should know?</label>
                          <textarea id="notes" rows={3} className={input()} value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Mood, outfits, references…" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deposit + terms */}
                  <div className="rounded-2xl bg-neutral-100 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">Deposit to hold your date</p>
                        <p className="text-sm text-neutral-600">Part of your price, not an extra fee. Paid securely with Paystack on the next screen.</p>
                      </div>
                      <p className="text-2xl font-semibold">{money(DEPOSIT_NGN)}</p>
                    </div>
                    {!isEvent && pkg && (
                      <p className="mt-3 border-t border-neutral-300 pt-3 text-sm text-neutral-600">Total {money(total)} · Balance on the day {money(balance)}</p>
                    )}
                    <label htmlFor="terms" className="mt-5 flex cursor-pointer items-start gap-3 text-sm normal-case tracking-normal text-ink">
                      <input id="terms" type="checkbox" checked={v.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-black" />
                      <span>I agree to the studio terms and the {money(DEPOSIT_NGN)} deposit.</span>
                    </label>
                    <Err msg={errors.terms} />
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer font-medium text-neutral-600 hover:text-ink">Read the terms</summary>
                      <ul className="mt-3 space-y-2 text-neutral-600">
                        {terms.map((t) => (<li key={t.t}><strong className="font-medium text-ink">{t.t}.</strong> {t.d}</li>))}
                      </ul>
                    </details>
                  </div>
                </div>
              )}
            </div>

            {/* Back / Next */}
            <div className="sticky bottom-0 -mx-5 mt-9 flex items-center justify-between gap-3 border-t border-neutral-200 bg-white/90 px-5 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              {step > 0 ? (
                <button type="button" onClick={back} className="flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-ink"><ArrowLeft size={16} /> Back</button>
              ) : <span />}
              <button type="submit" disabled={busy || redirecting} className="flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50">
                {step === LAST ? (busy || redirecting ? "Opening payment…" : `Pay ${money(DEPOSIT_NGN)} deposit`) : "Continue"} {step !== LAST && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>

      </div>

      {errorOpen && (
        <Modal onClose={() => setErrorOpen(false)} labelledBy="error-title">
          <h2 id="error-title" className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
          <p role="alert" className="mt-3 text-neutral-600">{serverError}</p>
          <p className="mt-2 text-sm text-neutral-500">Your details are still here, nothing is lost.</p>
          <div className="mt-7 flex flex-col gap-3">
            <button type="button" onClick={() => setErrorOpen(false)} className="rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-700">Try again</button>
            <a href={`${site.whatsapp}?text=${waHelp}`} className="rounded-full border border-neutral-300 px-6 py-3.5 text-center text-sm font-semibold hover:bg-neutral-100">Chat on WhatsApp</a>
          </div>
        </Modal>
      )}
    </>
  );
}