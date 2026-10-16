"use server";
import { getSupabase } from "@/lib/supabase";
import { DEPOSIT_NGN } from "@/lib/content";

export type BookingInput = {
  full_name: string; email: string; phone: string; service: string; package_name: string;
  event_date: string; event_time: string; location: string; notes: string;
};

export async function createBooking(input: BookingInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!input.full_name.trim() || !/^\S+@\S+\.\S+$/.test(input.email) || !input.service || !input.event_date) {
    return { ok: false, error: "Some required details are missing." };
  }
  const { data, error } = await getSupabase()
    .from("bookings")
    .insert({ ...input, deposit_amount: DEPOSIT_NGN })
    .select("id")
    .single();
  if (error) return { ok: false, error: "We could not save your request. Please try again." };
  // TODO: create a Paystack/Flutterwave checkout for DEPOSIT_NGN here and redirect; confirm via webhook.
  return { ok: true, id: data.id };
}
