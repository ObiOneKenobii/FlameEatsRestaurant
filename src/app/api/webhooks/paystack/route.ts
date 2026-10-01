import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Paystack sends webhook events to verify payment after popup completes.
// Official docs: https://paystack.com/docs/payments/webhooks/
export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify the event is from Paystack using HMAC SHA512
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(body)
    .digest("hex");

  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference as string;
    const orderId = data.metadata?.orderId as string | undefined;

    console.log("Paystack charge.success:", reference, "orderId:", orderId);

    // Here you would update the order payment status in Convex
    // by calling your Convex HTTP action with the orderId and reference.
    // Example (if you expose a Convex HTTP endpoint):
    // await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/confirmPayment`, {
    //   method: "POST",
    //   body: JSON.stringify({ orderId, reference }),
    // });
  }

  return NextResponse.json({ received: true });
}
