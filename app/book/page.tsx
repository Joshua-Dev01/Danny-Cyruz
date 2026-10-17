import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { DEPOSIT_NGN, services } from "@/lib/content";

export const metadata = {
  title: "Book a Session",
  description: "Book a photography session or hire the studio. A small deposit holds your date.",
};

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";

export default function BookPage({ searchParams }: { searchParams: { service?: string } }) {
  // Accepts a service name or slug from a link, e.g. /book?service=Space%20Rental
  const q = (searchParams.service ?? "").trim().toLowerCase();
  const match =
    services.find((s) => s.name.toLowerCase() === q || s.slug === q) ??
    (q.includes("studio") || q.includes("rental") ? services.find((s) => s.slug === "studio") : undefined);
  const initialService = match?.name ?? (q.includes("event") || q.includes("wedding") || q.includes("birthday") ? "Events" : "");

  // EDIT: policies shown before booking. Must match the terms in the booking form.
  const facts = [
    { t: `₦${DEPOSIT_NGN.toLocaleString()} deposit`, d: "Holds your date. It is deducted from your final bill." },
    { t: "Balance on the day", d: "The rest is paid on the day of your session." },
    { t: "48-hour rescheduling", d: "Free to move your date up to 48 hours before." },
    { t: "7 to 14 day delivery", d: "Edited photos arrive in a private online gallery." },
  ];

  return (
    <>
      <Navbar />
      <main>
        <header className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-10 md:pb-12 md:pt-36">
          <p className={label}>Reservations</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="display animate-rise text-[2rem] uppercase leading-none md:text-[3rem]">Book a session.</h1>
            <p className="max-w-xs text-sm text-stone-600 md:text-right">
              Five short steps. You pay a small deposit now and the balance on the day.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
          <BookingForm initialService={initialService} />
        </div>

        <section className="border-t border-ink/10">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
            <p className={label}>Before you book</p>
            <div className="mt-6 grid border border-ink/10 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((f, i) => (
                <div key={f.t} className={`p-6 ${i > 0 ? "border-t border-ink/10 sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i > 1 ? "sm:border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""} border-ink/10`}>
                  <p className={label}>0{i + 1}</p>
                  <h2 className="mt-3 text-sm font-medium uppercase tracking-wide">{f.t}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}