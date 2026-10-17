"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { services, DEPOSIT_NGN, site } from "@/lib/content";
import { createBooking } from "@/app/book/actions";
import { getBrowserSupabase } from "@/lib/supabase-browser";

/* ------------------------------------------------------------------
   EDIT THESE. Placeholders to replace with Danny's real details.
------------------------------------------------------------------- */

// The one studio clients book "inside the studio".
const STUDIO = { name: "Lekki Phase 1 studio", note: "Lagos" }; // EDIT

// Event types clients can pick. "Other" lets them type their own.
const OCCASIONS = ["Wedding", "Birthday", "Other"]; // EDIT

// Events are priced per event, not per picture. Shown instead of a price.
const EVENT_NAME = "Events";
const EVENT_PRICE_NOTE = "Event prices depend on the event, the hours and the coverage you need. We send your quote on WhatsApp after you book."; // EDIT

// Largest number of pictures a client can ask for.
const MAX_PICTURES = 100;

// Largest group size accepted (the server allows up to 50).
const MAX_PEOPLE = 50;

// Shown under the outdoor address field.
const OUTDOOR_NOTE = "Travel costs for outdoor locations are agreed with you on WhatsApp before your date is confirmed."; // EDIT

// Days the studio is closed. 0 = Sunday ... 6 = Saturday. Example: [1] closes Mondays.
const CLOSED_WEEKDAYS: number[] = [];

// Start times offered (24h value, label)
const times = Array.from({ length: 12 }, (_, i) => {
  const h = 8 + i;
  const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
  return { value: `${String(h).padStart(2, "0")}:00`, label };
});

// Bank details shown after booking. Leave accountNumber empty to show
// "we will send payment details on WhatsApp" instead.
const PAYMENT = { bank: "", accountName: "", accountNumber: "" }; // EDIT

const terms = [
  { t: "Commitment deposit", d: `The ₦${DEPOSIT_NGN.toLocaleString()} deposit is deducted from your final bill. It reserves your date and is not an extra fee.` },
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
  { name: "Service", title: "What are you booking?", hint: "Pick studio portraits, an event, or the studio space." },
  { name: "Session type", title: "Studio or outdoor?", hint: "Where would you like your session to happen?" },
  { name: "Date & time", title: "Pick a date and time", hint: "Choose the day and start time that suit you." },
  { name: "Your details", title: "Your details", hint: "So we can confirm your booking." },
  { name: "Review", title: "Review & confirm", hint: "Check everything, then confirm." },
];
const LAST = steps.length - 1;

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";
const money = (n: number) => `₦${n.toLocaleString()}`;

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
  return msg ? <p role="alert" className="mt-2 text-xs text-red-700">{msg}</p> : null;
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
    <div className="fade-in fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          onClick={(e) => e.stopPropagation()}
          className="zoom-in relative w-full max-w-xl border border-ink bg-white p-6 md:p-10"
        >
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-ink/20 text-lg hover:bg-ink hover:text-white">
            ×
          </button>
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
  const [modal, setModal] = useState<"success" | "error" | null>(null);
  const [reference, setReference] = useState("");
  const [serverError, setServerError] = useState("");
  const [toast, setToast] = useState("");
  const [morePeople, setMorePeople] = useState(false);
  const [peopleText, setPeopleText] = useState("4");
  const wizardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const accessToken = useRef<string | null>(null);

  // If the client is signed in, fill in their name and email and link the booking to their account.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getBrowserSupabase().auth.getSession();
        const session = data.session;
        if (!active || !session) return;
        accessToken.current = session.access_token;
        const name = String(session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? "");
        setV((p) => ({ ...p, full_name: p.full_name || name, email: p.email || (session.user.email ?? "") }));
      } catch { /* not signed in: book as a guest */ }
    })();
    return () => { active = false; };
  }, []);

  const portraitServices = services.filter((s) => s.slug !== "studio");
  const rentalService = services.find((s) => s.slug === "studio")!;
  const svc = services.find((s) => s.name === v.service);
  const pkg = svc?.packages.find((p) => p.title === v.package_name);
  const isEvent = v.kind === "event";
  const isStudioService = v.kind === "rental";
  const session: Session = isEvent ? "outdoor" : isStudioService ? "studio" : v.session;
  const locationText =
    session === "studio" ? `${STUDIO.name}, ${STUDIO.note}` : session === "outdoor" ? v.address.trim() : "";
  const included = pkg ? parseInt(pkg.title, 10) || 1 : 1;
  const picturesWanted = parseInt(v.pictures, 10);
  const occasionText = v.occasion === "Other" ? v.occasion_other.trim() : v.occasion;
  const sessionLabel = isEvent ? "At your event venue" : session === "studio" ? "Inside the studio" : session === "outdoor" ? "Outdoor" : "";
  const price = pkg?.price ?? 0;
  const balance = Math.max(price - DEPOSIT_NGN, 0);
  const packageLabel = isEvent ? "Price quoted after booking" : v.package_name;
  const balanceText = isEvent ? "After your quote" : pkg ? money(balance) : "—";
  const priceText = isEvent ? "Quoted on WhatsApp" : pkg ? money(price) : "—";

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
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toISO(d); })();

  const set = <K extends keyof Form>(k: K, value: Form[K]) => {
    setV((prev) => ({ ...prev, [k]: value }));
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  // Bring the new step into view
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!v.kind) e.kind = "Choose what you are booking.";
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
      if (!session) e.session = "Choose studio or outdoor.";
      if (session === "outdoor" && v.address.trim().length < 5) e.address = isEvent ? "Enter the event venue, and the area or city." : "Enter the venue or place, and the area or city.";
    }
    if (s === 2) {
      if (!v.event_date) e.event_date = "Pick your preferred date.";
      else if (v.event_date < tomorrow) e.event_date = "Pick a date from tomorrow onwards.";
      else if (CLOSED_WEEKDAYS.includes(new Date(`${v.event_date}T00:00:00`).getDay())) e.event_date = "We are closed on that day. Please pick another date.";
      if (!v.event_time) e.event_time = "Pick a start time.";
      if (!isEvent && (!Number.isInteger(v.people) || v.people < 1 || v.people > MAX_PEOPLE)) e.people = `Enter a group size between 1 and ${MAX_PEOPLE}.`;
    }
    if (s === 3) {
      if (v.full_name.trim().length < 2) e.full_name = "Enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
      if (!/^[+\d][\d\s-]{8,}$/.test(v.phone.trim())) e.phone = "Enter a valid phone or WhatsApp number.";
    }
    if (s === 4) {
      if (!v.terms) e.terms = "Please accept the terms to confirm your booking.";
    }
    setErrors(e);
    const n = Object.keys(e).length;
    if (n) setToast(n === 1 ? "One detail needs your attention." : `${n} details need your attention.`);
    return n === 0;
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
        people: isEvent ? 1 : v.people, event_type: isEvent ? occasionText : "", pictures: v.kind === "portrait" && v.pictures.trim() ? picturesWanted : null, event_date: v.event_date, event_time: v.event_time, location: locationText,
        notes: v.notes, terms: v.terms, access_token: accessToken.current,
      });
      if (r.ok) { setReference(r.reference); setModal("success"); }
      else { setServerError(r.error); setModal("error"); }
    } catch {
      setServerError("We could not reach the server. Check your internet connection and try again.");
      setModal("error");
    } finally {
      setBusy(false);
    }
  }

  // Enter key and the Continue button both come through here
  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (step === LAST) { void submit(); return; }
    if (validate(step)) setStep(step + 1);
  }

  const waText = encodeURIComponent(
    `Hello Danny, I just requested booking ${reference} (${isEvent ? `${occasionText} event` : `${v.service}, ${v.package_name}`}) for ${prettyDate(v.event_date)} at ${prettyTime(v.event_time)}. I am sending my ${money(DEPOSIT_NGN)} deposit receipt.`
  );
  const waHelp = encodeURIComponent("Hello Danny, I need help with my booking.");

  const summaryRows: [string, string][] = [
    ["Service", v.service],
    ...(isEvent ? ([["Event", occasionText]] as [string, string][]) : []),
    ["Package", packageLabel],
    ...(v.kind === "portrait" && v.pictures.trim() && Number.isInteger(picturesWanted) ? ([["Pictures", String(picturesWanted)]] as [string, string][]) : []),
    ["Session", sessionLabel],
    ["Location", locationText],
    ["Date", prettyDate(v.event_date)],
    ["Start time", v.event_time ? prettyTime(v.event_time) : ""],
    ...(v.kind && !isEvent ? ([["People", String(v.people)]] as [string, string][]) : []),
  ];

  function SuccessModal() {
    return (
      <Modal onClose={() => setModal(null)} labelledBy="success-title">
        <div className="flex items-center justify-between gap-4 pr-10">
          <p className={label}>Reservation dispatch notice</p>
          <span className="bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white">Awaiting deposit</span>
        </div>
        <h2 id="success-title" className="display mt-4 text-3xl uppercase md:text-4xl">Booking request received.</h2>
        <p className="mt-3 text-sm">Reference code: <strong>{reference}</strong></p>

        <dl className="mt-6 divide-y divide-ink/10 border border-ink/10 bg-stone-100 text-sm">
          {summaryRows.filter(([, val]) => val).map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className={label}>{k}</dt>
              <dd className="text-right">{val}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className={label}>Deposit due now</dt>
            <dd className="font-medium">{money(DEPOSIT_NGN)}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className={label}>Balance on the day</dt>
            <dd>{isEvent ? "After your quote" : money(balance)}</dd>
          </div>
        </dl>

        <div className="mt-6 border border-ink/10 p-4 text-sm">
          <p className={label}>How to pay the deposit</p>
          {PAYMENT.accountNumber ? (
            <dl className="mt-3 space-y-1">
              <div className="flex justify-between gap-4"><dt className="text-stone-600">Bank</dt><dd>{PAYMENT.bank}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-stone-600">Account name</dt><dd>{PAYMENT.accountName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-stone-600">Account number</dt><dd>{PAYMENT.accountNumber}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-stone-600">Narration</dt><dd>{reference}</dd></div>
            </dl>
          ) : (
            <p className="mt-2 text-stone-600">We will send the payment details to you on WhatsApp or email shortly.</p>
          )}
          <p className="mt-3 text-xs text-stone-600">After paying, send your receipt on WhatsApp with your reference code.</p>
        </div>

        <p className="mt-5 text-xs text-stone-600">We will confirm on WhatsApp or email within 24 hours.</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={`${site.whatsapp}?text=${waText}`} className="btn-dark flex-1">Send receipt on WhatsApp</a>
          <Link href="/" className="btn flex-1 border border-ink hover:bg-ink hover:text-white">Back to home</Link>
        </div>
      </Modal>
    );
  }

  /* ---------------- Confirmation (after booking) ---------------- */
  if (reference) {
    return (
      <>
        <div role="status" className="border border-ink/10 p-8 md:p-12">
          <p className={label}>Reservation dispatch notice</p>
          <h2 className="display mt-4 text-3xl uppercase md:text-5xl">Booking request received.</h2>
          <p className="mt-4 text-sm">Reference code: <strong>{reference}</strong></p>
          <p className="mt-4 max-w-md text-sm text-stone-600">
            Your date is not confirmed until the {money(DEPOSIT_NGN)} deposit is paid. Keep your reference code safe.
          </p>
          <button type="button" onClick={() => setModal("success")} className="btn-dark mt-8">View payment details</button>
        </div>
        {modal === "success" && <SuccessModal />}
      </>
    );
  }

  /* ---------------- Wizard ---------------- */
  const optionCls = (on: boolean) =>
    `block w-full border p-4 text-left transition-colors md:p-5 ${on ? "border-ink bg-white outline outline-1 outline-ink" : "border-ink/15 hover:border-ink/50"}`;
  const current =
    isEvent && step === 1
      ? { name: "Session type", title: "Where is the event?", hint: "Tell us the venue and the area or city." }
      : steps[step];

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div ref={wizardRef} className="scroll-mt-24">
          {/* Progress */}
          <div>
            <div className="flex items-baseline justify-between">
              <p className={label}>Step {step + 1} of {steps.length}</p>
              <p className="text-xs font-medium uppercase tracking-wide">{current.name}</p>
            </div>
            <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} aria-label="Booking progress">
              {steps.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={i >= step}
                  aria-label={`${s.name}${i < step ? " (completed, go back)" : ""}`}
                  className={`h-1 flex-1 transition-colors ${i <= step ? "bg-ink" : "bg-ink/10"} ${i < step ? "cursor-pointer hover:bg-stone-600" : "cursor-default"}`}
                />
              ))}
            </div>
            <ol className="mt-3 hidden justify-between md:flex">
              {steps.map((s, i) => (
                <li key={s.name} className={`text-[10px] uppercase tracking-[0.14em] ${i === step ? "font-medium text-ink" : i < step ? "text-stone-600" : "text-stone-400"}`}>
                  {i < step ? "✓ " : ""}{s.name}
                </li>
              ))}
            </ol>
          </div>

          {/* Current step only */}
          <form key={step} onSubmit={onSubmit} noValidate className="step-in mt-8 border border-ink/10 p-5 md:p-10">
            <h2 className="display text-3xl uppercase md:text-4xl">{current.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{current.hint}</p>

            <div className="mt-8">
              {/* 1. What are you booking */}
              {step === 0 && (
                <>
                  <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="What are you booking">
                    {([
                      { k: "portrait", name: "Studio portraits", note: "Children, one year old and adults. Priced by number of pictures.", from: `From ${money(Math.min(...portraitServices.map((x) => x.from)))}` },
                      { k: "event", name: "Events", note: "Weddings, birthdays and other occasions. Priced per event.", from: "Price quoted for your event" },
                      { k: "rental", name: "Studio rental", note: "Hire our studio space by the hour.", from: `From ${money(rentalService.from)}` },
                    ] as const).map((o) => (
                      <button key={o.k} type="button" role="radio" aria-checked={v.kind === o.k} onClick={() => chooseKind(o.k)} className={optionCls(v.kind === o.k)}>
                        <span className="block text-sm font-medium uppercase tracking-wide">{o.name}</span>
                        <span className="mt-1 block text-xs text-stone-600">{o.note}</span>
                        <span className={`mt-4 block ${label}`}>{o.from}</span>
                      </button>
                    ))}
                  </div>
                  <Err msg={errors.kind} />

                  {v.kind === "portrait" && (
                    <div className="mt-8">
                      <p className={label}>Who is the session for?</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Portrait type">
                        {portraitServices.map((x) => (
                          <button
                            key={x.slug}
                            type="button"
                            role="radio"
                            aria-checked={v.service === x.name}
                            onClick={() => { setV((p) => ({ ...p, service: x.name, package_name: "", pictures: "" })); setErrors({}); }}
                            className={optionCls(v.service === x.name)}
                          >
                            <span className="block text-sm font-medium uppercase tracking-wide">{x.name}</span>
                            <span className="mt-1 block text-xs text-stone-600">{x.subtitle}</span>
                            <span className={`mt-4 block ${label}`}>From {money(x.from)}</span>
                          </button>
                        ))}
                      </div>
                      <Err msg={errors.service} />
                    </div>
                  )}

                  {(v.kind === "portrait" || v.kind === "rental") && svc && (
                    <div className="mt-8">
                      <p className={label}>Package for {svc.name}</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Package">
                        {svc.packages.map((p) => (
                          <button key={p.title} type="button" role="radio" aria-checked={v.package_name === p.title} onClick={() => set("package_name", p.title)} className={optionCls(v.package_name === p.title)}>
                            <span className={`block ${label}`}>{p.tag}</span>
                            <span className="mt-2 block text-sm font-medium uppercase tracking-wide">{p.title}</span>
                            <span className="mt-1 block text-2xl font-medium">{money(p.price)}</span>
                            <span className="mt-2 block text-xs text-stone-600">{p.detail}</span>
                            <span className={`mt-3 block ${label}`}>Deposit {money(DEPOSIT_NGN)} • Balance {money(Math.max(p.price - DEPOSIT_NGN, 0))}</span>
                          </button>
                        ))}
                      </div>
                      <Err msg={errors.package_name} />
                    </div>
                  )}

                  {v.kind === "portrait" && pkg && (
                    <div className="mt-8 max-w-xs">
                      <label htmlFor="pictures">Need more than {included === 1 ? "1 picture" : `${included} pictures`}? (optional)</label>
                      <input id="pictures" type="number" inputMode="numeric" min={included + 1} max={MAX_PICTURES} className={`field ${errors.pictures ? "field-error" : ""}`} value={v.pictures} onChange={(e) => set("pictures", e.target.value)} placeholder="Total number of pictures" />
                      <Err msg={errors.pictures} />
                      <p className="mt-2 text-xs text-stone-600">Extra pictures are priced separately. We will confirm the price with you on WhatsApp.</p>
                    </div>
                  )}

                  {isEvent && (
                    <div className="mt-8">
                      <p className={label}>What type of event is it? *</p>
                      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Type of event">
                        {OCCASIONS.map((o) => (
                          <button key={o} type="button" role="radio" aria-checked={v.occasion === o} onClick={() => set("occasion", o)} className={`px-5 py-3 text-[11px] uppercase tracking-[0.14em] ${v.occasion === o ? "bg-ink text-white" : "border border-ink/20 hover:border-ink"}`}>
                            {o}
                          </button>
                        ))}
                      </div>
                      <Err msg={errors.occasion} />
                      {v.occasion === "Other" && (
                        <div className="mt-4 max-w-xs">
                          <label htmlFor="occasion_other">What is the event? *</label>
                          <input id="occasion_other" className={`field ${errors.occasion_other ? "field-error" : ""}`} value={v.occasion_other} maxLength={60} onChange={(e) => set("occasion_other", e.target.value)} placeholder="e.g. Graduation" autoFocus />
                          <Err msg={errors.occasion_other} />
                        </div>
                      )}
                      <p className="mt-5 border border-ink/10 bg-stone-100 p-4 text-xs leading-relaxed text-stone-600">
                        {EVENT_PRICE_NOTE} Your {money(DEPOSIT_NGN)} deposit holds the date and is deducted from your final bill.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* 2. Studio or outdoor */}
              {step === 1 && (
                <>
                  {isEvent ? (
                    <p className="border border-ink/10 bg-stone-100 p-4 text-sm text-stone-600">Events take place at your venue. Tell us where below.</p>
                  ) : isStudioService ? (
                    <p className="border border-ink/10 bg-stone-100 p-4 text-sm text-stone-600">Studio rental takes place inside our studio.</p>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Session type">
                        <button type="button" role="radio" aria-checked={session === "studio"} onClick={() => { set("session", "studio"); }} className={optionCls(session === "studio")}>
                          <span className="block text-sm font-medium uppercase tracking-wide">Inside the studio</span>
                          <span className="mt-1 block text-xs text-stone-600">Controlled daylight, backdrops and lighting in our studio.</span>
                        </button>
                        <button type="button" role="radio" aria-checked={session === "outdoor"} onClick={() => { set("session", "outdoor"); }} className={optionCls(session === "outdoor")}>
                          <span className="block text-sm font-medium uppercase tracking-wide">Outdoor</span>
                          <span className="mt-1 block text-xs text-stone-600">At a park, venue, home or location of your choice.</span>
                        </button>
                      </div>
                      <Err msg={errors.session} />
                    </>
                  )}

                  {session === "outdoor" && (
                    <div className="mt-8">
                      <label htmlFor="address">{isEvent ? "Event venue *" : "Outdoor location *"}</label>
                      <input id="address" className={`field ${errors.address ? "field-error" : ""}`} value={v.address} onChange={(e) => set("address", e.target.value)} placeholder={isEvent ? "Venue and area, e.g. Eko Hotel, Victoria Island" : "Place and area, e.g. Landmark Beach, Victoria Island"} autoFocus />
                      <Err msg={errors.address} />
                      <p className="mt-3 text-xs text-stone-600">{isEvent ? "Travel costs for events outside Lagos are included in your quote." : OUTDOOR_NOTE}</p>
                    </div>
                  )}
                </>
              )}

              {/* 3. Date & time */}
              {step === 2 && (
                <>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <div>
                      <label htmlFor="event_date">Preferred date *</label>
                      <input id="event_date" type="date" min={tomorrow} className={`field ${errors.event_date ? "field-error" : ""}`} value={v.event_date} onChange={(e) => set("event_date", e.target.value)} />
                      <Err msg={errors.event_date} />
                    </div>
                    <div>
                      <label htmlFor="event_time">Start time *</label>
                      <select id="event_time" className={`field ${errors.event_time ? "field-error" : ""}`} value={v.event_time} onChange={(e) => set("event_time", e.target.value)}>
                        <option value="">Select a time</option>
                        {times.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <Err msg={errors.event_time} />
                    </div>
                  </div>
                  {!isEvent && (
                  <div className="mt-8">
                    <p className={label}>How many people will be in the session?</p>
                    <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Number of people">
                      {[1, 2, 3].map((n) => {
                        const on = n === 3 ? v.people >= 3 || morePeople : !morePeople && v.people === n;
                        return (
                          <button key={n} type="button" role="radio" aria-checked={on} onClick={() => { setMorePeople(n === 3); if (n === 3) setPeopleText("3"); set("people", n); }} className={`px-5 py-3 text-[11px] uppercase tracking-[0.14em] ${on ? "bg-ink text-white" : "border border-ink/20 hover:border-ink"}`}>
                            {n === 1 ? "1 person" : n === 2 ? "2 people" : "3+ group"}
                          </button>
                        );
                      })}
                    </div>
                    {morePeople && (
                      <div className="mt-4 max-w-[12rem]">
                        <label htmlFor="people_count">Exact number of people</label>
                        <input
                          id="people_count"
                          type="number"
                          inputMode="numeric"
                          min={3}
                          max={MAX_PEOPLE}
                          className={`field ${errors.people ? "field-error" : ""}`}
                          value={peopleText}
                          onChange={(e) => {
                            setPeopleText(e.target.value);
                            const n = parseInt(e.target.value, 10);
                            set("people", Number.isNaN(n) ? 0 : n);
                          }}
                        />
                      </div>
                    )}
                    <Err msg={errors.people} />
                    {morePeople && <p className="mt-2 text-xs text-stone-600">Larger groups may affect the price. We will confirm with you on WhatsApp.</p>}
                  </div>
                  )}
                </>
              )}

              {/* 4. Details */}
              {step === 3 && (
                <div className="grid gap-7 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="full_name">Full name *</label>
                    <input id="full_name" autoComplete="name" autoFocus className={`field ${errors.full_name ? "field-error" : ""}`} value={v.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. Oluwaseun Adeleke" />
                    <Err msg={errors.full_name} />
                  </div>
                  <div>
                    <label htmlFor="email">Email *</label>
                    <input id="email" type="email" autoComplete="email" className={`field ${errors.email ? "field-error" : ""}`} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="name@domain.com" />
                    <Err msg={errors.email} />
                  </div>
                  <div>
                    <label htmlFor="phone">Phone / WhatsApp *</label>
                    <input id="phone" type="tel" autoComplete="tel" className={`field ${errors.phone ? "field-error" : ""}`} value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 …" />
                    <Err msg={errors.phone} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="instagram">Instagram (optional)</label>
                    <input id="instagram" className="field" value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourhandle" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes">Notes (optional)</label>
                    <textarea id="notes" rows={4} className="field" value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Mood, outfits, references, anything I should know" />
                  </div>
                </div>
              )}

              {/* 5. Review */}
              {step === 4 && (
                <>
                  <dl className="divide-y divide-ink/10 border border-ink/10 text-sm">
                    {[...summaryRows, ["Name", v.full_name], ["Email", v.email], ["Phone", v.phone]].filter(([, val]) => val).map(([k, val]) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                        <dt className={label}>{k}</dt>
                        <dd className="break-words text-right">{val}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 bg-stone-100 px-4 py-3">
                      <dt className={label}>Deposit due now</dt>
                      <dd className="font-medium">{money(DEPOSIT_NGN)}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 border border-ink/10 bg-stone-100 p-5">
                    <p className={label}>Studio terms</p>
                    <ul className="mt-3 space-y-3 text-xs leading-relaxed text-stone-600">
                      {terms.map((t) => (
                        <li key={t.t}><strong className="font-medium text-ink">{t.t}.</strong> {t.d}</li>
                      ))}
                    </ul>
                  </div>

                  <label htmlFor="terms" className="mt-5 flex cursor-pointer items-start gap-3 text-xs normal-case tracking-normal text-ink">
                    <input id="terms" type="checkbox" checked={v.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
                    <span>I have read and agree to the terms above, including the {money(DEPOSIT_NGN)} commitment deposit and the rescheduling policy.</span>
                  </label>
                  <Err msg={errors.terms} />
                </>
              )}
            </div>

            {/* Back / Next */}
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <button type="button" onClick={back} className="py-2 text-left text-[11px] uppercase tracking-[0.16em] text-stone-600 hover:text-ink">← Back</button>
              ) : <span />}
              <button type="submit" disabled={busy} className="btn-dark w-full sm:w-auto">
                {step === LAST ? (busy ? "Sending" : "Confirm booking") : `Next: ${steps[step + 1].name}`}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-ink/10 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <p className={label}>Your booking</p>
              <span className={label}>Not yet sent</span>
            </div>
            <dl className="mt-4 divide-y divide-ink/10 text-sm">
              {summaryRows.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className={label}>{k}</dt>
                  <dd className="text-right">{val || <span className="text-stone-400">—</span>}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 space-y-2 border-t border-ink pt-4 text-sm">
              <div className="flex justify-between"><dt className={label}>Package price</dt><dd>{priceText}</dd></div>
              <div className="flex justify-between"><dt className={label}>Deposit due now</dt><dd className="font-medium">{money(DEPOSIT_NGN)}</dd></div>
              <div className="flex justify-between"><dt className={label}>Balance on the day</dt><dd>{balanceText}</dd></div>
            </dl>
            <p className="mt-4 border-t border-ink/10 pt-4 text-xs leading-relaxed text-stone-600">
              Your {money(DEPOSIT_NGN)} deposit is part of the price, not an extra fee. Your date is not confirmed until the deposit is paid.
            </p>
          </div>
          <div className="mt-4 border border-ink/10 p-5 md:p-6">
            <p className={label}>What happens next</p>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-stone-600">
              <li>1. Submit your request and get a reference code.</li>
              <li>2. Pay the {money(DEPOSIT_NGN)} deposit and send your receipt.</li>
              <li>3. We confirm your date on WhatsApp or email within 24 hours.</li>
              <li>4. Pay the balance on the day of your session.</li>
            </ol>
            <a href={`${site.whatsapp}?text=${waHelp}`} className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">Need help? Chat on WhatsApp</a>
          </div>
        </aside>
      </div>

      {/* Pop-up: validation message */}
      {toast && (
        <div role="alert" className="fade-in fixed bottom-5 left-1/2 z-50 -translate-x-1/2 border border-ink bg-white px-5 py-3 text-xs uppercase tracking-[0.14em] shadow-lg">
          {toast}
        </div>
      )}

      {/* Pop-up: failed */}
      {modal === "error" && (
        <Modal onClose={() => setModal(null)} labelledBy="error-title">
          <p className={label}>Booking not sent</p>
          <h2 id="error-title" className="display mt-4 text-3xl uppercase md:text-4xl">Something went wrong.</h2>
          <p role="alert" className="mt-4 text-sm text-stone-600">{serverError}</p>
          <p className="mt-2 text-sm text-stone-600">Your details are still here, so nothing is lost.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setModal(null)} className="btn-dark flex-1">Try again</button>
            <a href={`${site.whatsapp}?text=${waHelp}`} className="btn flex-1 border border-ink hover:bg-ink hover:text-white">Chat on WhatsApp</a>
          </div>
        </Modal>
      )}
    </>
  );
}