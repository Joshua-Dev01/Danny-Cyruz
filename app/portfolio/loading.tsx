import Navbar from "@/components/Navbar";

// Shown automatically by Next.js while the portfolio is being fetched from Supabase.
// Same layout as the real page, so nothing jumps when the photos arrive.
const heights = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-[5/4]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]"];

export default function PortfolioLoading() {
  return (
    <>
      <Navbar />

      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:px-10 md:pb-14 md:pt-44">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <p className="display font-sans text-[3.2rem] leading-[0.95] md:text-[4.2rem]">Portfolio</p>
          <span aria-hidden className="skeleton block h-4 w-48 md:mb-3" />
        </div>
      </header>

      {/* filter buttons */}
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-5 md:px-10" aria-hidden>
        {[20, 24, 28, 24, 20].map((w, i) => (
          <span key={i} className="skeleton block h-9" style={{ width: `${w * 4}px` }} />
        ))}
      </div>

      {/* photo grid */}
      <section role="status" aria-label="Loading portfolio" className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        <div className="columns-2 gap-3 md:columns-3 md:gap-6">
          {heights.map((h, i) => (
            <span key={i} aria-hidden className={`skeleton mb-3 block w-full break-inside-avoid md:mb-6 ${h}`} />
          ))}
        </div>
        <span className="sr-only">Loading portfolio…</span>
      </section>
    </>
  );
}