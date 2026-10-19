import { createHmac, timingSafeEqual } from "crypto";

// SERVER ONLY. Talks to Paystack with the secret key.
const API = "https://api.paystack.co";

function secret() {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("Missing PAYSTACK_SECRET_KEY");
  return k.trim();
}

type InitData = { authorization_url: string; access_code: string; reference: string };
export type VerifyData = { status: string; reference: string; amount: number; currency: string };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !json?.status || !json.data) throw new Error(json?.message ?? `Paystack error ${res.status}`);
  return json.data;
}

// amountNaira is converted to kobo here. Paystack always works in the smallest unit.
export function initializeTransaction(p: { email: string; amountNaira: number; reference: string; callbackUrl: string; metadata?: Record<string, unknown> }) {
  return call<InitData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: p.email,
      amount: Math.round(p.amountNaira * 100),
      currency: "NGN",
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: p.metadata,
    }),
  });
}

export function verifyTransaction(reference: string) {
  return call<VerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

// Webhook calls are signed: HMAC SHA512 of the raw body with the secret key.
export function validSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}