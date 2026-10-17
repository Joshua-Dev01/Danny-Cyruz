"use server";
import { getSupabase } from "@/lib/supabase";

export type EnquiryInput = {
  full_name: string;
  email: string;
  phone: string;
  service: string;
  target_date: string;
  message: string;
};

export async function createEnquiry(input: EnquiryInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    input.full_name.trim().length < 2 ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    !/^[+\d][\d\s-]{8,}$/.test(input.phone.trim()) ||
    !input.service ||
    input.message.trim().length < 5 ||
    input.message.length > 3000
  ) {
    return { ok: false, error: "Some required details are missing or invalid." };
  }
  const { error } = await getSupabase()
    .from("enquiries")
    .insert({
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      service: input.service,
      target_date: input.target_date || null,
      message: input.message.trim(),
    });
  if (error) return { ok: false, error: "We could not send your enquiry. Please try again or use WhatsApp." };
  return { ok: true };
}