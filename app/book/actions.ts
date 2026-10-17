"use server";
import { randomBytes } from "crypto";
import { getSupabase, getSupabaseForUser } from "@/lib/supabase";
import { DEPOSIT_NGN, services } from "@/lib/content";

export type BookingInput = {
  full_name: string;
  email: string;
  phone: string;
  instagram: string;
  service: string;
  package_name: string;
  session_type: "studio" | "outdoor";
  people: number;
  event_type: string;
  pictures: number | null; // total pictures wanted when more than the package includes
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM
  location: string;
  notes: string;
  terms: boolean;
  access_token?: string | null; // set when the client is signed in
};

export type BookingResult =
  | { ok: true; reference: string; price: number }
  | { ok: false; error: string };

function makeReference() {
  // Easy to read out loud: no 0/O or 1/I
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(5);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `DC-${new Date().getFullYear()}-${code}`;
}

// Events are not in the price list: they are priced per event and quoted on WhatsApp.
const EVENT_SERVICE = "Events";

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const isEvent = input.service === EVENT_SERVICE;
  const service = isEvent ? undefined : services.find((s) => s.name === input.service);
  const pkg = service?.packages.find((p) => p.title === input.package_name);
  if (!isEvent && (!service || !pkg)) return { ok: false, error: "Please choose a service and a package." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${input.event_date}T00:00:00`);
  const twoYears = new Date(today);
  twoYears.setFullYear(twoYears.getFullYear() + 2);

  if (
    input.full_name.trim().length < 2 ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    !/^[+\d][\d\s-]{8,}$/.test(input.phone.trim()) ||
    (input.session_type !== "studio" && input.session_type !== "outdoor") ||
    (service?.slug === "studio" && input.session_type !== "studio") ||
    (isEvent && input.session_type !== "outdoor") ||
    !input.location.trim() ||
    !/^\d{2}:\d{2}$/.test(input.event_time) ||
    Number.isNaN(date.getTime()) ||
    date <= today ||
    date > twoYears ||
    !Number.isInteger(input.people) ||
    input.people < 1 ||
    input.people > 50 ||
    input.notes.length > 2800 ||
    (isEvent && input.event_type.trim().length < 2) ||
    input.event_type.trim().length > 60 ||
    (input.pictures !== null && (isEvent || service?.slug === "studio" || !pkg || !Number.isInteger(input.pictures) || input.pictures <= (parseInt(pkg.title, 10) || 1) || input.pictures > 100)) ||
    !input.terms
  ) {
    return { ok: false, error: "Some details are missing or invalid. Please check the form and try again." };
  }

  // Event type and extra pictures are stored at the top of the notes, so no database change is needed.
  const noteLines = [
    isEvent ? `Event type: ${input.event_type.trim()}` : "",
    isEvent ? "Price: to be quoted on WhatsApp" : "",
    input.pictures !== null && pkg ? `Pictures wanted: ${input.pictures} (package includes ${parseInt(pkg.title, 10) || 1}, extras priced separately)` : "",
    input.notes.trim(),
  ].filter(Boolean);
  const notes = noteLines.join("\n");

  // If the client is signed in, attach the booking to their account. A bad or expired token just books as a guest.
  let db = getSupabase();
  let userId: string | null = null;
  if (input.access_token) {
    try {
      const authed = getSupabaseForUser(input.access_token);
      const { data } = await authed.auth.getUser(input.access_token);
      if (data.user) { db = authed; userId = data.user.id; }
    } catch { /* book as a guest */ }
  }

  const reference = makeReference();
  // The price comes from the site's own price list, never from the browser.
  const { error } = await db
    .from("bookings")
    .insert({
      reference,
      user_id: userId,
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      instagram: input.instagram.trim() || null,
      service: isEvent ? EVENT_SERVICE : service!.name,
      package_name: isEvent ? "Event coverage (price quoted)" : pkg!.title,
      package_price: isEvent ? null : pkg!.price,
      session_type: input.session_type,
      people: input.people,
      event_date: input.event_date,
      event_time: input.event_time,
      location: input.location.trim(),
      notes,
      terms_accepted: true,
      deposit_amount: DEPOSIT_NGN,
    });

  // No .select() here: visitors are not allowed to read bookings back (row level security),
  // so asking for the row would make a successful insert look like a failure.
  if (error) return { ok: false, error: "We could not save your request. Please try again or chat with us on WhatsApp." };
  return { ok: true, reference, price: pkg?.price ?? 0 };
}