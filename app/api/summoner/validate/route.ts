import { NextRequest, NextResponse } from "next/server"
import type { Region } from "@/types"
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedEntries,
} from "../../_lib/riot"

const VALID_REGIONS: Region[] = [
  "EUW", "EUNE", "NA", "KR", "JP", "BR", "LAN", "LAS", "OCE", "TR", "RU",
]

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

    // Get ranked info (optional)
    let rank = "Unranked"
    let lp = 0

    try {
      const rankedEntries = await getRankedEntries(summoner.id, region)
      const soloDuo = rankedEntries.find((e) => e.queueType === "RANKED_SOLO_5x5")

      if (soloDuo) {
        const { tier, rank: rankTier, leaguePoints } = soloDuo
        rank =
          tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER"
            ? tier
            : `${tier} ${rankTier}`
        lp = leaguePoints
      }
    } catch {
      // Ranked data optional
    }

    return NextResponse.json({
      gameName: account.gameName,
      tag: account.tagLine,
      region,
      rank,
      lp,
      level: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
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
