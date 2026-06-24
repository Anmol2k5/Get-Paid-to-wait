import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "../auth/route";
import { getBlockList, autoBlock, unblock } from "@/lib/fraudCheck";

/**
 * Admin fraud management endpoint.
 * GET — list all blocks
 * POST — add a block
 * DELETE — remove a block
 */

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return verifyAdminToken(auth.slice(7));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocks = await getBlockList();
  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { block_type, block_value, reason } = await req.json();

    if (!block_type || !block_value) {
      return NextResponse.json(
        { error: "Missing block_type and block_value" },
        { status: 400 }
      );
    }

    if (!["ip", "client_id"].includes(block_type)) {
      return NextResponse.json(
        { error: "block_type must be 'ip' or 'client_id'" },
        { status: 400 }
      );
    }

    await autoBlock(block_type, block_value, reason || "Manual block by admin");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { block_type, block_value } = await req.json();

    if (!block_type || !block_value) {
      return NextResponse.json(
        { error: "Missing block_type and block_value" },
        { status: 400 }
      );
    }

    const success = await unblock(block_type, block_value);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
