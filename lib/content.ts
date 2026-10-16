// Single place to edit brand, services and prices. Later these can be read from Supabase instead.
export const DEPOSIT_NGN = 5500; // paid first to secure any booking

export const site = {
  name: "Danny Cyruz",
  tagline: "Capturing Moments. Creating Memories.",
  intro:
    "Honest, light-led photography for weddings, portraits, events and brands. I slow things down so the people in front of the camera can simply be themselves.",
  phone: "+234 000 000 0000",
  email: "hello@dannycyruz.com",
  whatsapp: "https://wa.me/2340000000000",
  address: "Studio address, City, Nigeria",
  hours: "Mon to Sat, 9am to 6pm",
  social: { instagram: "https://instagram.com/", facebook: "https://facebook.com/", x: "https://x.com/" },
};

const img = (seed: string, w = 1200, h = 1600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const images = {
  hero: img("dc-hero", 2400, 1400),
  about: img("dc-portrait", 1000, 1300),
  featured: [img("dc-f1", 1400, 1000), img("dc-f2", 900, 1200), img("dc-f3", 900, 1200), img("dc-f4", 1400, 1000)],
};

export type Service = {
  slug: string; name: string; blurb: string; image: string;
  from: number; // naira, placeholder
  includes: string[];
};

export const services: Service[] = [
  { slug: "wedding", name: "Weddings", blurb: "Full-day coverage from getting ready to the last dance.", image: img("dc-s1"), from: 350000, includes: ["Full-day coverage", "Edited online gallery", "Second shooter available"] },
  { slug: "portrait", name: "Portraits", blurb: "Personal, family and graduation sessions, indoors or on location.", image: img("dc-s2"), from: 60000, includes: ["1 hour session", "15 edited photos", "Two outfit changes"] },
  { slug: "event", name: "Birthdays & Events", blurb: "Candid coverage of the moments guests will want to remember.", image: img("dc-s3"), from: 90000, includes: ["Up to 4 hours", "Edited online gallery", "Same-week previews"] },
  { slug: "studio", name: "Studio Sessions", blurb: "Controlled lighting and seamless backdrops for clean, bold results.", image: img("dc-s4"), from: 45000, includes: ["Studio time included", "Backdrop of your choice", "10 edited photos"] },
  { slug: "fashion-commercial", name: "Fashion & Commercial", blurb: "Lookbooks, campaigns and product work for brands.", image: img("dc-s5"), from: 150000, includes: ["Creative direction call", "Retouched final images", "Usage licence"] },
];

export const testimonials = [
  { name: "Client name", role: "Wedding, 2026", quote: "Danny made us feel completely at ease. We forgot the camera was there, and the photos still feel like us." },
  { name: "Client name", role: "Brand shoot", quote: "Clear communication, fast delivery and images that lifted our whole campaign." },
  { name: "Client name", role: "Portrait session", quote: "I usually hate being photographed. These are the first photos of myself I love." },
];
