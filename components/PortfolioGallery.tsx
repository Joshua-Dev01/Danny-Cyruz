"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { frames, videos } from "@/lib/content";

type Video = { src?: string; youtube?: string; poster?: string; title: string; meta: string; vertical?: boolean };
const allVideos = videos as Video[];

const thumbOf = (v: Video) => v.poster ?? (v.youtube ? `https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg` : undefined);

export default function PortfolioGallery() {
  const [type, setType] = useState<"photos" | "videos">("photos");
  const categories = useMemo(() => ["All", ...Array.from(new Set(frames.map((f) => f.meta)))], []);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<number | null>(null);

  const photos = useMemo(() => (filter === "All" ? frames : frames.filter((f) => f.meta === filter)), [filter]);
  const length = type === "photos" ? photos.length : allVideos.length;

  const next = useCallback(() => setActive((i) => (i === null ? i : (i + 1) % length)), [length]);
  const prev = useCallback(() => setActive((i) => (i === null ? i : (i - 1 + length) % length)), [length]);

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

  const switchType = (t: "photos" | "videos") => {
    setType(t);
    setActive(null);
  };

  const photo = type === "photos" && active !== null ? photos[active] : null;
  const video = type === "videos" && active !== null ? allVideos[active] : null;

  const closeBtn = (
    <button
      onClick={() => setActive(null)}
      aria-label="Close"
      className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-2xl text-white transition hover:bg-white hover:text-ink md:right-8 md:top-8"
    >
      ×
    </button>
  );
  const arrows =
    length > 1 ? (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous"
          className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white transition hover:bg-white hover:text-ink md:left-8"
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next"
          className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white transition hover:bg-white hover:text-ink md:right-8"
        >
          ›
        </button>
      </>
    ) : null;

  return (
    <>
      {/* Main tabs: Photos / Videos */}
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex justify-center gap-10 border-t border-ink/10 pt-6 md:gap-16" role="tablist" aria-label="Media type">
          {(["photos", "videos"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              onClick={() => switchType(t)}
              className={`relative pb-3 font-serif text-3xl capitalize transition-colors md:text-4xl ${
                type === t ? "text-ink" : "text-ink/35 hover:text-ink/70"
              }`}
            >
              {t}
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-ink transition-transform duration-500 ${
                  type === t ? "scale-x-100" : "scale-x-0"
                }`}
                aria-hidden
              />
            </button>
          ))}
        </div>

        {/* Category pills: photos only */}
        {type === "photos" && (
          <div className="flex flex-wrap justify-center gap-2 border-b border-ink/10 py-6 md:gap-3" role="group" aria-label="Filter photos">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={filter === c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-300 md:px-6 md:py-2.5 md:text-[12px] ${
                  filter === c ? "border-ink bg-ink text-white" : "border-ink/20 text-ink hover:border-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {type === "videos" && <div className="border-b border-ink/10 pt-6" />}
      </div>

      {/* PHOTOS */}
      {type === "photos" && (
        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
          <div key={filter} className="columns-2 gap-3 md:columns-3 md:gap-6">
            {photos.map((f, i) => (
              <figure key={f.src} className="work-card mb-3 break-inside-avoid md:mb-6" style={{ animationDelay: `${Math.min(i, 8) * 80}ms` }}>
                <button onClick={() => setActive(i)} aria-label={`View ${f.title}`} className="group relative block w-full overflow-hidden bg-stone-100 text-left">
                  <img
                    src={f.src}
                    alt={`${f.title}, ${f.meta.toLowerCase()} photograph`}
                    loading="lazy"
                    className="block h-auto w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2.5 right-2.5 flex items-center gap-2 bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink shadow-md transition-colors duration-300 group-hover:bg-ink group-hover:text-white md:bottom-4 md:right-4 md:px-4 md:py-2 md:text-[11px]">
                    View
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <path d="M9.5 2.5h4v4M13.5 2.5l-5 5M6.5 13.5h-4v-4M2.5 13.5l5-5" />
                    </svg>
                  </span>
                  <span className="pointer-events-none absolute bottom-3 left-4 hidden max-w-[55%] translate-y-2 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">
                    <span className="block font-serif text-xl leading-tight">{f.title}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-white/80">{f.meta}</span>
                  </span>
                </button>
              </figure>
            ))}
          </div>
          {photos.length === 0 && <p className="py-20 text-center text-stone-600">No photos in this category yet.</p>}
        </section>
      )}

      {/* VIDEOS */}
      {type === "videos" && (
        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 md:gap-8">
            {allVideos.map((v, i) => {
              const thumb = thumbOf(v);
              return (
                <figure key={(v.src ?? v.youtube) + String(i)} className="work-card" style={{ animationDelay: `${Math.min(i, 8) * 80}ms` }}>
                  <button
                    onClick={() => setActive(i)}
                    aria-label={`Watch ${v.title}`}
                    className={`group relative block w-full overflow-hidden bg-ink text-left ${v.vertical ? "mx-auto aspect-[9/16] max-w-xs" : "aspect-video"}`}
                  >
                    {thumb ? (
                      <img src={thumb} alt={`${v.title} video`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.05]" />
                    ) : (
                      <video src={`${v.src}#t=0.5`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/40" />
                    {/* Play button */}
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-500 group-hover:scale-110 md:h-20 md:w-20">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 md:h-7 md:w-7" fill="currentColor" aria-hidden>
                        <path d="M7 4.5v15l13-7.5z" />
                      </svg>
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink shadow-md md:bottom-4 md:right-4 md:px-4 md:py-2 md:text-[11px]">
                      Watch
                    </span>
                  </button>
                  <figcaption className={`mt-3 flex items-baseline justify-between gap-3 ${v.vertical ? "mx-auto max-w-xs" : ""}`}>
                    <span className="font-serif text-lg md:text-xl">{v.title}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-stone-600">{v.meta}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          {allVideos.length === 0 && <p className="py-20 text-center text-stone-600">Videos are coming soon.</p>}
        </section>
      )}

      {/* PHOTO VIEWER */}
      {photo && (
        <div role="dialog" aria-modal="true" aria-label={photo.title} className="fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10" onClick={() => setActive(null)}>
          {closeBtn}
          {arrows}
          <figure key={photo.src} className="zoom-in flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={photo.src} alt={photo.title} className="max-h-[78vh] w-auto max-w-full object-contain" />
            <figcaption className="mt-5 text-center text-white">
              <span className="block font-serif text-2xl">{photo.title}</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-white/60">{photo.meta} · {active! + 1} / {photos.length}</span>
            </figcaption>
          </figure>
        </div>
      )}

      {/* VIDEO PLAYER */}
      {video && (
        <div role="dialog" aria-modal="true" aria-label={video.title} className="fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-10" onClick={() => setActive(null)}>
          {closeBtn}
          {arrows}
          <figure key={(video.src ?? video.youtube) + String(active)} className="zoom-in flex max-h-full w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {video.youtube ? (
              <iframe
                className={video.vertical ? "aspect-[9/16] max-h-[78vh]" : "aspect-video w-full"}
                src={`https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={video.src} poster={video.poster} controls autoPlay playsInline className="max-h-[78vh] w-auto max-w-full bg-black" />
            )}
            <figcaption className="mt-5 text-center text-white">
              <span className="block font-serif text-2xl">{video.title}</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-white/60">{video.meta} · {active! + 1} / {allVideos.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}