import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/payments";
import { validSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Paystack calls this when a payment succeeds, even if the client closed the page.
// Set it in Paystack: Settings > API Keys & Webhooks > Webhook URL = https://YOUR-DOMAIN/api/paystack/webhook
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
    if (event.event === "charge.success" && event.data?.reference) {
      await settlePayment(event.data.reference);
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}