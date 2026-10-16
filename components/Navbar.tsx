"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/content";

const links = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/studio", label: "Studio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Set to true only if the top of your home page is a dark photo.
// With a white hero (the current one), the transparent header needs dark text.
const HERO_IS_DARK = false;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const transparent = path === "/" && !scrolled;
  const light = transparent && HERO_IS_DARK;

  // Shrink and solidify the header after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the page changes
  useEffect(() => setOpen(false), [path]);

  // Lock page scroll and allow Escape to close
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          transparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-ink/10 bg-white/90 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.25)] backdrop-blur-md"
        } ${light ? "text-white" : "text-ink"}`}
      >
        <div
          className={`mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center px-5 transition-all duration-500 md:grid-cols-[1fr_auto_1fr] md:px-10 ${
            scrolled ? "py-2.5" : "py-4 md:py-5"
          }`}
        >
          {/* Logo */}
          <Link href="/" aria-label={`${site.name} home`} className="flex items-center">
            <img
              src="/logo.png"
              alt={site.name}
              className={`w-auto transition-all duration-500 ${scrolled ? "h-9 md:h-11" : "h-10 md:h-14"}`}
            />
          </Link>

          {/* Desktop links */}
          <nav aria-label="Main" className="hidden items-center gap-10 md:flex lg:gap-14">
            {links.map((l) => {
              const active = path.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group relative py-2 text-[12px] font-medium uppercase tracking-[0.22em]"
                >
                  {l.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left bg-sun transition-transform duration-500 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden justify-end md:flex">
            <Link href="/book" className="btn-dark !px-7 !py-3.5">Book</Link>
          </div>

          {/* Mobile menu icon */}
          <button
            className="group flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-current/20 md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <span className="block h-[2px] w-5 bg-current transition-all group-active:w-3" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-3 self-end bg-current transition-all group-active:w-5 mr-[10px]" />
          </button>
        </div>
      </header>

      {/* Mobile: dimmed backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile: panel that slides in from the right */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-white px-7 pb-8 pt-6 text-ink shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Amber edge accent */}
        <span className="absolute inset-y-0 left-0 w-1 bg-sun" aria-hidden />

        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="" className="h-10 w-auto" />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-transform duration-500 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          >
            <span className="absolute h-[2px] w-5 rotate-45 bg-ink" />
            <span className="absolute h-[2px] w-5 -rotate-45 bg-ink" />
          </button>
        </div>

        <ul className="mt-10 flex-1">
          {links.map((l, i) => {
            const active = path.startsWith(l.href);
            return (
              <li
                key={l.href}
                className={`border-b border-ink/10 transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between py-4 font-serif text-[2.1rem] leading-none"
                >
                  <span className={active ? "underline decoration-sun decoration-[3px] underline-offset-8" : ""}>{l.label}</span>
                  <span className="text-xl text-sun-deep transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          style={{ transitionDelay: open ? "550ms" : "0ms" }}
        >
          <Link href="/book" onClick={() => setOpen(false)} className="btn-dark w-full">Book a session</Link>
          <div className="mt-6 flex items-center justify-between text-sm text-stone-600">
            <a href={`mailto:${site.email}`} className="link-line">{site.email}</a>
            <a href={site.whatsapp} className="link-line">WhatsApp</a>
          </div>
        </div>
      </nav>
    </>
  );
}