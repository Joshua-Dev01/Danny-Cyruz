"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/content";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ overHero = false }: { overHero?: boolean }) {
  const [open, setOpen] = useState(false);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const tone = overHero && !open ? "text-white" : "text-ink";

  return (
    <>
      <header className={`absolute inset-x-0 top-0 z-40 ${tone}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
          <Link href="/" className="flex items-center gap-3 font-serif text-2xl font-medium" onClick={() => setOpen(false)}>
            <span className="inline-block h-3 w-3 bg-sun" aria-hidden />
            {site.name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-10 text-[12px] font-medium uppercase tracking-[0.18em] md:flex">
            {links.slice(1).map((l) => (
              <Link key={l.href} href={l.href} className="link-line">{l.label}</Link>
            ))}
            <Link href="/book" className="btn-dark !px-6 !py-3">Book a Session</Link>
          </nav>

          <button
            className="text-[12px] font-medium uppercase tracking-[0.18em] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-0 z-30 flex flex-col bg-white px-5 pb-10 pt-28 text-ink md:hidden">
          <ul className="flex-1">
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-ink/10">
                <Link href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4 font-serif text-4xl">
                  <span className="font-sans text-[11px] tracking-[0.2em] text-stone-400">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book" onClick={() => setOpen(false)} className="btn-dark">Book a Session</Link>
        </nav>
      )}
    </>
  );
}