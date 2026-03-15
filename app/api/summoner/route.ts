import { NextRequest, NextResponse } from "next/server"
import type { Region, SummonerProfile } from "@/types"
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedEntries,
} from "../_lib/riot"

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
    let rank = "Unranked"
    let lp = 0
    let tier: string | undefined
    let division: string | undefined
    let rankedWins: number | undefined
    let rankedLosses: number | undefined

    try {
      const rankedEntries = await getRankedEntries(account.puuid, region)
      const soloDuo = rankedEntries.find((e) => e.queueType === "RANKED_SOLO_5x5")

      if (soloDuo) {
        tier = soloDuo.tier
        division = soloDuo.rank
        lp = soloDuo.leaguePoints
        rankedWins = soloDuo.wins
        rankedLosses = soloDuo.losses
        rank =
          tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER"
            ? tier
            : `${tier} ${division}`
      }
    } catch (rankedError) {
      console.warn("[summoner route] Ranked entries failed, defaulting to Unranked:", rankedError)
    }

    // Use Riot ID as display name (summoner.name is deprecated in new accounts)
    const displayName = account.gameName
      ? `${account.gameName}#${account.tagLine}`
      : summoner.name

    const profile: SummonerProfile = {
      name: displayName,
      region,
      level: summoner.summonerLevel,
      rank,
      lp,
      puuid: account.puuid,
      profileIconId: summoner.profileIconId,
      tier,
      division,
      rankedWins,
      rankedLosses,
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
