import { NextRequest, NextResponse } from "next/server"
import type { Region, RankedMatch } from "@/types"
import { getMatchIds, getMatchDetail, extractMatchData } from "../_lib/riot"

const VALID_REGIONS: Region[] = [
  "EUW", "EUNE", "NA", "KR", "JP", "BR", "LAN", "LAS", "OCE", "TR", "RU",
]

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const puuid = searchParams.get("puuid")
    const region = searchParams.get("region") as Region
    const count = parseInt(searchParams.get("count") ?? "30", 10)

    if (!puuid || !region) {
      return NextResponse.json(
        { error: "Missing required parameters: puuid, region" },
        { status: 400 }
      )
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 })
    }

    // Step 1: Get match IDs (ranked only)
    const matchIds = await getMatchIds(puuid, region, count)

    if (matchIds.length === 0) {
      return NextResponse.json([])
    }

    // Step 2: Fetch and extract match details in batches
    const matches: RankedMatch[] = []

    for (let i = 0; i < matchIds.length; i += BATCH_SIZE) {
      const batch = matchIds.slice(i, i + BATCH_SIZE)

      const results = await Promise.all(
        batch.map(async (matchId) => {
          try {
            const matchData = await getMatchDetail(matchId, region)
            if (!matchData) return null
            return extractMatchData(matchData, puuid)
          } catch (err) {
            console.error(`[matches route] Failed to process match ${matchId}:`, err)
            return null
          }
        })
      )

      matches.push(...results.filter((m): m is RankedMatch => m !== null))

      // Respect rate limits between batches
      if (i + BATCH_SIZE < matchIds.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    // Return sorted newest-first
    matches.sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[matches route]", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
