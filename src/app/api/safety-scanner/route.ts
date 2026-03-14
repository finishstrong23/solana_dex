import { NextResponse } from "next/server";
import { scanToken } from "@/lib/safety-scanner";

export const dynamic = "force-dynamic";

// POST /api/safety-scanner
// Body: { mint: string }
// Returns: SafetyScanResponse
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mint } = body;

    if (!mint || typeof mint !== "string") {
      return NextResponse.json(
        { result: null, error: "Missing or invalid 'mint' address", cached: false },
        { status: 400 }
      );
    }

    // Basic Solana address validation (base58, 32-44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
      return NextResponse.json(
        { result: null, error: "Invalid Solana address format", cached: false },
        { status: 400 }
      );
    }

    const response = await scanToken(mint);

    if (response.error) {
      return NextResponse.json(response, { status: 422 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Safety scanner error:", error);
    return NextResponse.json(
      { result: null, error: "Internal scanner error", cached: false },
      { status: 500 }
    );
  }
}
