import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/webhook/dodo
 * Receives Dodo Payments webhook events, verifies SVIX signature,
 * and updates the ad_submission record in Supabase.
 */

const WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rcfbgkdysropbfrkvure.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Verify the SVIX webhook signature from Dodo Payments.
 * Headers: webhook-id, webhook-timestamp, webhook-signature
 */
function verifyWebhookSignature(
  payload: string,
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  }
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("No DODO_PAYMENTS_WEBHOOK_SECRET set — skipping verification");
    return true; // Allow in dev; enforce in production
  }

  try {
    const { id, timestamp, signature } = headers;

    // Validate timestamp (reject events older than 5 minutes)
    const timestampSeconds = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampSeconds) > 300) {
      console.error("Webhook timestamp too old or in the future");
      return false;
    }

    // Content to sign: "{webhook-id}.{webhook-timestamp}.{payload}"
    const signedContent = `${id}.${timestamp}.${payload}`;

    // Decode the secret (base64-encoded, with optional "whsec_" prefix)
    const secretBytes = Buffer.from(
      WEBHOOK_SECRET.replace(/^whsec_/, ""),
      "base64"
    );

    // Compute HMAC-SHA256
    const computedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent, "utf-8")
      .digest("base64");

    // The signature header may contain multiple signatures separated by spaces
    // Each is prefixed with "v1," — we check if any match
    const expectedSignatures = signature.split(" ");
    for (const sig of expectedSignatures) {
      const sigValue = sig.replace(/^v1,/, "");
      if (
        crypto.timingSafeEqual(
          Buffer.from(computedSignature),
          Buffer.from(sigValue)
        )
      ) {
        return true;
      }
    }

    console.error("Webhook signature mismatch");
    return false;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Update the Supabase ad_submissions table
 */
async function updateSubmissionPaymentStatus(
  submissionId: string,
  status: string,
  paymentId?: string
) {
  const updateBody: Record<string, string> = {
    payment_status: status,
  };
  if (paymentId) {
    updateBody.dodo_payment_id = paymentId;
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/ad_submissions?id=eq.${submissionId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(updateBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase update failed: ${response.status} ${errorText}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();

    // Extract SVIX headers
    const webhookId = req.headers.get("webhook-id") || "";
    const webhookTimestamp = req.headers.get("webhook-timestamp") || "";
    const webhookSignature = req.headers.get("webhook-signature") || "";

    // Verify signature
    const isValid = verifyWebhookSignature(rawBody, {
      id: webhookId,
      timestamp: webhookTimestamp,
      signature: webhookSignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse the payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type;

    console.log(`[Dodo Webhook] Received event: ${eventType}`);

    // Handle payment.succeeded event
    if (eventType === "payment.succeeded") {
      const metadata = payload.data?.metadata || {};
      const submissionId = metadata.submission_id;
      const paymentId = payload.data?.payment_id || payload.data?.id;

      if (!submissionId) {
        console.warn("payment.succeeded event without submission_id in metadata");
        // Return 200 to acknowledge receipt (don't retry)
        return NextResponse.json({ received: true, warning: "no submission_id" });
      }

      console.log(`[Dodo Webhook] Updating submission ${submissionId} to paid`);

      await updateSubmissionPaymentStatus(submissionId, "paid", paymentId);

      return NextResponse.json({
        received: true,
        submissionId,
        status: "paid",
      });
    }

    // Handle payment.failed event
    if (eventType === "payment.failed") {
      const metadata = payload.data?.metadata || {};
      const submissionId = metadata.submission_id;

      if (submissionId) {
        console.log(
          `[Dodo Webhook] Payment failed for submission ${submissionId}`
        );
        await updateSubmissionPaymentStatus(submissionId, "payment_failed");
      }

      return NextResponse.json({ received: true, status: "payment_failed" });
    }

    // For all other events, just acknowledge
    console.log(`[Dodo Webhook] Ignoring event type: ${eventType}`);
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[Dodo Webhook] Error processing webhook:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Webhook processing error: ${message}` },
      { status: 500 }
    );
  }
}
