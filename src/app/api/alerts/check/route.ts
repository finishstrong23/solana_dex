import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ============================================================
// ALERT CHECK API — Server-side price checking for alerts
//
// POST /api/alerts/check
// Body: { mints: string[] }
// Returns: { prices: Record<string, number>, timestamp: string }
//
// This endpoint fetches live prices from Jupiter for a list of
// token mints, used by the client-side alert evaluation engine.
// ============================================================

interface JupiterPriceEntry {
  id: string;
  mintSymbol: string;
  price: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mints } = body;

    if (!Array.isArray(mints) || mints.length === 0) {
      return NextResponse.json(
        { prices: {}, error: "Missing or empty 'mints' array" },
        { status: 400 }
      );
    }

    // Cap at 100 mints per request
    const limitedMints = mints.slice(0, 100);
    const ids = limitedMints.join(",");

    const res = await fetch(`https://price.jup.ag/v6/price?ids=${ids}`, {
      next: { revalidate: 15 }, // Cache for 15 seconds
    });

    if (!res.ok) {
      return NextResponse.json(
        { prices: {}, error: "Jupiter price API unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const prices: Record<string, number> = {};

    if (data.data) {
      for (const [mint, info] of Object.entries(data.data as Record<string, JupiterPriceEntry>)) {
        prices[mint] = info.price;
      }
    }

    return NextResponse.json({
      prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Alert check error:", error);
    return NextResponse.json(
      { prices: {}, error: "Internal error" },
      { status: 500 }
    );
  }
}
