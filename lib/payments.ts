import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { DEPOSIT_NGN } from "@/lib/content";

// SERVER ONLY.

function origin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env) return env;
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Booking references look like DC-2026-ABCDE (three parts). Every payment attempt gets its own
// Paystack reference (booking reference + a short suffix) because Paystack rejects a reused reference.
export function bookingRefFrom(paystackRef: string) {
  return paystackRef.split("-").slice(0, 3).join("-");
}

// Returns the Paystack checkout address for the deposit.
export async function createPaymentLink(bookingRef: string, email: string) {
  const attempt = `${bookingRef}-${randomBytes(3).toString("hex")}`;
  const data = await initializeTransaction({
    email,
    amountNaira: DEPOSIT_NGN,
    reference: attempt,
    callbackUrl: `${origin()}/book/confirmed`,
    metadata: { booking_reference: bookingRef },
  });
  return data.authorization_url;
}

export type Settled = {
  state: "paid" | "failed" | "unknown";
  reason?: string; // shown on screen in development only
  booking?: { reference: string; service: string; event_date: string; event_time: string | null };
};

// Asks Paystack whether the deposit was really paid, then marks the booking as paid.
// Safe to call many times (from the return page and from the webhook).
export async function settlePayment(paystackRef: string): Promise<Settled> {
  const ref = bookingRefFrom(paystackRef);
  const db = getSupabaseAdmin();
  const { data: b, error: lookupError } = await db
    .from("bookings")
    .select("reference, service, event_date, event_time, deposit_amount, payment_status")
    .eq("reference", ref)
    .maybeSingle();
  if (lookupError) console.error("[payments] booking lookup failed:", lookupError.message, "| check SUPABASE_SERVICE_ROLE_KEY");
  if (!b) {
    console.error("[payments] no booking found for", ref, "(paystack reference:", paystackRef + ")");
    return { state: "unknown", reason: lookupError ? `Supabase lookup failed: ${lookupError.message}. Check SUPABASE_SERVICE_ROLE_KEY (must be the service_role key).` : `No booking with reference ${ref} in the bookings table.` };
  }
  const booking = { reference: b.reference as string, service: b.service as string, event_date: b.event_date as string, event_time: (b.event_time as string | null) ?? null };

  if (b.payment_status === "paid") return { state: "paid", booking };

  try {
    const tx = await verifyTransaction(paystackRef);
    // Amount, currency and status must all match before anything is marked as paid.
    if (tx.status === "success" && tx.currency === "NGN" && tx.amount === (b.deposit_amount as number) * 100) {
      const { error: updateError } = await db
        .from("bookings")
        .update({ payment_status: "paid", paid_at: new Date().toISOString(), payment_reference: paystackRef })
        .eq("reference", ref)
        .eq("payment_status", "unpaid");
      if (updateError) console.error("[payments] could not save the payment. Did you run supabase/paystack.sql?", updateError.message);
      return { state: "paid", booking, reason: updateError ? `Paid, but could not save it: ${updateError.message}. Run supabase/paystack.sql.` : undefined };
    }
    console.error("[payments] not paid yet:", tx.status, tx.currency, tx.amount);
    return { state: "failed", booking, reason: `Paystack says: status ${tx.status}, ${tx.currency} ${tx.amount / 100}.` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[payments] paystack verify failed:", msg);
    return { state: "failed", booking, reason: `Paystack check failed: ${msg}` };
  }
}