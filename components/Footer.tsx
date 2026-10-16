import Link from "next/link";
import { site } from "@/lib/content";

const nav = ["portfolio", "services", "about", "contact", "book"];

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-sun text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-20 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <p className="max-w-sm font-serif text-3xl italic leading-snug">{site.tagline}</p>
          <Link href="/book" className="btn mt-8 bg-ink text-white hover:bg-white hover:text-ink">Book a Session</Link>
        </div>
        <div className="text-sm">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em]">Contact</p>
          <p>{site.phone}</p>
          <p>{site.email}</p>
          <p className="mt-3 text-ink/70">{site.address}</p>
          <p className="text-ink/70">{site.hours}</p>
        </div>
        <div className="text-sm">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em]">Explore</p>
          <ul className="grid gap-2">
            {nav.map((p) => (
              <li key={p}><Link href={`/${p}`} className="link-line capitalize">{p}</Link></li>
            ))}
          </ul>
          <div className="mt-6 flex gap-5">
            <a href={site.social.instagram} className="link-line" aria-label="Instagram">Instagram</a>
            <a href={site.social.facebook} className="link-line" aria-label="Facebook">Facebook</a>
            <a href={site.social.x} className="link-line" aria-label="X">X</a>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the bottom edge */}
      <p className="display mt-10 select-none whitespace-nowrap text-center text-[17vw] leading-[0.8] tracking-tighter" aria-hidden>
        {site.name}
      </p>
      <p className="border-t border-ink/15 py-5 text-center text-[11px] uppercase tracking-[0.2em] text-ink/70">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  );
}