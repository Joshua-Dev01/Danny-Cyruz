export const site = {
  name: "Danny Cyruz",
  intro:
    "Unhurried, light-led photography and film for weddings, portraits, events and brands in Lagos, Abuja and beyond.",
  address: "Lagos and Abuja, Nigeria",
  hours: "By appointment",
  phone: "+234 704 777 7986",
  phone2: "+234 702 626 5336",
  email: "dannycyruz69@gmail.com",
  whatsapp: "https://wa.me/2347047777986",
  tagline: "Capturing the magic, one frame at a time.",
  social: {
    instagram: "https://instagram.com/dannycyruz",
  },
};

export const DEPOSIT_NGN = 5500;

const imageUrls: Record<string, string> = {
  "dc-hero":
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&h=1500&q=80",
  "dc-r1":
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&h=1200&q=80",
  "dc-r2":
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1100&q=80",
  "dc-r3":
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1000&h=800&q=80",
  "dc-r4":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&h=1300&q=80",
  "dc-r5":
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&h=1000&q=80",
  "dc-r6":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&h=1200&q=80",
  "dc-d1":
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&h=1100&q=80",
  "dc-d2":
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&h=1100&q=80",
  "dc-d3":
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&h=1100&q=80",
  "dc-d4":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=1100&q=80",
  "dc-s1":
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&h=1100&q=80",
  "dc-s2":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1100&q=80",
  "dc-s3":
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&h=1100&q=80",
  "dc-s4":
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&h=1100&q=80",
};

export function img(name: string, width: number, height: number) {
  const url =
    imageUrls[name] ??
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1";
  return `${url}&w=${width}&h=${height}`;
}

export const images = {
  hero: "/hero.jpg",
  about: img("dc-portrait", 1000, 1300),
  featured: [
    img("dc-f1", 1400, 1000),
    img("dc-f2", 900, 1200),
    img("dc-f3", 900, 1200),
    img("dc-f4", 1400, 1000),
  ],
};

export const frames = [
  { src: "/1img.jpeg", title: "Lagos atelier", meta: "Portrait" },
  { src: "/2img.jpeg", title: "Eko nuptials", meta: "Wedding" },
  { src: "/3img.jpeg", title: "Golden hour", meta: "Portrait" },
  { src: "/4img.jpeg", title: "Ikoyi morning", meta: "Wedding" },
  { src: "/hero.jpeg", title: "Soundstage", meta: "Event" },
  { src: "/hero2.jpeg", title: "Still life", meta: "Commercial" },
];
export const disciplines = [
  {
    name: "Weddings",
    note: "Quiet, unposed documentation",
    image: img("dc-d1", 800, 1100),
  },
  {
    name: "Films",
    note: "Short films and highlight reels",
    image: img("dc-d2", 800, 1100),
  },
  {
    name: "Portraits",
    note: "Personal, family and editorial",
    image: img("dc-d3", 800, 1100),
  },
  {
    name: "Studio",
    note: "Daylight space, hire by the hour",
    image: img("dc-d4", 800, 1100),
  },
];

export type Service = {
  slug: string;
  name: string;
  note?: string;
  image: string;
  from: number; // lowest price, used on the home page
  options: { label: string; price: number }[];
};

export const services: Service[] = [
  {
    slug: "children",
    name: "Children",
    note: "Ages 2 to 12",
    image: img("dc-s1", 800, 600),
    from: 6500,
    options: [
      { label: "3 pictures", price: 17000 },
      { label: "1 picture", price: 6500 },
    ],
  },
  {
    slug: "one-year-old",
    name: "One Year Old",
    image: img("dc-s2", 800, 600),
    from: 8000,
    options: [
      { label: "3 pictures", price: 22000 },
      { label: "1 picture", price: 8000 },
    ],
  },
  {
    slug: "adults",
    name: "Adults",
    image: img("dc-s3", 800, 600),
    from: 7500,
    options: [
      { label: "3 pictures", price: 20000 },
      { label: "1 picture", price: 7500 },
    ],
  },
  {
    slug: "studio",
    name: "Space Rental",
    image: img("dc-s4", 800, 600),
    from: 20000,
    options: [
      { label: "1 hour", price: 40000 },
      { label: "30 minutes", price: 20000 },
    ],
  },
];
export const steps = [
  {
    title: "Tell us the date",
    text: "Pick a service and a day. The form takes two minutes.",
  },
  {
    title: "Secure it",
    text: `A ₦${DEPOSIT_NGN.toLocaleString()} deposit holds your date. The balance is due on the day.`,
  },
  {
    title: "Show up as you are",
    text: "We guide you through the shoot. Previews arrive within a week.",
  },
];

export const testimonials = [
  {
    quote:
      "Danny made our wedding feel effortless, cinematic and deeply personal.",
    name: "Amaka & Tobi",
    role: "Wedding clients",
  },
  {
    quote: "Every frame felt like us — honest, warm and beautifully composed.",
    name: "Mariam A.",
    role: "Portrait client",
  },
];

export const videos = [
  // A video file you put in the public folder
  {
    src: "/videos/wedding-highlight.mp4",
    poster: "/videos/wedding-highlight.jpg",
    title: "Eko nuptials",
    meta: "Wedding film",
  },
  // A YouTube video: paste only the ID (the part after v= in the link)
  { youtube: "dQw4w9WgXcQ", title: "Lekki soundstage", meta: "Event" },
  // A vertical video (reel style)
  {
    src: "/videos/reel-1.mp4",
    title: "Studio session",
    meta: "Studio",
    vertical: true,
  },
];
