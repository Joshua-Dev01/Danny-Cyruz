import Link from "next/link";
import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PayButton from "@/components/PayButton";
import { settlePayment, type Settled } from "@/lib/payments";
import { DEPOSIT_NGN, site } from "@/lib/content";

export const metadata = { title: "Payment" };
export const dynamic = "force-dynamic";

const pretty = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function ConfirmedPage({ searchParams }: { searchParams: { reference?: string; trxref?: string } }) {
  const ref = (searchParams.reference ?? searchParams.trxref ?? "").trim();
  let result: Settled = { state: "unknown" };
  if (ref) {
    try { result = await settlePayment(ref); } catch { result = { state: "unknown" }; }
  }
  const b = result.booking;

  return (
    <>
      <Navbar />
      <main className="bg-neutral-50 px-5 pb-20 pt-28 md:pt-36">
        <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200 bg-white p-7 text-center shadow-sm md:p-10">
          {result.state === "paid" && b && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white"><Check size={30} strokeWidth={3} /></div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">Deposit received</h1>
              <p className="mt-2 text-neutral-600">Thank you. Your ₦{DEPOSIT_NGN.toLocaleString()} deposit is paid.</p>
              <div className="mt-6 rounded-2xl bg-neutral-100 p-5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Reference</p>
                <p className="mt-1 text-xl font-semibold tracking-wider">{b.reference}</p>
                <p className="mt-3 text-neutral-600">{b.service} · {pretty(b.event_date)}</p>
              </div>
              <p className="mt-6 text-neutral-600">We will confirm your date on WhatsApp or email within 24 hours.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={`${site.whatsapp}?text=${encodeURIComponent(`Hello Danny, I just paid my deposit for booking ${b.reference}.`)}`} className="flex flex-1 items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-neutral-700">Message us on WhatsApp</a>
                <Link href="/" className="flex flex-1 items-center justify-center rounded-full border border-neutral-300 px-6 py-4 text-sm font-semibold hover:bg-neutral-100">Back to home</Link>
              </div>
            </>
          )}

          {result.state === "failed" && b && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200"><X size={28} /></div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">Payment not completed</h1>
              <p className="mt-2 text-neutral-600">Your booking <strong>{b.reference}</strong> is saved, but your date is not held until the deposit is paid.</p>
              <div className="mt-8"><PayButton reference={b.reference} label={`Pay ₦${DEPOSIT_NGN.toLocaleString()} deposit`} /></div>
              <p className="mt-4 text-sm text-neutral-500">If money left your account, wait a few minutes and refresh this page. It updates by itself.</p>
            </>
          )}

          {result.state === "unknown" && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">We could not find that payment</h1>
              <p className="mt-3 text-neutral-600">If you just paid, message us with your reference code and we will sort it out.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={site.whatsapp} className="flex flex-1 items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white hover:bg-neutral-700">Chat on WhatsApp</a>
                <Link href="/book" className="flex flex-1 items-center justify-center rounded-full border border-neutral-300 px-6 py-4 text-sm font-semibold hover:bg-neutral-100">Book again</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}