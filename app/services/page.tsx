import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { services, site } from "@/lib/content";

export const metadata = {
  title: "Services",
  description: "Photography packages and studio space rental by Danny Cyruz.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 text-center md:px-10 md:pb-16 md:pt-44 md:text-left">
        <h1 className="display animate-rise text-[3.2rem] leading-[0.95] md:text-[7rem]">Services</h1>
      </header>

      {/* Price list: one row per service */}
      <section className="mx-auto max-w-7xl border-b border-ink/15 px-5 md:px-10">
        {services.map((s) => (
          <Link
            key={s.slug}
            id={s.slug}
            href={`/book?service=${encodeURIComponent(s.name)}`}
            className="group flex scroll-mt-28 items-center gap-4 border-t border-ink/15 py-6 md:gap-0 md:py-10"
          >
            {/* Photo: always visible on phones, slides open on hover on desktop */}
            <div className="h-20 w-20 shrink-0 overflow-hidden bg-stone-100 md:h-28 md:w-0 md:transition-all md:duration-700 md:ease-[cubic-bezier(0.2,0.7,0.2,1)] md:group-hover:mr-8 md:group-hover:w-44">
              <div className="h-full w-full md:w-44">
                <Photo src={s.image} alt={s.name} />
              </div>
            </div>

            <div className="min-w-0 flex-1 md:grid md:grid-cols-2 md:items-center md:gap-8">
              <div>
                <h2 className="font-serif text-3xl leading-none md:text-6xl">{s.name}</h2>
                {s.note && <p className="mt-1.5 text-sm text-stone-600">{s.note}</p>}
              </div>
              <ul className="mt-3 flex gap-6 md:mt-0 md:justify-end md:gap-12">
                {s.options.map((o) => (
                  <li key={o.label}>
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-stone-600">{o.label}</span>
                    <span className="font-serif text-xl md:text-3xl">₦{o.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/25 transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-white md:ml-8 md:h-14 md:w-14"
              aria-hidden
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </Link>
        ))}
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center md:px-10 md:py-28">
        <a href={`mailto:${site.email}`} className="break-all font-serif text-2xl underline-offset-8 hover:underline md:text-5xl">
          {site.email}
        </a>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-1 text-stone-600 md:text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-ink">{site.phone}</a>
          <a href={`tel:${site.phone2.replace(/\s/g, "")}`} className="hover:text-ink">{site.phone2}</a>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/book" className="btn-dark">Book a session</Link>
          <a href={site.whatsapp} className="btn border border-ink hover:bg-ink hover:text-white">WhatsApp</a>
        </div>
      </section>

      <Footer />
    </>
  );
}