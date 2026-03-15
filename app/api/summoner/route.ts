import { NextRequest, NextResponse } from "next/server"
import type { Region, SummonerProfile } from "@/types"
import { VALID_REGIONS, extractSoloDuoRank } from "@/utils/ranked"
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedEntries,
} from "../_lib/riot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const gameName = searchParams.get("gameName")
    const tag = searchParams.get("tag")
    const region = searchParams.get("region") as Region

    if (!gameName || !tag || !region) {
      return NextResponse.json(
        { error: "Missing required parameters: gameName, tag, region" },
        { status: 400 }
      )
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 })
    }

    // Step 1: Resolve Riot ID → PUUID
    const account = await getAccountByRiotId(gameName, tag, region)

    // Step 2: Get summoner data by PUUID
    const summoner = await getSummonerByPuuid(account.puuid, region)

    // Step 3: Get ranked entries — non-fatal if it fails
    let ranked = extractSoloDuoRank([])

    try {
      const rankedEntries = await getRankedEntries(account.puuid, region)
      ranked = extractSoloDuoRank(rankedEntries)
    } catch (rankedError) {
      console.warn("[summoner route] Ranked entries failed, defaulting to Unranked:", rankedError)
    }

    const displayName = account.gameName
      ? `${account.gameName}#${account.tagLine}`
      : summoner.name

    const profile: SummonerProfile = {
      name: displayName,
      region,
      level: summoner.summonerLevel,
      puuid: account.puuid,
      profileIconId: summoner.profileIconId,
      ...ranked,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[summoner route]", error)

    if (error instanceof Error) {
      if (error.message === "Summoner not found") {
        return NextResponse.json({ error: "Summoner not found" }, { status: 404 })
      }
      if (
        error.message.includes("API key") ||
        error.message.includes("RIOT_API_KEY") ||
        error.message.includes("403")
      ) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
