"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* ---------- styles ---------- */
export const label = "text-[11px] font-semibold uppercase tracking-wider text-slate-500";
export const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";
const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-50";
export const btn = `${btnBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const btnDark = `${btnBase} bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700`;
export const btnDanger = `${btnBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-600 hover:text-white`;
// Big buttons for the footer of add/edit panels.
export const submitBtn = `${btnDark} flex-1 !rounded-xl !py-3 !text-sm`;
export const cancelBtn = `${btn} !rounded-xl !py-3 !text-sm`;
export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";
export const tableWrap = `${card} overflow-x-auto`;
export const th = "whitespace-nowrap bg-slate-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500";
export const td = "px-4 py-3 align-middle text-sm";
export const trow = "cursor-pointer border-t border-slate-100 transition hover:bg-indigo-50/50";

/* ---------- formatting ---------- */
export const naira = (n: number | null | undefined) => (n == null ? "—" : `₦${n.toLocaleString("en-NG")}`);

export function fmtDate(d: string | null | undefined, year = true) {
  if (!d) return "—";
  const dt = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(year ? { year: "numeric" } : {}) });
}

export function fmtTime(t: string | null | undefined) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  if (s < 172800) return "Yesterday";
  return fmtDate(iso, false);
}

/* ---------- icons ---------- */
const paths: Record<string, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  layers: <><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>,
  quote: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
  dots: <><circle cx="12" cy="5" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="12" cy="19" r="1.2" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  check: <path d="m20 6-11 11-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  wallet: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  left: <path d="M19 12H5m7-7-7 7 7 7" />,
  right: <path d="M5 12h14m-7-7 7 7-7 7" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  logout:<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
};
export function Icon({ name, size = 18, className = "" }: { name: keyof typeof paths | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>
      {paths[name]}
    </svg>
  );
}

/* ---------- small pieces ---------- */
const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/25",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  grey: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dark: "bg-indigo-600 text-white ring-indigo-600",
};
export function Tag({ tone = "grey", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

const avatarColors = ["from-indigo-500 to-violet-500", "from-sky-500 to-cyan-400", "from-emerald-500 to-teal-400", "from-rose-500 to-orange-400", "from-amber-500 to-yellow-400", "from-fuchsia-500 to-pink-400"];
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  const color = avatarColors[Array.from(name).reduce((n, c) => n + c.charCodeAt(0), 0) % avatarColors.length];
  return <span style={{ width: size, height: size }} className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${color}`}>{initials}</span>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

const statColors = {
  indigo: { chip: "from-indigo-500 to-violet-500 shadow-indigo-500/30", pill: "bg-indigo-50 text-indigo-700" },
  amber: { chip: "from-amber-500 to-orange-400 shadow-amber-500/30", pill: "bg-amber-50 text-amber-700" },
  emerald: { chip: "from-emerald-500 to-teal-400 shadow-emerald-500/30", pill: "bg-emerald-50 text-emerald-700" },
  rose: { chip: "from-rose-500 to-pink-400 shadow-rose-500/30", pill: "bg-rose-50 text-rose-700" },
  sky: { chip: "from-sky-500 to-cyan-400 shadow-sky-500/30", pill: "bg-sky-50 text-sky-700" },
};
export function StatCard({ title, value, sub, color, icon, loading }: { title: string; value: ReactNode; sub: string; color: keyof typeof statColors; icon: string; loading?: boolean }) {
  const c = statColors[color];
  return (
    <div className={`${card} flex items-start justify-between gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="min-w-0">
        <p className={label}>{title}</p>
        {loading ? <Skeleton className="mt-3 h-9 w-16" /> : <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>}
        <p className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.pill}`}>{sub}</p>
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${c.chip}`}><Icon name={icon} size={22} /></span>
    </div>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <p className="text-sm text-slate-500">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* ---------- the "⋯" dropdown on every row ---------- */
export type MenuItem = { label: string; icon?: string; onClick?: () => void; href?: string; danger?: boolean; hidden?: boolean };
export function RowMenu({ items }: { items: MenuItem[] }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setPos(null), []);
  const visible = items.filter((i) => !i.hidden);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: Event) => { const t = e.target as HTMLElement; if (!btnRef.current?.contains(t) && !t.closest("[data-rowmenu]")) close(); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pos, close]);

  function toggle() {
    if (pos) return close();
    const r = btnRef.current!.getBoundingClientRect();
    const w = 208, h = visible.length * 38 + 8, m = 8;
    const left = Math.min(Math.max(m, r.right - w), window.innerWidth - w - m);
    const below = r.bottom + 4;
    const top = below + h > window.innerHeight - m ? Math.max(m, r.top - h - 4) : below;
    setPos({ top, left });
  }

  const cls = (danger?: boolean) => `flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"}`;
  // The menu is portalled to <body>: inside a card with overflow-hidden / hover transforms,
  // a position:fixed menu gets clipped or offset, which is what made it misbehave.
  const menu = pos && typeof document !== "undefined" ? createPortal(
    <div data-rowmenu role="menu" style={{ top: pos.top, left: pos.left }} className="fixed z-[80] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
      {visible.map((i) => {
        const inner = <>{i.icon && <Icon name={i.icon} size={16} />}{i.label}</>;
        return i.href
          ? <a key={i.label} role="menuitem" href={i.href} target="_blank" rel="noreferrer" onClick={close} className={cls(i.danger)}>{inner}</a>
          : <button key={i.label} type="button" role="menuitem" onClick={() => { close(); i.onClick?.(); }} className={cls(i.danger)}>{inner}</button>;
      })}
    </div>,
    document.body,
  ) : null;
  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-block">
      <button ref={btnRef} type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Icon name="dots" /></button>
      {menu}
    </div>
  );
}

/* ---------- panels, dialogs, toasts ---------- */
export function Drawer({ open, onClose, title, subtitle, icon, children, footer }: { open: boolean; onClose: () => void; title: string; subtitle?: string; icon?: string; children: ReactNode; footer?: ReactNode }) {
  // Stays mounted a moment after closing so the panel can slide out smoothly.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  // While sliding out, keep showing what was on screen (the caller may already have cleared its state).
  const last = useRef({ title, subtitle, icon, children, footer });
  if (open) last.current = { title, subtitle, icon, children, footer };
  const c = last.current;
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-modal="true" aria-label={c.title}
        className={`relative flex h-full w-full max-w-lg flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-l-3xl ${shown ? "translate-x-0" : "translate-x-full"}`}>
        <div className="relative overflow-hidden border-b border-slate-200 bg-white px-5 py-5 sm:rounded-tl-3xl sm:px-6">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          <div className="flex items-start gap-3">
            {c.icon && <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon name={c.icon} size={20} /></span>}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold tracking-tight text-slate-900">{c.title}</p>
              {c.subtitle && <p className="mt-0.5 text-sm text-slate-500">{c.subtitle}</p>}
            </div>
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="x" size={20} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{c.children}</div>
        {c.footer && <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">{c.footer}</div>}
      </aside>
    </div>
  );
}

/* ---------- form pieces ---------- */
// Label + input + optional hint. Put an input/textarea/select with className={field} inside.
export function Field({ label: text, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-slate-800">{text}</span>
        {optional && <span className="text-[11px] font-medium text-slate-400">Optional</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">{hint}</span>}
    </label>
  );
}

// A titled card that groups related fields.
export function FormSection({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// Two or three pill choices (e.g. Photo / Video).
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: string }[] }) {
  return (
    <div role="tablist" className="grid gap-1 rounded-xl bg-slate-200/70 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${value === o.value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
          {o.icon && <Icon name={o.icon} size={16} />}{o.label}
        </button>
      ))}
    </div>
  );
}

// Drag-and-drop upload box with previews. `existingUrl` shows the current image when editing.
export function FileDrop({ files, onChange, accept, multiple = false, existingUrl, title = "Click to upload or drag and drop", hint }: {
  files: File[]; onChange: (f: File[]) => void; accept: string; multiple?: boolean; existingUrl?: string | null; title?: string; hint?: string;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => ({ f, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null })), [files]);
  useEffect(() => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)), [previews]);

  function take(list: FileList | null) {
    if (!list || !list.length) return;
    const ok = Array.from(list).filter((f) => accept.split(",").some((a) => (a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a.trim())));
    if (!ok.length) return;
    onChange(multiple ? [...files, ...ok] : [ok[0]]);
  }
  const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

  return (
    <div>
      <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), inputRef.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${over ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/50"}`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105"><Icon name="upload" size={20} /></span>
        <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1}
          onClick={(e) => e.stopPropagation()} onChange={(e) => { take(e.target.files); e.target.value = ""; }} />
      </div>

      {!files.length && existingUrl && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
          <img src={existingUrl} alt="" className="h-14 w-14 rounded-lg bg-slate-100 object-cover" />
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-800">Current image</p><p className="text-xs text-slate-500">Choose a new one above to replace it</p></div>
        </div>
      )}

      {previews.length > 0 && (
        <ul className="mt-3 space-y-2">
          {previews.map((p, i) => (
            <li key={`${p.f.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
              {p.url ? <img src={p.url} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover" />
                : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Icon name="image" size={22} /></span>}
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{p.f.name}</p><p className="text-xs text-slate-500">{size(p.f.size)}</p></div>
              <button type="button" onClick={() => onChange(files.filter((_, k) => k !== i))} aria-label={`Remove ${p.f.name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="x" size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = "Delete", onConfirm, onCancel }: { open: boolean; title: string; text: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-slate-900/60" />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600"><Icon name="trash" size={22} /></span>
        <p className="mt-4 text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-1.5 text-sm text-slate-500">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className={btn}>Cancel</button>
          <button onClick={onConfirm} className={`${btnBase} bg-rose-600 text-white hover:bg-rose-700`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// const [toast, notify] = useToast();  notify("Saved") / notify("Failed", true);  render {toast}
export function useToast(): [ReactNode, (text: string, bad?: boolean) => void] {
  const [t, setT] = useState<{ text: string; bad: boolean } | null>(null);
  const notify = useCallback((text: string, bad = false) => {
    setT({ text, bad });
    setTimeout(() => setT(null), 4000);
  }, []);
  const node = t ? (
    <div role="status" className={`fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${t.bad ? "bg-rose-600" : "bg-emerald-600"}`}>
      <Icon name={t.bad ? "x" : "check"} size={16} />{t.text}
    </div>
  ) : null;
  return [node, notify];
}

export function Toggle({ checked, onChange, text, hint }: { checked: boolean; onChange: (v: boolean) => void; text: string; hint?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${checked ? "border-indigo-200 bg-indigo-50/60" : "border-slate-200 bg-slate-50/70"}`}>
      <button type="button" onClick={() => onChange(!checked)} className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-slate-800">{text}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </button>
      <button type="button" role="switch" aria-checked={checked} aria-label={text} onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[26px]" : "left-1"}`} />
      </button>
    </div>
  );
}