import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isBlocked, autoBlock, isTimestampValid } from "@/lib/fraudCheck";

/**
 * POST /api/metrics/ingest
 * Receives metric events from the VS Code extension.
 * Validates, rate-limits, checks fraud, records to Supabase.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rcfbgkdysropbfrkvure.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const VALID_EVENT_TYPES = [
  "impression_rendered",
  "impression_viewable",
  "click",
  "view_tick",
  "view_threshold_met",
  "prompt_view",
  "error_impression",
];

// Rate limit: 100 events per client_id per minute
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60_000;

// Auto-block threshold: 500 events per hour
const AUTO_BLOCK_THRESHOLD = 500;
const AUTO_BLOCK_WINDOW = 3600_000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      ad_id,
      campaign_id,
      client_id,
      ts,
      surface,
      visible_ms,
    } = body;

    // Validate required fields
    if (!event_type || !ad_id || !client_id) {
      return NextResponse.json(
        { error: "Missing required fields: event_type, ad_id, client_id" },
        { status: 400 }
      );
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type: ${event_type}` },
        { status: 400 }
      );
    }

    // Validate timestamp
    if (ts && !isTimestampValid(ts)) {
      return NextResponse.json(
        { error: "Event timestamp out of acceptable range (±5 minutes)" },
        { status: 400 }
      );
    }

    // Get client IP
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check fraud block list
    const blockCheck = await isBlocked(client_id, ipAddress);
    if (blockCheck.blocked) {
      return NextResponse.json(
        { error: "Request blocked", reason: blockCheck.reason },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(
      `metrics:${client_id}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW
    );

    if (!rateCheck.allowed) {
      // Check if we should auto-block
      const hourlyCheck = checkRateLimit(
        `hourly:${client_id}`,
        AUTO_BLOCK_THRESHOLD,
        AUTO_BLOCK_WINDOW
      );

      if (!hourlyCheck.allowed) {
        await autoBlock(
          "client_id",
          client_id,
          `Auto-blocked: exceeded ${AUTO_BLOCK_THRESHOLD} events/hour`
        );
      }

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfterMs: rateCheck.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
          },
        }
      );
    }

    // Also count toward hourly window for auto-block detection
    checkRateLimit(`hourly:${client_id}`, AUTO_BLOCK_THRESHOLD, AUTO_BLOCK_WINDOW);

    // Insert into ad_impressions
    const impression = {
      submission_id: campaign_id || ad_id,
      event_type,
      client_id,
      ip_address: ipAddress,
      surface: surface || null,
      visible_ms: typeof visible_ms === "number" ? visible_ms : 0,
    };

    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/ad_impressions`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(impression),
      }
    );

    // Update counters on ad_submissions (best-effort)
    if (
      event_type === "impression_rendered" ||
      event_type === "impression_viewable"
    ) {
      // Increment total_impressions
      await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/increment_impressions`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submission_id_input: campaign_id || ad_id }),
        }
      ).catch(() => {}); // best-effort
    } else if (event_type === "click") {
      await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/increment_clicks`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submission_id_input: campaign_id || ad_id }),
        }
      ).catch(() => {}); // best-effort
    }

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("[Metrics Ingest] Insert failed:", errText);
      // Still return 200 — don't fail the extension
      return NextResponse.json({ received: true, warning: "storage_error" });
    }

    return NextResponse.json({
      received: true,
      remaining: rateCheck.remaining,
    });
  } catch (err: unknown) {
    console.error("[Metrics Ingest] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Ingest error: ${message}` },
      { status: 500 }
    );
  }
}
