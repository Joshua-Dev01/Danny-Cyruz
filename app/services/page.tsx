import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { services, site } from "@/lib/content";

export const metadata = {
  title: "Services",
  description: "Photography packages and studio space rental by Danny Cyruz.",
};

const label = "font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600";

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <header className="mx-auto max-w-7xl font-sans! px-5 pb-12 pt-32 md:px-10 md:pb-16 md:pt-40">
        <p className={`${label} flex items-center justify-center gap-2 md:justify-start`}>
          <span className="h-1.5 w-1.5 bg-sun" aria-hidden />
          Visual disciplines &amp; studio hire
        </p>
        <div className="mt-5 flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <h1 className="display animate-rise text-[3.4rem] leading-none md:text-[6.5rem]">Services.</h1>
          <p className="max-w-sm text-sm leading-relaxed text-stone-600 md:text-right">
            Quiet, artful sessions staged under warm studio daylight. Transparent fees and high-quality deliveries.
          </p>
        </div>
      </header>

      {/* Services */}
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        {services.map((s, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={s.slug}
              id={s.slug}
              className="grid scroll-mt-28 items-center gap-8 border-t border-ink/10 py-12 md:grid-cols-12 md:gap-0 md:py-20"
            >
              {/* Photo */}
              <figure className={`relative md:row-start-1 md:col-span-5 ${flip ? "md:col-start-8" : "md:col-start-1"}`}>
                <div className="zoom aspect-[4/5] bg-stone-100">
                  <Photo src={s.image} alt={`${s.name} photography`} />
                </div>
                <figcaption className="absolute bottom-0 left-0 bg-white px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-stone-600">
                  {s.plate}
                </figcaption>
              </figure>

              {/* Details */}
              <div className={`md:row-start-1 md:col-span-6 ${flip ? "md:col-start-1 md:pr-12" : "md:col-start-7"}`}>
                <p className={label}>{s.series}</p>
                <h2 className="display mt-4 text-4xl md:text-5xl">{s.name}</h2>
                <p className="mt-2 text-sm">{s.subtitle}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">{s.blurb}</p>

                {/* Two packages side by side */}
                <div className="mt-8 grid grid-cols-2 border-y border-ink/10">
                  {s.packages.map((p, k) => (
                    <div key={p.tag} className={`py-5 ${k === 0 ? "border-r border-ink/10 pr-4 md:pr-6" : "pl-4 md:pl-6"}`}>
                      <p className={label}>{p.tag}</p>
                      <p className="mt-2 font-serif text-2xl md:text-3xl">₦{p.price.toLocaleString()}</p>
                      <p className="mt-1 text-xs font-medium md:text-sm">{p.title}</p>
                      <p className="mt-1 text-[11px] leading-snug text-stone-600 md:text-xs">{p.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-stone-600">{s.footnote}</p>
                  <Link href={`/book?service=${encodeURIComponent(s.name)}`} className="btn-dark shrink-0 !px-6 !py-3">
                    {s.cta}
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Contact */}
      <section className="mx-auto max-w-7xl border-t border-ink px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className={label}>Direct correspondence</p>
            <h2 className="display mt-4 text-4xl md:text-5xl">Book a session</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
              Contact the studio directly for custom dates, commercial work, or urgent schedules.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-7">
            <div>
              <p className={label}>Email</p>
              <a href={`mailto:${site.email}`} className="mt-2 block break-all hover:underline">{site.email}</a>
            </div>
            <div>
              <p className={label}>Phone</p>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-2 block hover:underline">{site.phone}</a>
              <a href={`tel:${site.phone2.replace(/\s/g, "")}`} className="block hover:underline">{site.phone2}</a>
            </div>
            <div className="sm:col-span-2">
              <a href={site.whatsapp} className="btn-dark w-full sm:w-auto">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}