import { getBrowserSupabase } from "@/lib/supabase-browser";

export const BUCKET = "media";

// Opens WhatsApp to a Nigerian number written any way (0803..., +234 803..., 234803...).
export function waLink(phone: string, text?: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "234" + d.slice(1);
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Uploads one file to Supabase Storage and returns its public link.
export async function uploadFile(file: File, folder: string): Promise<string> {
  const supabase = getBrowserSupabase();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Only files we uploaded live at .../object/public/media/<path>. Anything else (e.g. /1img.jpeg) is left alone.
export function storagePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

export async function removeFiles(urls: (string | null | undefined)[]) {
  const paths = urls.map(storagePath).filter((p): p is string => !!p);
  if (paths.length) await getBrowserSupabase().storage.from(BUCKET).remove(paths);
}

export function parseYouTubeId(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1, 12) || null;
    const q = u.searchParams.get("v");
    if (q) return q.slice(0, 11);
    const m = u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/);
    return m ? m[1] : null;
  } catch { return null; }
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomPasscode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(r).map((n) => chars[n % chars.length]).join("");
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
