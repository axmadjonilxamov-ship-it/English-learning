import { NextResponse } from "next/server";

/**
 * Serverdagi joriy qurilish belgisi.
 *
 * Brauzer buni o'zidagi belgi bilan solishtiradi. Javob hech qachon
 * keshlanmasligi kerak, aks holda yangi versiya chiqqani sezilmaydi.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { build: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev" },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}
