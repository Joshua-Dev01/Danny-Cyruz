import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import { DEPOSIT_NGN, img, services, site } from "@/lib/content";

export const metadata = {
  title: "Studio",
  description: "Daylight photography studio for hire by the hour. Book the Danny Cyruz studio.",
};

/* ------------------------------------------------------------------
   EDIT THESE. Everything below the "EDIT" markers is placeholder text
   taken from the Stitch design. Replace it with Danny's real details
   before the site goes live. Swap the photo URLs for real studio photos
   (put them in /public/studio/ and use "/studio/1.jpg" etc).
------------------------------------------------------------------- */

// EDIT: location line under the page title
const location = "Lekki Phase 1 • Lagos • Daylight & blackout facility";

// EDIT: studio photos (first one is the big hero)
const photos = [
  { src: img("dc-s4", 1800, 1000), caption: "01 / Main daylight bay & white cyclorama" },
  { src: img("dc-r3", 1400, 1000), caption: "02 / Wide view of the space" },
  { src: img("dc-s3", 900, 1100), caption: "03 / Seamless backdrop system" },
  { src: img("dc-s1", 900, 1100), caption: "04 / Lighting & strobe setup" },
  { src: img("dc-s2", 900, 1100), caption: "05 / Private changing room" },
  { src: img("dc-r5", 900, 1000), caption: "06 / Props & styling corner" },
];

// EDIT: facts about the space
const specs = [
  { k: "Size", v: "4,800 sq ft double-height loft + 20ft infinity cove" },
  { k: "Light", v: "Natural diffused Northern daylight + 100% full blackout blinds" },
  { k: "Power", v: "Uninterrupted 3-phase commercial power & dedicated standby generator" },
  { k: "Air conditioning", v: "Silent central climate control for delicate styling and audio recording" },
  { k: "Changing room", v: "Private lockable vanity suite, arched illuminated mirror & clothes steamer" },
  { k: "Parking", v: "Secure on-site parking for up to 8 production crew vehicles" },
];

// EDIT: equipment that is really in the studio
const included = [
  {
    title: "Lighting & grip",
    items: ["Continuous light fixtures", "Studio strobes with softboxes", "Heavy-duty stainless steel C-stands with grip arms", "Sandbags and shot bags"],
  },
  {
    title: "Backdrops & modifiers",
    items: ["Seamless white cyclorama cove wall", "Colorama seamless paper rolls (Stone, White, Black)", "Large diffusion panels and reflectors", "Strip softboxes"],
  },
  {
    title: "Props & production",
    items: ["Solid oak studio stools and minimal benches", "Industrial garment racks with wooden hangers", "Professional high-pressure fabric steamer", "High-speed Wi-Fi"],
  },
];

// EDIT: studio rules
const rules = [
  { title: "Maximum capacity", text: "Maximum 20 people on set including crew, models and clients." },
  { title: "Call times", text: "Arrive and set up inside your booked slot. Early access can be arranged on request." },
  { title: "Food & beverages", text: "Bottled water and dry snacks allowed in the lounge. No food or coloured drinks on the cyclorama." },
  { title: "Cancellations", text: `Free rescheduling up to 48 hours before the session. The ₦${DEPOSIT_NGN.toLocaleString()} deposit is non-refundable after that.` },
];

// EDIT: real address and hours
const address = "Plot 140 Admiralty Way, Lekki Phase 1, Lagos, Nigeria";
const hours = "Monday to Sunday, 08:00 – 22:00 (pre-booked sessions only)";
const access = "Easily accessible from Lekki Toll Gate. Secure gated compound with 24/7 security.";

/* ------------------------------------------------------------------ */

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";
const section = "mx-auto max-w-7xl border-t border-ink/10 px-5 py-14 md:px-10 md:py-20";

export default function StudioPage() {
  const studio = services.find((s) => s.slug === "studio")!;
  const bookHref = `/book?service=${encodeURIComponent(studio.name)}`;
  const [hero, ...gallery] = photos;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-10 md:pb-14 md:pt-36">
        <p className={label}>{location}</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="display animate-rise text-[3.2rem] uppercase leading-none md:text-[4.5rem]">The Studio.</h1>
            <p className="mt-4 max-w-md text-sm text-stone-600">Daylight space for shoots, lookbooks and content.</p>
          </div>
          <Link href={bookHref} className="btn-dark w-full shrink-0 md:w-auto">
            Reserve the studio
          </Link>
        </div>
        <div className="zoom mt-8 aspect-[4/3] bg-stone-100 md:mt-10 md:aspect-[16/8]">
          <Photo src={hero.src} alt="Photography studio" eager />
        </div>
      </header>

      {/* The space: gallery */}
      <section className={section}>
        <p className={label}>01 / Atelier overview</p>
        <h2 className="display mt-3 text-4xl uppercase md:text-5xl">The space.</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-6 md:gap-4">
          {gallery.map((p, i) => (
            <figure key={p.caption} className={`${i === 0 ? "col-span-2 md:col-span-4" : "md:col-span-2"}`}>
              <div className={`zoom bg-stone-100 ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5] md:aspect-[4/3]"}`}>
                <Photo src={p.src} alt={p.caption} />
              </div>
              <figcaption className={`mt-2 ${label}`}>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* About the space */}
      <section className={section}>
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className={label}>02 / The details</p>
            <h2 className="display mt-3 text-4xl uppercase md:text-5xl">About the space.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-600">{studio.blurb}</p>
          </div>
          <dl className="md:col-span-7">
            {specs.map((r) => (
              <div key={r.k} className="grid gap-1 border-t border-ink/10 py-4 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className={label}>{r.k}</dt>
                <dd className="text-sm">{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What's included */}
      <section className={section}>
        <p className={label}>03 / Studio assets</p>
        <h2 className="display mt-3 text-4xl uppercase md:text-5xl">What&apos;s included.</h2>
        <p className="mt-4 text-sm text-stone-600">All studio rentals include this equipment at no extra cost.</p>
        <div className="mt-8 grid border border-ink/10 md:mt-10 md:grid-cols-3">
          {included.map((g, i) => (
            <div key={g.title} className={`p-6 md:p-8 ${i > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""}`}>
              <p className={label}>{g.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-600">
                {g.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span aria-hidden>–</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={section}>
        <p className={label}>04 / Rates</p>
        <h2 className="display mt-3 text-4xl uppercase md:text-5xl">Studio hire pricing.</h2>
        <div className="mt-8 grid border border-ink/10 md:mt-10 md:grid-cols-2">
          {studio.packages.map((p, k) => (
            <div key={p.tag} className={`flex flex-col p-6 md:p-10 ${k > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""}`}>
              <p className={label}>{p.tag}</p>
              <h3 className="mt-3 text-lg font-medium uppercase tracking-wide md:text-xl">{p.title}</h3>
              <p className="mt-4 text-4xl font-medium md:text-5xl">₦{p.price.toLocaleString()}</p>
              <p className="mt-4 flex-1 border-t border-ink/10 pt-4 text-sm text-stone-600">{p.detail}</p>
              <Link
                href={bookHref}
                className={`btn mt-6 w-full ${k === 0 ? "bg-ink text-white hover:bg-stone-600" : "border border-ink hover:bg-ink hover:text-white"}`}
              >
                {k === 0 ? "Book 1 hour" : "Book 30 mins"}
              </Link>
            </div>
          ))}
        </div>
        <p className={`mt-4 ${label}`}>
          ₦{DEPOSIT_NGN.toLocaleString()} deposit holds your date. Balance paid on the day.
        </p>
      </section>

      {/* House rules */}
      <section className={section}>
        <p className={label}>05 / Protocols</p>
        <h2 className="display mt-3 text-4xl uppercase md:text-5xl">House rules.</h2>
        <div className="mt-8 grid border border-ink/10 sm:grid-cols-2 md:mt-10 md:grid-cols-4">
          {rules.map((r, i) => (
            <div key={r.title} className={`p-6 ${i > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""} ${i === 2 ? "sm:border-l-0 md:border-l" : ""}`}>
              <p className={label}>0{i + 1}</p>
              <h3 className="mt-3 text-sm font-medium uppercase tracking-wide">{r.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className={section}>
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className={label}>06 / Find us</p>
            <h2 className="display mt-3 text-4xl uppercase md:text-5xl">Location &amp; access.</h2>
            <dl className="mt-8 space-y-6 text-sm">
              <div>
                <dt className={label}>Address</dt>
                <dd className="mt-2">{address}</dd>
              </div>
              <div>
                <dt className={label}>Operating hours</dt>
                <dd className="mt-2">{hours}</dd>
              </div>
              <div>
                <dt className={label}>Directions &amp; security</dt>
                <dd className="mt-2 text-stone-600">{access}</dd>
              </div>
            </dl>
          </div>
          {/* Map placeholder: replace with a Google Maps embed when the address is final */}
          <div className="relative flex aspect-[4/3] items-center justify-center border border-ink/10 bg-stone-100 md:col-span-7 md:aspect-auto md:min-h-[22rem]">
            <span className={`bg-white px-4 py-2 ${label}`}>Danny Cyruz Studio</span>
          </div>
        </div>
      </section>

      {/* Book */}
      <section className={`${section} text-center md:text-left`}>
        <p className={label}>07 / Reservation</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="display text-5xl uppercase md:text-7xl">Hold your date.</h2>
            <p className="mt-4 text-sm text-stone-600">Select your desired slot or reach out to the studio coordinator directly.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={bookHref} className="btn-dark">
              Reserve space
            </Link>
            <a href={site.whatsapp} className="btn border border-ink hover:bg-ink hover:text-white">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}