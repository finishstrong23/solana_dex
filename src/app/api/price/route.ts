import { NextResponse } from "next/server";
import { fetchLivePrices } from "@/lib/prices";

export const revalidate = 30; // ISR every 30s

export async function GET() {
  try {
    const prices = await fetchLivePrices();
    return NextResponse.json(prices);
  } catch (error) {
    console.error("Price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
