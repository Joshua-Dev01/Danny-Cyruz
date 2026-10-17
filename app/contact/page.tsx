import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Photo from "@/components/Photo";
import ContactForm from "@/components/ContactForm";
import { DEPOSIT_NGN, services, site } from "@/lib/content";

export const metadata = {
  title: "Contact",
  description: "Contact Danny Cyruz to book a photography session or hire the studio.",
};

/* ------------------------------------------------------------------
   EDIT THESE. Addresses and FAQ answers are placeholders from the
   Stitch design. Replace them with Danny's real details.
------------------------------------------------------------------- */

const ateliers = [
  { no: "01 / Lagos", name: "Lekki daylight space", address: "Lekki Phase 1, Lagos, Nigeria" }, // EDIT
  { no: "02 / Abuja", name: "Maitama creative quarters", address: "Maitama, FCT Abuja, Nigeria" }, // EDIT
];

const faqs = [
  { q: "How do I book?", a: `Choose a service, send an enquiry or use the booking page, then confirm your slot with the ₦${DEPOSIT_NGN.toLocaleString()} deposit. You will get a WhatsApp or email confirmation.` },
  { q: "How long until I get my photos?", a: "Edited photos are delivered in a private online gallery within 7 to 14 days." }, // EDIT
  { q: "Do you travel?", a: "Yes. Sessions are available across Nigeria (Lagos, Abuja, Port Harcourt) and further afield on request." }, // EDIT
  { q: "What is your cancellation policy?", a: `You can reschedule free of charge up to 48 hours before your session. After that, the ₦${DEPOSIT_NGN.toLocaleString()} deposit is not refundable.` }, // EDIT
];

/* ------------------------------------------------------------------ */

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";
const section = "mx-auto max-w-7xl border-t border-ink/10 px-5 py-14 md:px-10 md:py-20";

export default function ContactPage() {
  const studio = services.find((s) => s.slug === "studio")!;
  const phones = [site.phone, site.phone2];
  const handle = site.social.instagram.split("/").filter(Boolean).pop();

  return (
    <>
      <Navbar />

      {/* Intro */}
      <header className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-10 md:pb-16 md:pt-40">
        <p className={label}>{site.hours}</p>
        <h1 className="display animate-rise mt-4 text-[3.2rem] uppercase leading-none md:text-[4.5rem]">Contact.</h1>
        <p className="mt-4 text-sm text-stone-600">Tell me about your shoot and I will reply within 24 hours.</p>
      </header>

      {/* Details + form */}
      <section className={section}>
        <p className={label}>01 / Get in touch</p>
        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <dl className="divide-y divide-ink/10 border-y border-ink/10 text-sm">
              <div className="py-4">
                <dt className={label}>Email</dt>
                <dd className="mt-2"><a href={`mailto:${site.email}`} className="break-all hover:underline">{site.email}</a></dd>
              </div>
              <div className="py-4">
                <dt className={label}>Phone</dt>
                <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                  {phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="py-1 hover:underline">{p}</a>
                  ))}
                </dd>
              </div>
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={label}>WhatsApp</p>
                  <p className="mt-2 text-stone-600">Quick answers and date checks</p>
                </div>
                <a href={site.whatsapp} className="btn-dark !px-5 !py-3">Chat on WhatsApp</a>
              </div>
              <div className="py-4">
                <dt className={label}>Instagram</dt>
                <dd className="mt-2"><a href={site.social.instagram} className="hover:underline">@{handle}</a></dd>
              </div>
              <div className="py-4">
                <dt className={label}>Locations</dt>
                <dd className="mt-2">{site.address}</dd>
              </div>
              <div className="py-4">
                <dt className={label}>Hours</dt>
                <dd className="mt-2">{site.hours}</dd>
              </div>
            </dl>
            <figure className="mt-8 hidden md:block">
              <div className="zoom aspect-[4/5] bg-stone-100">
                <Photo src={studio.image} alt="Danny Cyruz studio" />
              </div>
              <figcaption className={`mt-2 ${label}`}>Daylight studio • By appointment</figcaption>
            </figure>
          </div>

          <div className="md:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Deposit strip */}
      <div className="border-y border-ink/10 bg-stone-100">
        <p className="mx-auto max-w-7xl px-5 py-5 text-center text-[11px] font-medium uppercase tracking-[0.14em] md:px-10">
          A ₦{DEPOSIT_NGN.toLocaleString()} deposit holds your date. The balance is paid on the day.
        </p>
      </div>

      {/* Locations */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <p className={label}>02 / Where to find me</p>
        <div className="mt-8 grid border border-ink/10 md:grid-cols-2">
          {ateliers.map((a, i) => (
            <div key={a.no} className={`p-6 md:p-10 ${i > 0 ? "border-t border-ink/10 md:border-l md:border-t-0" : ""}`}>
              <p className={label}>{a.no}</p>
              <h3 className="mt-4 text-lg font-medium uppercase tracking-wide">{a.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{a.address}</p>
              {/* Map placeholder: replace with a Google Maps embed when addresses are final */}
              <div className="mt-6 flex aspect-[16/7] items-center justify-center border border-ink/10 bg-stone-100">
                <span className={`bg-white px-3 py-1.5 ${label}`}>Map</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={section}>
        <p className={label}>03 / Quick questions</p>
        <div className="mt-8">
          {faqs.map((f, i) => (
            <div key={f.q} className="grid gap-3 border-t border-ink/10 py-6 last:border-b md:grid-cols-12 md:gap-8">
              <h3 className="text-sm font-medium uppercase tracking-wide md:col-span-5">
                <span className={`mr-3 ${label}`}>0{i + 1}</span>
                {f.q}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 md:col-span-7">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}