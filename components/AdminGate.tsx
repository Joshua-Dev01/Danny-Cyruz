"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Avatar, Icon } from "@/components/admin/ui";

const nav = [
  { href: "/admin", name: "Overview", icon: "grid" },
  { href: "/admin/bookings", name: "Bookings", icon: "calendar" },
  { href: "/admin/enquiries", name: "Enquiries", icon: "mail" },
  { href: "/admin/portfolio", name: "Portfolio", icon: "image" },
  { href: "/admin/services", name: "Services", icon: "layers" },
  { href: "/admin/studio", name: "Studio", icon: "camera" },
  { href: "/admin/testimonials", name: "Testimonials", icon: "quote" },
  { href: "/admin/albums", name: "Client Albums", icon: "folder" },
];

// Wraps every admin page: shows it only to a signed-in admin and adds the sidebar and top bar.
// (The database also refuses non-admins through Row Level Security, so this is a convenience, not the only lock.)
// Mobile: a menu icon in the top bar opens the sidebar as a slide-out drawer. md and up: sidebar is always visible.
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace("/admin/login"); return; }
      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (!active) return;
      if (error || isAdmin !== true) { router.replace("/admin/login?reason=notadmin"); return; }
      setEmail(data.session.user.email ?? "");
      setReady(true);
    }
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") router.replace("/admin/login"); });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const supabase = getBrowserSupabase();
    const ch = supabase.channel("admin-live-badge").subscribe((s) => setLive(s === "SUBSCRIBED"));
    return () => { void supabase.removeChannel(ch); };
  }, [ready]);

  useEffect(() => { setMenu(false); }, [path]);

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  // full = labels always shown (desktop + the opened mobile menu); otherwise labels only from md up.
  const sidebar = (full: boolean) => {
    const lbl = full ? "inline" : "hidden md:inline";
    const row = full ? "justify-start px-3 py-2.5" : "justify-center py-3 md:justify-start md:px-3 md:py-2.5";
    return (
      <div className="flex h-full flex-col bg-slate-900 text-slate-300">
        <div className={`flex items-center gap-3 py-5 md:py-6 ${full ? "justify-start px-5" : "justify-center px-2 md:justify-start md:px-5"}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/40">DC</span>
          <div className={full ? "block" : "hidden md:block"}>
            <p className="text-sm font-bold tracking-wide text-white">DANNY CYRUZ</p>
            <p className="text-[11px] text-slate-400">Admin dashboard</p>
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${full ? "px-3" : "px-2 md:px-3"}`}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} title={n.name} aria-label={n.name} aria-current={isActive(n.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition ${row} ${isActive(n.href) ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "hover:bg-white/5 hover:text-white"}`}>
              <Icon name={n.icon} size={20} /><span className={lbl}>{n.name}</span>
            </Link>
          ))}
        </nav>

        <div className={full ? "m-3 rounded-xl bg-white/5 p-3" : "p-2 md:m-3 md:rounded-xl md:bg-white/5 md:p-3"}>
          <div className={`items-center gap-3 ${full ? "flex" : "hidden md:flex"}`}>
            <Avatar name={email || "Admin"} size={34} />
            <p className="min-w-0 truncate text-xs text-slate-300">{email}</p>
          </div>
          <button onClick={signOut} title="Sign out" aria-label="Sign out"
            className={`flex w-full items-center justify-center gap-2 text-xs font-semibold hover:bg-white/10 hover:text-white ${full ? "mt-3 rounded-lg bg-white/10 py-2 text-white" : "rounded-xl py-3 text-slate-300 md:mt-3 md:rounded-lg md:bg-white/10 md:py-2 md:text-white"}`}>
            <Icon name="logout" size={20} /><span className={lbl}>Sign out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-0 h-screen">{sidebar(true)}</div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 md:hidden">
              <Icon name="menu" size={20} />
            </button>
            <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />
              {live ? "Live updates on" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-500 sm:block">{email}</p>
            <Avatar name={email || "Admin"} size={34} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* Always mounted so it can animate: backdrop fades, drawer slides in/out. */}
      <div className={`fixed inset-0 z-50 md:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <button aria-label="Close menu" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] transition-opacity duration-300 ease-out ${menu ? "opacity-100" : "opacity-0"}`} />
        <div className={`relative h-full w-72 max-w-[85vw] transform-gpu shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${menu ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebar(true)}
          <button onClick={() => setMenu(false)} aria-label="Close menu" tabIndex={menu ? 0 : -1} className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><Icon name="x" size={20} /></button>
        </div>
      </div>
    </div>
  );
}