import { NextRequest, NextResponse } from "next/server";

// After popup success, frontend calls this to verify the transaction server-side
// Docs: https://paystack.com/docs/api/transaction/#verify

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ verified: false, message: "Payment not successful" }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      reference: data.data.reference,
      amount: data.data.amount / 100,
      email: data.data.customer.email,
      orderId: data.data.metadata?.orderId,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
