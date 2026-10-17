import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { DEPOSIT_NGN, site, testimonials } from "@/lib/content";

export const metadata = {
  title: "About",
  description: "Meet Danny Cyruz, photographer and cinematographer in Lagos and Abuja.",
};

/* ------------------------------------------------------------------
   EDIT THESE. The bio, numbers and process text below are placeholders
   from the Stitch design. Replace them with Danny's real story.
   Put a real photo of Danny in /public (e.g. /public/danny.jpg) and
   change `portrait` to "/danny.jpg".
------------------------------------------------------------------- */

const portrait = "/3img.jpeg"; // EDIT: replace with a photo of Danny
const portraitCaption = "01 / Danny Cyruz • Photographer & cinematographer";

const bio = {
  lead: "I picked up my first camera ten years ago on the quiet streets of Lagos. What began as a fixation with northern afternoon light quickly evolved into a dedicated pursuit: documenting human presence with calm honesty and unhurried composition.",
  paragraphs: [
    "My work spans editorial portraits, quiet commercial work, intimate weddings and architectural spaces. Whether working on medium format film or cinema sensors, I prioritise authentic posture, gentle daylight and timeless tones.",
    "Based between our daylight studio in Lekki Phase 1, Lagos, and private commissions in Abuja, I work with individuals, brands and families who appreciate understated craftsmanship and lasting keepsakes.",
  ],
  medium: "Medium format film, digital full frame",
  light: "North daylight, unfiltered",
};

const numbers = [
  { n: "10+", l: "Years of practice" },
  { n: "450+", l: "Sessions & archives" },
  { n: "180+", l: "Weddings & events" },
  { n: "02", l: "Cities (Lagos & Abuja)" },
];

const process = [
  { t: "The creative dialogue", d: "Every shoot begins with a conversation about mood, tone and what matters to you. We map out wardrobe, lighting and creative references before touching a camera." },
  { t: "Quiet cadence", d: "On set, sessions are quiet and unhurried. Natural daylight, gentle guidance and no awkward staging allow genuine posture and emotion to surface naturally." },
  { t: "Careful handover", d: "Every frame is hand-edited and colour-graded to a high standard. Finished galleries are delivered in a private online gallery within 14 days." },
];

// Real photos from /public
const field = [
  { src: "/1img.jpeg", caption: "01 / On set • Natural light" },
  { src: "/3img.jpeg", caption: "02 / Studio portrait • Soft daylight" },
  { src: "/hero2.jpeg", caption: "03 / Portrait • Warm tones" },
];

/* ------------------------------------------------------------------ */

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";
const section = "mx-auto max-w-7xl border-t border-ink/10 px-5 py-14 md:px-10 md:py-20";

export default function AboutPage() {
  const t = testimonials[0];

  return (
    <>
      <Navbar />

      {/* Intro */}
      <header className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-10 md:pb-16 md:pt-40">
        <p className={label}>Lagos and Abuja, Nigeria</p>
        <h1 className="display animate-rise mt-4 text-[3.2rem] uppercase leading-none md:text-[4.5rem]">About.</h1>
        <p className="mt-4 text-sm text-stone-600">{site.tagline}</p>
      </header>

      {/* The photographer */}
      <section className={section}>
        <p className={label}>01 / The photographer</p>
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
          <figure className="md:col-span-5">
            <div className="zoom aspect-[4/5] bg-stone-100">
              <Photo src={portrait} alt="Danny Cyruz" className="object-top" eager />
            </div>
            <figcaption className={`mt-3 ${label}`}>{portraitCaption}</figcaption>
          </figure>
          <div className="md:col-span-7 md:pt-2">
            <p className={label}>Biographical note</p>
            <p className="mt-5 text-lg leading-relaxed md:text-xl">{bio.lead}</p>
            {bio.paragraphs.map((p) => (
              <p key={p.slice(0, 20)} className="mt-6 max-w-xl text-sm leading-relaxed text-stone-600">{p}</p>
            ))}
            <dl className="mt-10 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-2">
              <div>
                <dt className={label}>Medium</dt>
                <dd className="mt-2 text-sm">{bio.medium}</dd>
              </div>
              <div>
                <dt className={label}>Primary light</dt>
                <dd className="mt-2 text-sm">{bio.light}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className={section}>
        <p className={label}>02 / In numbers</p>
        <div className="mt-8 grid grid-cols-2 border border-ink/10 md:grid-cols-4">
          {numbers.map((m, i) => (
            <div
              key={m.l}
              className={`p-6 md:p-10 ${i % 2 === 1 ? "border-l border-ink/10" : ""} ${i > 1 ? "border-t border-ink/10 md:border-t-0" : ""} ${i > 0 ? "md:border-l" : ""}`}
            >
              <p className="text-4xl font-medium md:text-6xl">{m.n}</p>
              <p className={`mt-3 ${label}`}>{m.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How I work */}
      <section className={section}>
        <p className={label}>03 / How I work</p>
        <div className="mt-8 grid gap-0 md:grid-cols-3">
          {process.map((s, i) => (
            <div key={s.t} className={`border-t border-ink/10 py-6 first:border-t-0 md:border-t-0 md:py-0 ${i > 0 ? "md:border-l md:pl-8" : "md:pr-8"}`}>
              <p className={label}>0{i + 1}</p>
              <h3 className="mt-3 text-sm font-medium uppercase tracking-wide">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* In the field */}
      <section className={section}>
        <p className={label}>04 / In the field</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {field.map((f) => (
            <figure key={f.caption}>
              <div className="zoom aspect-[4/5] bg-stone-100">
                <Photo src={f.src} alt={f.caption} />
              </div>
              <figcaption className={`mt-2 ${label}`}>{f.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Endorsement */}
      <section className={section}>
        <p className={label}>05 / Kind words</p>
        <blockquote className="mt-8 max-w-3xl text-2xl leading-snug md:text-3xl">“{t.quote}”</blockquote>
        <p className={`mt-6 ${label}`}>— {t.name}</p>
      </section>

      {/* Commissions */}
      <section className={section}>
        <p className={label}>06 / Commissions</p>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="display text-4xl uppercase md:text-6xl">Let&apos;s work together.</h2>
            <p className="mt-4 max-w-md text-sm text-stone-600">
              Reserve a session at our daylight studio or discuss a location commission across Nigeria.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn-dark">Book a session</Link>
            <Link href="/contact" className="btn border border-ink hover:bg-ink hover:text-white">Contact</Link>
          </div>
        </div>
        <p className={`mt-10 border-t border-ink/10 pt-4 ${label}`}>
          ₦{DEPOSIT_NGN.toLocaleString()} deposit holds your date. Balance paid on the day.
        </p>
      </section>

      <Footer />
    </>
  );
}