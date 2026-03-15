import { NextRequest, NextResponse } from "next/server"
import type { Region } from "@/types"
import { VALID_REGIONS, extractSoloDuoRank } from "@/utils/ranked"
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedEntries,
} from "../../_lib/riot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const gameName = searchParams.get("gameName")
    const tag = searchParams.get("tag")
    const region = searchParams.get("region") as Region

    if (!gameName || !tag || !region) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 })
    }

    // Try to validate the Riot ID exists
    const account = await getAccountByRiotId(gameName, tag, region)
    const summoner = await getSummonerByPuuid(account.puuid, region)

    let ranked = extractSoloDuoRank([])

    try {
      const rankedEntries = await getRankedEntries(account.puuid, region)
      ranked = extractSoloDuoRank(rankedEntries)
    } catch {
      // Ranked data optional
    }

    return NextResponse.json({
      gameName: account.gameName,
      tag: account.tagLine,
      region,
      level: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      ...ranked,
      valid: true,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Summoner not found") {
      return NextResponse.json({ valid: false }, { status: 404 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    )
  }
}
