"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { frames } from "@/lib/content";

type Frame = (typeof frames)[number];

export default function RecentWork() {
  const items = frames.slice(0, 6);
  const [active, setActive] = useState<number | null>(null);

  const next = useCallback(() => setActive((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);
  const prev = useCallback(() => setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, next, prev]);

  const current = active !== null ? items[active] : null;

  // One photo card: same spacing and caption style everywhere
  const Card = ({ f, i }: { f: Frame; i: number }) => (
    <figure className="work-card" style={{ animationDelay: `${i * 110}ms` }}>
      <button
        onClick={() => setActive(i)}
        aria-label={`Open ${f.title}`}
        className="group relative block w-full overflow-hidden bg-stone-100"
      >
        <img
          src={f.src}
          alt={`${f.title}, ${f.meta.toLowerCase()} photograph`}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.05]"
        />
        <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
        {/* Gold line draws across the bottom on hover */}
        <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-sun transition-transform duration-700 group-hover:scale-x-100" />
      </button>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-serif text-base md:text-lg">{f.title}</span>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-stone-600">{f.meta}</span>
      </figcaption>
    </figure>
  );

  // Photos are dealt into columns left to right, so spacing stays equal
  const desktop = [[0, 3], [1, 4], [2, 5]];
  const mobile = [[0, 2, 4], [1, 3, 5]];

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6 md:mb-16">
        <h2 className="display font-sans text-4xl md:text-6xl">Recent work</h2>
        <Link href="/portfolio" className="link-line hidden text-[12px] uppercase tracking-[0.18em] md:inline">
          View all work
        </Link>
      </div>

      {/* Phones: two columns, the right one sits a little lower */}
      <div className="grid grid-cols-2 items-start gap-4 md:hidden">
        {mobile.map((col, c) => (
          <div key={c} className={`flex flex-col gap-6 ${c === 1 ? "mt-10" : ""}`}>
            {col.map((i) => items[i] && <Card key={items[i].src} f={items[i]} i={i} />)}
          </div>
        ))}
      </div>

      {/* Desktop: three columns, the middle one sits lower */}
      <div className="hidden grid-cols-3 items-start gap-8 md:grid">
        {desktop.map((col, c) => (
          <div key={c} className={`flex flex-col gap-10 ${c === 1 ? "mt-20" : ""}`}>
            {col.map((i) => items[i] && <Card key={items[i].src} f={items[i]} i={i} />)}
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center md:mt-24">
        <Link href="/portfolio" className="btn-dark">View all work</Link>
      </div>

      {/* Full-screen viewer */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-2xl text-white transition hover:border-sun hover:bg-sun md:right-8 md:top-8"
          >
            ×
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white transition hover:border-sun hover:bg-sun md:left-8"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white transition hover:border-sun hover:bg-sun md:right-8"
          >
            ›
          </button>

          <figure key={current.src} className="zoom-in flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.title} className="max-h-[78vh] w-auto max-w-full object-contain" />
            <figcaption className="mt-5 text-center text-white">
              <span className="block font-serif text-2xl">{current.title}</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-white/60">
                {current.meta} · {active! + 1} / {items.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}