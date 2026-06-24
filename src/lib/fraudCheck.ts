/**
 * Fraud detection and block list management.
 * Checks incoming events against the fraud_blocks table in Supabase
 * and auto-blocks clients exceeding anomaly thresholds.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rcfbgkdysropbfrkvure.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// In-memory cache of blocked values (refreshed every 60s)
let blockCache: Map<string, Set<string>> = new Map([
  ["ip", new Set()],
  ["client_id", new Set()],
]);
let lastCacheRefresh = 0;
const CACHE_TTL = 60_000; // 60 seconds

/**
 * Refresh the block cache from Supabase
 */
async function refreshBlockCache(): Promise<void> {
  if (Date.now() - lastCacheRefresh < CACHE_TTL) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/fraud_blocks?select=block_type,block_value`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!res.ok) return; // Fail silently, keep old cache

    const rows: { block_type: string; block_value: string }[] =
      await res.json();

    const newCache = new Map<string, Set<string>>([
      ["ip", new Set()],
      ["client_id", new Set()],
    ]);

    for (const row of rows) {
      newCache.get(row.block_type)?.add(row.block_value);
    }

    blockCache = newCache;
    lastCacheRefresh = Date.now();
  } catch {
    // Silently fail — keep stale cache
  }
}

/**
 * Check if a client_id or IP is blocked
 */
export async function isBlocked(
  clientId: string,
  ipAddress: string
): Promise<{ blocked: boolean; reason?: string }> {
  await refreshBlockCache();

  if (blockCache.get("client_id")?.has(clientId)) {
    return { blocked: true, reason: "client_id blocked" };
  }

  if (blockCache.get("ip")?.has(ipAddress)) {
    return { blocked: true, reason: "ip blocked" };
  }

  return { blocked: false };
}

/**
 * Auto-block a client_id and log the reason
 */
export async function autoBlock(
  blockType: "ip" | "client_id",
  blockValue: string,
  reason: string
): Promise<void> {
  // Update local cache immediately
  blockCache.get(blockType)?.add(blockValue);

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/fraud_blocks`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        block_type: blockType,
        block_value: blockValue,
        reason,
      }),
    });
  } catch {
    // Best-effort
  }
}

/**
 * Remove a block entry
 */
export async function unblock(
  blockType: "ip" | "client_id",
  blockValue: string
): Promise<boolean> {
  blockCache.get(blockType)?.delete(blockValue);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/fraud_blocks?block_type=eq.${blockType}&block_value=eq.${encodeURIComponent(blockValue)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Validate event timestamp is within acceptable range (5 minutes)
 */
export function isTimestampValid(eventTs: string): boolean {
  try {
    const eventTime = new Date(eventTs).getTime();
    const now = Date.now();
    return Math.abs(now - eventTime) <= 5 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Get all blocked entries (for admin panel)
 */
export async function getBlockList(): Promise<
  { id: string; block_type: string; block_value: string; reason: string; created_at: string }[]
> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/fraud_blocks?select=*&order=created_at.desc&limit=200`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
