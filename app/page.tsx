import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { site, images, services, testimonials, DEPOSIT_NGN } from "@/lib/content";

const categories = ["Weddings", "Portraits", "Events", "Fashion", "Commercial", "Studio hire"];

export default function Home() {
  const [f1, f2, f3, f4] = images.featured;
  const studio = services.find((s) => s.slug === "studio")!;

  return (
    <>
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[620px] bg-ink text-white">
        <Photo src={images.hero} alt="Featured photograph" className="absolute inset-0 opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35" />
        <Navbar overHero />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
          <p className="eyebrow !text-white/80">Photographer &amp; studio</p>
          <h1 className="display mt-6 max-w-5xl animate-rise text-[2.9rem] md:text-[7.5rem]">
            Capturing <em className="text-sun">moments.</em>
            <br />
            Creating memories.
          </h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-base text-white/85">{site.intro}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/portfolio" className="btn-dark">Explore Portfolio</Link>
              <Link href="/book" className="btn-line">Book a Photoshoot</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <div className="marquee bg-sun py-5 text-ink" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <div key={n} className="flex shrink-0 items-center">
              {categories.map((c) => (
                <span key={c + n} className="flex items-center font-serif text-3xl italic md:text-4xl">
                  <span className="px-8">{c}</span>
                  <span className="text-xl not-italic">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATEMENT */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
        <p className="eyebrow">The approach</p>
        <p className="display reveal mt-8 max-w-5xl text-3xl md:text-6xl">
          I photograph people as they are, in <span className="marker">honest light</span>, so the pictures still feel true
          years from now.
        </p>
      </section>

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10 md:pb-36">
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">01 · Selected work</p>
            <h2 className="display mt-5 text-4xl md:text-7xl">Recent <em>stories</em></h2>
          </div>
          <Link href="/portfolio" className="link-line hidden text-[12px] font-medium uppercase tracking-[0.18em] md:inline">View all work</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-12 md:gap-8">
          <figure className="zoom reveal aspect-[7/5] md:col-span-8"><Photo src={f1} alt="Wedding photograph" /></figure>
          <figure className="frame reveal aspect-[3/4] md:col-span-4 md:mt-28 md:mr-4"><Photo src={f2} alt="Portrait photograph" /></figure>
          <figure className="zoom reveal aspect-[3/4] md:col-span-4 md:-mt-20"><Photo src={f3} alt="Fashion photograph" /></figure>
          <figure className="zoom reveal aspect-[7/5] md:col-span-8"><Photo src={f4} alt="Event photograph" /></figure>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-sun-pale py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="eyebrow">02 · Services</p>
          <h2 className="display mt-5 text-4xl md:text-7xl">What I <em>shoot</em></h2>
          <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Link key={s.slug} href={`/services#${s.slug}`} className="reveal group block">
                <div className="zoom aspect-[4/5]"><Photo src={s.image} alt={s.name} /></div>
                <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-4">
                  <h3 className="font-serif text-3xl">{s.name}</h3>
                  <span className="text-[11px] tracking-[0.2em] text-stone-400">0{i + 1}</span>
                </div>
                <p className="mt-4 max-w-sm text-sm text-stone-600">{s.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 md:grid-cols-2 md:gap-24 md:px-10 md:py-36">
        <div className="frame reveal aspect-[4/5] md:mr-4"><Photo src={images.about} alt={`Portrait of ${site.name}`} /></div>
        <div className="reveal">
          <p className="eyebrow">03 · The photographer</p>
          <h2 className="display mt-5 text-4xl md:text-6xl">Meet <span className="marker">{site.name}</span></h2>
          <p className="mt-8 max-w-lg text-stone-600">
            Replace this with Danny&apos;s story: how he started, what he looks for in a frame, and why people trust him
            with their biggest days.
          </p>
          <Link href="/about" className="btn-line mt-10">Read the story</Link>
        </div>
      </section>

      {/* STUDIO HIRE */}
      <section className="bg-sun text-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
          <div className="reveal">
            <p className="eyebrow !text-ink">04 · The studio</p>
            <h2 className="display mt-5 text-4xl md:text-7xl">Hire the <em>studio</em></h2>
            <p className="mt-6 max-w-md text-ink/80">
              Seamless backdrops, studio lighting and room for your whole team. Book it with Danny behind the camera, or on
              its own.
            </p>
            <Link href="/book?service=Studio%20Sessions" className="btn mt-10 bg-ink text-white hover:bg-white hover:text-ink">Reserve the studio</Link>
          </div>
          <div className="zoom reveal aspect-[5/4]"><Photo src={studio.image} alt="The studio" /></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
        <p className="eyebrow">05 · Kind words</p>
        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0">
          {testimonials.map((t, i) => (
            <blockquote key={i} className={`reveal md:px-10 ${i > 0 ? "md:border-l md:border-ink/15" : "md:pl-0"}`}>
              <span className="font-serif text-7xl leading-none text-sun" aria-hidden>“</span>
              <p className="font-serif text-2xl leading-snug">{t.quote}</p>
              <footer className="mt-6 text-[11px] uppercase tracking-[0.2em] text-stone-600">{t.name} · {t.role}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="hairline px-5 py-28 text-center md:py-44">
        <h2 className="display reveal mx-auto max-w-4xl text-5xl md:text-8xl">
          Let&apos;s make something <span className="marker">worth keeping.</span>
        </h2>
        <p className="mt-8 text-stone-600">A ₦{DEPOSIT_NGN.toLocaleString()} deposit secures your date.</p>
        <Link href="/book" className="btn-dark mt-10">Book a Session</Link>
      </section>

      <Footer />
    </>
  );
}