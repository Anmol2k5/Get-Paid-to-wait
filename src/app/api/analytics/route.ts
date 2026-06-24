import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/analytics?submission_id=xxx
 * Returns aggregated analytics for a campaign: daily impressions/clicks, totals.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rcfbgkdysropbfrkvure.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submission_id");

  if (!submissionId) {
    return NextResponse.json(
      { error: "Missing submission_id parameter" },
      { status: 400 }
    );
  }

  // UUID validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(submissionId)) {
    return NextResponse.json(
      { error: "Invalid submission_id format" },
      { status: 400 }
    );
  }

  try {
    // Fetch all impressions for this submission in the last 30 days
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ad_impressions?submission_id=eq.${submissionId}&created_at=gte.${thirtyDaysAgo}&select=event_type,created_at,client_id&order=created_at.asc&limit=10000`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 502 }
      );
    }

    const events: {
      event_type: string;
      created_at: string;
      client_id: string;
    }[] = await res.json();

    // Aggregate by day
    const dailyMap = new Map<
      string,
      { impressions: number; clicks: number }
    >();
    let totalImpressions = 0;
    let totalClicks = 0;
    const uniqueViewers = new Set<string>();

    for (const event of events) {
      const day = event.created_at.split("T")[0]; // YYYY-MM-DD

      if (!dailyMap.has(day)) {
        dailyMap.set(day, { impressions: 0, clicks: 0 });
      }

      const dayStats = dailyMap.get(day)!;

      if (
        event.event_type === "impression_rendered" ||
        event.event_type === "impression_viewable"
      ) {
        dayStats.impressions++;
        totalImpressions++;
        uniqueViewers.add(event.client_id);
      } else if (event.event_type === "click") {
        dayStats.clicks++;
        totalClicks++;
      }
    }

    // Convert to sorted array (last 30 days)
    const daily = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        impressions: stats.impressions,
        clicks: stats.clicks,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fill in missing days with zeros for the last 7 days
    const last7Days: { date: string; impressions: number; clicks: number }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const existing = daily.find((e) => e.date === dateStr);
      last7Days.push(
        existing || { date: dateStr, impressions: 0, clicks: 0 }
      );
    }

    const ctr =
      totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      totalImpressions,
      totalClicks,
      ctr: `${ctr}%`,
      uniqueViewers: uniqueViewers.size,
      last7Days,
      daily,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Analytics error: ${message}` },
      { status: 500 }
    );
  }
}
