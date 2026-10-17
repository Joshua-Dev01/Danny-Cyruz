import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { services, site } from "@/lib/content";

export const metadata = {
  title: "Services",
  description: "Photography packages and studio space rental by Danny Cyruz.",
};

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-5 pb-8 pt-28 md:px-10 md:pb-16 md:pt-40">
        <p className={`${label} flex items-center gap-2`}>
          <span className="h-1.5 w-1.5 bg-sun" aria-hidden />
          Visual disciplines &amp; studio hire
        </p>
        <div className="mt-4 flex flex-col gap-4 md:mt-5 md:flex-row md:items-end md:justify-between md:gap-5">
          <h1 className="display animate-rise text-[3.2rem] leading-none md:text-[4.5rem]">Services.</h1>
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
              className="grid scroll-mt-24 grid-cols-[7rem_1fr] items-start gap-x-4 gap-y-5 border-t border-ink/10 py-8 md:grid-cols-12 md:items-center md:gap-0 md:py-20"
            >
              {/* Photo: small thumbnail on mobile, larger on desktop */}
              <figure className={`relative md:row-start-1 md:col-span-4 ${flip ? "md:col-start-9" : "md:col-start-1"}`}>
                <div className="zoom aspect-square bg-stone-100">
                  <Photo src={s.image} alt={`${s.name} photography`} />
                </div>
                <figcaption className="absolute bottom-0 left-0 hidden bg-white px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-stone-600 md:block">
                  {s.plate}
                </figcaption>
              </figure>

              {/* Details (on mobile this wrapper disappears so the title sits beside the photo) */}
              <div className={`contents md:row-start-1 md:col-span-7 md:block ${flip ? "md:col-start-1 md:pr-12" : "md:col-start-6 md:pl-8"}`}>
                <div className="min-w-0">
                  <p className={label}>{s.series}</p>
                  <h2 className="display mt-2 text-[1.5rem] leading-tight md:mt-4 md:text-5xl">{s.name}</h2>
                  <p className="mt-1.5 text-xs md:mt-2 md:text-sm">{s.subtitle}</p>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <p className="max-w-md text-sm leading-relaxed text-stone-600 md:mt-4">{s.blurb}</p>

                  {/* Two packages: stacked rows on mobile, side by side on desktop */}
                  <div className="mt-5 grid border-y border-ink/10 md:mt-8 md:grid-cols-2">
                    {s.packages.map((p, k) => (
                      <div
                        key={p.tag}
                        className={`grid grid-cols-[1fr_auto] items-start gap-x-4 py-4 md:block md:py-5 ${
                          k === 0 ? "border-b border-ink/10 md:border-b-0 md:border-r md:pr-6" : "md:pl-6"
                        }`}
                      >
                        <p className={label}>{p.tag}</p>
                        <p className="col-start-2 row-span-3 row-start-1 self-center text-xl font-medium md:mt-2 md:text-3xl">₦{p.price.toLocaleString()}</p>
                        <p className="mt-1 text-sm font-medium">{p.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-stone-600">{p.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-6">
                    <p className="text-xs text-stone-600">{s.footnote}</p>
                    <Link href={`/book?service=${encodeURIComponent(s.name)}`} className="btn-dark w-full shrink-0 !px-6 !py-3.5 sm:w-auto">
                      {s.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Contact */}
      <section className="mx-auto max-w-7xl border-t border-ink px-5 py-12 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className={label}>Direct correspondence</p>
            <h2 className="display mt-3 text-[2rem] md:mt-4 md:text-5xl">Book a session</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
              Contact the studio directly for custom dates, commercial work, or urgent schedules.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-7">
            <div>
              <p className={label}>Email</p>
              <a href={`mailto:${site.email}`} className="mt-2 block break-all py-1 hover:underline">{site.email}</a>
            </div>
            <div>
              <p className={label}>Phone</p>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-2 block py-1 hover:underline">{site.phone}</a>
              <a href={`tel:${site.phone2.replace(/\s/g, "")}`} className="block py-1 hover:underline">{site.phone2}</a>
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