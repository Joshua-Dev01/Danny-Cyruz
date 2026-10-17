"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { site } from "@/lib/content";

const label = "text-[10px] uppercase tracking-[0.18em] text-stone-600";

// Wrap every admin page in this. It shows the page only to a signed-in admin.
// Anyone else is sent to the login page. (The database also refuses their requests, so this is
// a convenience on top of Row Level Security, not the only lock.)
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let active = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) { router.replace("/admin/login"); return; }
      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (!active) return;
      if (error || isAdmin !== true) {
        // Not an admin (could be a signed-in client): send them away without signing them out.
        router.replace("/admin/login?reason=notadmin");
        return;
      }
      setEmail(session.user.email ?? "");
      setReady(true);
    }
    void check();

    // Signing out in another tab signs out here too.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/admin/login");
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router]);

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center">
        <p className={label}>Checking sign-in…</p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div>
            <p className={label}>Admin</p>
            <p className="text-sm font-medium uppercase tracking-wide">{site.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-xs text-stone-600 sm:block">{email}</p>
            <button type="button" onClick={signOut} className="border border-ink/20 px-4 py-2 text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}