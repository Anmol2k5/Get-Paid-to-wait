import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/admin/auth
 * Validates admin password and returns a signed JWT token (24h TTL).
 * No external auth dependencies — uses HMAC-SHA256 for JWT signing.
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET || "dev-jwt-secret";

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSig) return false;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Admin auth not configured. Set ADMIN_SECRET env var." },
        { status: 503 }
      );
    }

    if (!password || password !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const token = signJwt(
      {
        role: "admin",
        iat: now,
        exp: now + 24 * 60 * 60, // 24 hours
      },
      JWT_SECRET
    );

    return NextResponse.json({ token, expiresIn: 86400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Auth error: ${message}` },
      { status: 500 }
    );
  }
}
