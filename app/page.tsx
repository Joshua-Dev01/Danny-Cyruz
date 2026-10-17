import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import {
  site,
  disciplines,
  services,
  testimonials,
  DEPOSIT_NGN,
} from "@/lib/content";
import RecentWork from "@/components/RecentWork";
import { fetchPortfolio } from "@/lib/portfolio-server";

// The page is rebuilt at most once a minute. Visitors who have it open get portfolio changes live anyway.
export const revalidate = 60;

export default async function Home() {
  const portfolio = await fetchPortfolio();
  const studio = services.find((s) => s.slug === "studio")!;
  return (
    <>
      <Navbar />

      {/* HERO */}
      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-32 md:grid-cols-12 md:gap-8 md:px-10 md:pb-16 md:pt-40">
        <div className="md:col-span-5">
          <h1 className="display font-sans animate-rise text-[3.1rem] leading-[1] md:text-[4.2rem]">
            Moments, beautifully kept.
          </h1>
          <p className="mt-5 max-w-sm text-stone-600">
            Photography and film in Onitsha Anambra.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <Link href="/book" className="btn-dark">
              Book your date
            </Link>
            <Link
              href="/portfolio"
              className="link-line text-[12px] uppercase tracking-[0.18em]"
            >
              Portfolio
            </Link>
          </div>
        </div>

        <div className="relative h-[380px] md:col-span-7 md:h-[470px]">
         <div className="absolute right-[8%] top-[6%] h-[42%] w-[42%] bg-[#C08614] md:right-[4%]" aria-hidden />
          <figure className="hero-img absolute left-0 top-0 h-[80%] w-[56%] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
            <Photo
              src="/hero.jpeg"
              alt="Bride in white by a stone archway"
              className="object-top"
            />
          </figure>
          <figure
            className="hero-img absolute bottom-0 right-0 h-[76%] w-[48%] border-[6px] border-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] md:border-[8px]"
            style={{ animationDelay: "0.35s" }}
          >
            <Photo
              src="/hero2.jpeg"
              alt="Portrait session"
              className="object-top"
            />
          </figure>
        </div>
      </section>

      {/* RECENT FRAMES */}
    <RecentWork initial={portfolio} />

      {/* SERVICES */}
      <section className="bg-sun-pale py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="display text-4xl md:text-6xl">Services</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {disciplines.map((d) => (
              <Link key={d.name} href="/services" className="disc block">
                <div className="zoom aspect-[3/4]">
                  <Photo src={d.image} alt={d.name} />
                </div>
                <h3 className="mt-4 font-serif text-2xl">{d.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
          <div className="zoom aspect-[5/4]">
            <Photo src={studio.image} alt="Photography studio" />
          </div>
          <div>
            <h2 className="display text-4xl md:text-6xl">Hire the studio</h2>
            <p className="mt-5 font-serif text-2xl">
              From ₦{studio.from.toLocaleString()}
            </p>
            <Link
              href="/book?service=Studio%20Sessions"
              className="btn-dark mt-8"
            >
              Reserve
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
        <blockquote className="font-serif text-3xl italic leading-snug md:text-5xl">
          “{testimonials[0].quote}”
        </blockquote>
        <p className="mt-6 text-sm text-stone-600">{testimonials[0].name}</p>
      </section>

      {/* CTA */}
      <section className="bg-sun px-5 py-20 text-center md:py-28">
        <h2 className="display text-5xl md:text-7xl">Hold your date.</h2>
        <p className="mt-5">
          ₦{DEPOSIT_NGN.toLocaleString()} deposit secures any booking.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/book"
            className="btn bg-ink text-white hover:bg-white hover:text-ink"
          >
            Book a session
          </Link>
          <a
            href={site.whatsapp}
            className="btn border border-ink hover:bg-ink hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <Footer />

      <a
        href={site.whatsapp}
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-30 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-sun hover:text-ink"
      >
        WhatsApp
      </a>
    </>
  );
}