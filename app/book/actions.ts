"use server";
import { randomBytes } from "crypto";
import { getSupabase } from "@/lib/supabase";
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
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM
  location: string;
  notes: string;
  terms: boolean;
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

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const service = services.find((s) => s.name === input.service);
  const pkg = service?.packages.find((p) => p.title === input.package_name);
  if (!service || !pkg) return { ok: false, error: "Please choose a service and a package." };

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
    (service.slug === "studio" && input.session_type !== "studio") ||
    !input.location.trim() ||
    !/^\d{2}:\d{2}$/.test(input.event_time) ||
    Number.isNaN(date.getTime()) ||
    date <= today ||
    date > twoYears ||
    !Number.isInteger(input.people) ||
    input.people < 1 ||
    input.people > 50 ||
    input.notes.length > 3000 ||
    !input.terms
  ) {
    return { ok: false, error: "Some details are missing or invalid. Please check the form and try again." };
  }

  const reference = makeReference();
  // The price comes from the site's own price list, never from the browser.
  const { error } = await getSupabase()
    .from("bookings")
    .insert({
      reference,
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      instagram: input.instagram.trim() || null,
      service: service.name,
      package_name: pkg.title,
      package_price: pkg.price,
      session_type: input.session_type,
      people: input.people,
      event_date: input.event_date,
      event_time: input.event_time,
      location: input.location.trim(),
      notes: input.notes.trim() || null,
      terms_accepted: true,
      deposit_amount: DEPOSIT_NGN,
    });

  // No .select() here: visitors are not allowed to read bookings back (row level security),
  // so asking for the row would make a successful insert look like a failure.
  if (error) return { ok: false, error: "We could not save your request. Please try again or chat with us on WhatsApp." };
  return { ok: true, reference, price: pkg.price };
}