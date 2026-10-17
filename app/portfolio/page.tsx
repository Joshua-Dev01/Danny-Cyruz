import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioGallery from "@/components/PortfolioGallery";
import { site, DEPOSIT_NGN } from "@/lib/content";
import { fetchPortfolio } from "@/lib/portfolio-server";

// The page is rebuilt at most once a minute. Visitors who have it open get changes live anyway.
export const revalidate = 60;

export const metadata = {
  title: "Portfolio",
  description: "Weddings, portraits, events and more by Danny Cyruz.",
};

export default async function PortfolioPage() {
  const items = await fetchPortfolio();
  return (
    <>
      <Navbar />

      <header className="mx-auto max-w-7xl px-5 pb-10 font-sans! pt-32 md:px-10 md:pb-14 md:pt-44">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <p className="display animate-rise font-sans text-[3.2rem] leading-[0.95] md:text-[4.2rem]">
            Portfolio
          </p>
          <p className="max-w-xs text-stone-600 md:pb-3 md:text-right">
            Real moments from real clients 
          </p>
        </div>
      </header>

      <PortfolioGallery initial={items} />

      <section className="bg-ink px-5 py-20 text-center text-white md:py-28">
        <h2 className="display mx-auto max-w-2xl text-4xl md:text-6xl">
          Like what you see?
        </h2>
        <p className="mt-5 text-white/70">
          ₦{DEPOSIT_NGN.toLocaleString()} deposit secures your date.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/book" className="btn-dark">
            Book your date
          </Link>
          <a
            href={site.whatsapp}
            className="btn border border-white/40 hover:bg-white hover:text-ink"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}