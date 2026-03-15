import { NextResponse } from "next/server"
import { getLatestDdragonVersion } from "@/app/api/_lib/riot"
import { DDRAGON_FALLBACK_VERSION } from "@/utils/constants"

export async function GET() {
  try {
    const version = await getLatestDdragonVersion()
    return NextResponse.json({ version })
  } catch (error) {
    console.error("[ddragon-version] Failed to fetch version:", error)
    return NextResponse.json({ version: DDRAGON_FALLBACK_VERSION })
  }
}
