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
  series: string;
  subtitle: string;
  blurb: string;
  image: string;
  plate: string;
  from: number; // lowest price, used on the home page
  packages: { tag: string; price: number; title: string; detail: string }[];
  footnote: string;
  cta: string;
};

export const services: Service[] = [
  {
    slug: "children",
    name: "Children",
    series: "Service series 01 • Lekki & Abuja",
    subtitle: "Ages 2 to 12 years old",
    blurb:
      "Gentle, unhurried portraiture designed to capture authentic childhood character. Natural postures, soft studio glow, and timeless styling guidance.",
    image: img("dc-s1", 900, 1100),
    plate: "Plate 01 // Tri-X 400 • 80mm f/2.8",
    from: 6500,
    packages: [
      {
        tag: "Package 01",
        price: 17000,
        title: "3 Master Retouched Pictures",
        detail: "High-resolution print master + online gallery",
      },
      {
        tag: "Package 02",
        price: 6500,
        title: "1 Master Retouched Picture",
        detail: "Signature fine art edit & digital transfer",
      },
    ],
    footnote: "Includes digital high-res exports • 48H delivery window", // CHECK delivery time
    cta: "Book this service",
  },
  {
    slug: "one-year-old",
    name: "One Year Old",
    series: "Service series 02 • Milestone edition",
    subtitle: "First milestone celebration",
    blurb:
      "Calm, baby-friendly studio cadence. Temperature-regulated atelier, soft muslin textures, and tactile props yielding heirloom frames you will keep forever.",
    image: img("dc-s2", 900, 1100),
    plate: "Plate 02 // Portra 400 • 80mm f/1.8",
    from: 8000,
    packages: [
      {
        tag: "Package 01",
        price: 22000,
        title: "3 Master Retouched Pictures",
        detail: "Multiple baby wardrobe changes & parents inclusion",
      },
      {
        tag: "Package 02",
        price: 8000,
        title: "1 Master Retouched Picture",
        detail: "Clean minimalist fine-art solo vignette",
      },
    ],
    footnote: "Quiet environment • Warm organic studio settings",
    cta: "Book this service",
  },
  {
    slug: "adults",
    name: "Adults",
    series: "Service series 03 • Editorial & studio",
    subtitle: "Editorial & fine art portraiture",
    blurb:
      "Elevated, quiet personal monographs for artists, executives, and fashion patrons. Precision key lighting and thoughtful creative direction.",
    image: img("dc-s3", 900, 1100),
    plate: "Plate 03 // Ilford HP5 • 60mm Rembrandt",
    from: 7500,
    packages: [
      {
        tag: "Package 01",
        price: 20000,
        title: "3 Master Retouched Pictures",
        detail: "High-end skin finishing & editorial color grading",
      },
      {
        tag: "Package 02",
        price: 7500,
        title: "1 Master Retouched Picture",
        detail: "Standout portfolio or monograph headshot",
      },
    ],
    footnote: "Includes private client proofing gallery access",
    cta: "Book this service",
  },
  {
    slug: "studio",
    name: "Space Rental",
    series: "Service series 04 • Soundstage & natural light",
    subtitle: "Creative studio facility",
    blurb:
      "Expansive daylight photography studio and blackout space equipped with continuous lighting, C-stands, white cyclorama cove, and private vanity rooms.", // CHECK equipment
    image: img("dc-s4", 900, 1100),
    plate: "Daylight bay // 4,000 sq ft Lekki loft",
    from: 20000, // CHECK size and place
    packages: [
      {
        tag: "Standard hire",
        price: 40000,
        title: "1 Hour Studio Access",
        detail: "Full lighting grid, backdrops, and dressing suite",
      },
      {
        tag: "Express session",
        price: 20000,
        title: "30 Minutes Studio Access",
        detail: "Rapid lookbooks, quick reels & product drops",
      },
    ],
    footnote: "Lekki Phase 1, Lagos • Maitama Quarters, Abuja", // CHECK addresses
    cta: "Reserve space",
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
