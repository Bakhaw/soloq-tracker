    import { NextResponse } from "next/server"
import { getLatestDdragonVersion } from "@/app/api/_lib/riot"

export async function GET() {
  try {
    const version = await getLatestDdragonVersion()
    return NextResponse.json({ version })
  } catch (error) {
    console.error("[ddragon-version] Failed to fetch version:", error)
    // Return a known stable fallback so images don't fully break
    return NextResponse.json({ version: "15.1.1" })
  }
}
