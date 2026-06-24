import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../auth/route";

/**
 * GET/PATCH /api/admin/campaigns
 * Protected admin endpoint for campaign management.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rcfbgkdysropbfrkvure.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getAdminToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function isAuthorized(req: NextRequest): boolean {
  const token = getAdminToken(req);
  if (!token) return false;
  return verifyAdminToken(token);
}

/**
 * GET /api/admin/campaigns
 * List campaigns with optional filters: status, payment_status, page, limit
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // approval_status filter
  const payment = searchParams.get("payment"); // payment_status filter
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = (page - 1) * limit;

  let query = `${SUPABASE_URL}/rest/v1/ad_submissions?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;

  if (status) query += `&approval_status=eq.${status}`;
  if (payment) query += `&payment_status=eq.${payment}`;

  try {
    // Get campaigns
    const res = await fetch(query, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "count=exact",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Supabase error: ${text}` },
        { status: 502 }
      );
    }

    const campaigns = await res.json();
    const totalCount = res.headers.get("content-range")?.split("/")[1] || "0";

    return NextResponse.json({
      campaigns,
      total: parseInt(totalCount, 10),
      page,
      limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/campaigns
 * Update a campaign's approval status.
 * Body: { id, approval_status, rejection_reason? }
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, approval_status, rejection_reason } = body;

    if (!id || !approval_status) {
      return NextResponse.json(
        { error: "Missing required fields: id, approval_status" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending_approval", "approved", "rejected"];
    if (!validStatuses.includes(approval_status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateBody: Record<string, string> = {
      approval_status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "admin",
    };

    if (rejection_reason) {
      updateBody.rejection_reason = rejection_reason;
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ad_submissions?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateBody),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Update failed: ${text}` },
        { status: 502 }
      );
    }

    const updated = await res.json();
    return NextResponse.json({ campaign: updated[0] || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
