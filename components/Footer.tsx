import Link from "next/link";
import { site, DEPOSIT_NGN } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 text-sm md:grid-cols-4 md:px-10">
        <div>
          <p className="font-serif text-xl tracking-[0.06em]">{site.name.toUpperCase()}</p>
          <p className="mt-4 max-w-[16rem] text-stone-600">{site.tagline}</p>
        </div>
        <div>
          <p className="mb-3 font-medium">Studio</p>
          <p className="text-stone-600">{site.address}</p>
          <p className="text-stone-600">{site.hours}</p>
        </div>
        <div>
          <p className="mb-3 font-medium">Get in touch</p>
          <a href={`mailto:${site.email}`} className="link-line text-stone-600">{site.email}</a>
          <p className="mt-1 text-stone-600">{site.phone}</p>
          <div className="mt-4 flex gap-5">
            <a href={site.social.instagram} className="link-line">Instagram</a>
            <a href={site.whatsapp} className="link-line">WhatsApp</a>
          </div>
        </div>
        <div>
          <p className="mb-3 font-medium">Booking</p>
          <p className="text-stone-600">A ₦{DEPOSIT_NGN.toLocaleString()} deposit secures your date. We reply within 24 hours.</p>
        </div>
      </div>
      <p className="border-t border-ink/10 px-5 py-5 text-center text-[11px] tracking-[0.12em] text-stone-600 md:px-10">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  );
}