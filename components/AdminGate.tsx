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
  { href: "/admin/testimonials", name: "Testimonials", icon: "quote" },
  { href: "/admin/albums", name: "Client Albums", icon: "folder" },
];

// Wraps every admin page: shows it only to a signed-in admin and adds the sidebar and top bar.
// (The database also refuses non-admins through Row Level Security, so this is a convenience, not the only lock.)
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
  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/40">DC</span>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">DANNY CYRUZ</p>
          <p className="text-[11px] text-slate-400">Admin dashboard</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <Link key={n.href} href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive(n.href) ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "hover:bg-white/5 hover:text-white"}`}>
            <Icon name={n.icon} size={19} />{n.name}
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-xl bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={email || "Admin"} size={34} />
          <p className="min-w-0 truncate text-xs text-slate-300">{email}</p>
        </div>
        <button onClick={signOut} className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden w-64 shrink-0 md:block"><div className="sticky top-0 h-screen">{sidebar}</div></aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenu(true)} aria-label="Open menu" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium md:hidden">Menu</button>
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

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-slate-900/60" onClick={() => setMenu(false)} />
          <div className="relative h-full w-72 max-w-[85vw]">{sidebar}</div>
        </div>
      )}
    </div>
  );
}