import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout
 * Creates a Dodo Payments checkout session and returns the checkout_url.
 *
 * Body: { submissionId: string, packageId: string, email: string }
 */

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY || "";
const DODO_ENV = process.env.DODO_PAYMENTS_ENV || "test_mode"; // "test_mode" | "live_mode"

// Map package IDs to Dodo product IDs (set these in env or replace with real IDs)
const PRODUCT_MAP: Record<string, string> = {
  starter: process.env.DODO_PRODUCT_STARTER || "pdt_starter_placeholder",
  growth: process.env.DODO_PRODUCT_GROWTH || "pdt_growth_placeholder",
  pro: process.env.DODO_PRODUCT_SCALE || "pdt_scale_placeholder",
};

const DODO_BASE =
  DODO_ENV === "live_mode"
    ? "https://api.dodopayments.com"
    : "https://test.dodopayments.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, packageId, email } = body;

    if (!submissionId || !packageId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: submissionId, packageId, email" },
        { status: 400 }
      );
    }

    const productId = PRODUCT_MAP[packageId];
    if (!productId) {
      return NextResponse.json(
        { error: `Unknown package: ${packageId}` },
        { status: 400 }
      );
    }

    // Determine the return URL (origin of the request)
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/[^/]*$/, "") ||
      "https://get-paid-to-wait.vercel.app";

    const returnUrl = `${origin}/advertise?payment=success&submission_id=${submissionId}`;

    // Create Dodo checkout session via REST API
    const response = await fetch(`${DODO_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        customer: {
          email,
        },
        return_url: returnUrl,
        metadata: {
          submission_id: submissionId,
          package_id: packageId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dodo API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Payment service error: ${response.status}` },
        { status: 502 }
      );
    }

    const session = await response.json();

    return NextResponse.json({
      checkoutUrl: session.checkout_url || session.url,
      sessionId: session.id,
    });
  } catch (err: unknown) {
    console.error("Checkout creation failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}
