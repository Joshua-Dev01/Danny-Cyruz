// Makes images small and fast through Cloudinary, with no manual uploading.
//
// 1. Photos in your /public folder (like "/1img.jpeg"): Cloudinary fetches them from your live site
//    the first time, shrinks them, converts them to WebP/AVIF, and serves them from its fast CDN.
//    Needs NEXT_PUBLIC_CLOUDINARY_CLOUD and NEXT_PUBLIC_SITE_URL to be set (see below).
// 2. Photos that are already Cloudinary links: a width limit, auto format and auto quality are added.
// 3. Anything else is left exactly as it is, so the site never breaks.
//
// Env vars (Vercel / .env.local):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD = your cloud name, from the top of your Cloudinary dashboard
//   NEXT_PUBLIC_SITE_URL         = your live site, e.g. https://dannycyruz.com  (no slash at the end)
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export function cld(url: string, width: number): string {
  const t = `f_auto,q_auto,w_${width},c_limit`;

  if (url.startsWith("/") && !url.startsWith("//")) {
    // Cloudinary can only fetch from a public address, so this stays off on localhost.
    if (!CLOUD || !SITE || SITE.includes("localhost")) return url;
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${t}/${SITE}${url}`;
  }
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/${t}/`);
  }
  return url;
}
