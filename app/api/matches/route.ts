import { NextRequest, NextResponse } from "next/server"
import type { Region, RankedMatch } from "@/types"
import { VALID_REGIONS } from "@/utils/ranked"
import { PAGE_SIZE, BATCH_SIZE, BATCH_DELAY_MS } from "@/utils/constants"
import { getMatchIds, getMatchDetail, extractMatchData } from "../_lib/riot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const puuid = searchParams.get("puuid")
    const region = searchParams.get("region") as Region

    if (!puuid || !region) {
      return NextResponse.json(
        { error: "Missing required parameters: puuid, region" },
        { status: 400 }
      )
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 })
    }

    // Step 1: Get match IDs for the requested page
    const start = parseInt(searchParams.get("start") ?? "0", 10)
    const matchIds = await getMatchIds(puuid, region, PAGE_SIZE, start)

    // hasMore is true if Riot returned a full page of IDs (before any Solo/Duo filtering)
    const hasMore = matchIds.length >= PAGE_SIZE

    if (matchIds.length === 0) {
      return NextResponse.json({ matches: [], hasMore: false })
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

    return NextResponse.json({ matches, hasMore })
  } catch (error) {
    console.error("[matches route]", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
