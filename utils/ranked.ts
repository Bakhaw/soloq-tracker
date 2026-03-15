import type { Region } from "@/types"

export const VALID_REGIONS: Region[] = [
  "EUW", "EUNE", "NA", "KR", "JP", "BR", "LAN", "LAS", "OCE", "TR", "RU",
]

interface RankedEntry {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

export interface SoloDuoRank {
  rank: string
  lp: number
  tier: string | undefined
  division: string | undefined
  rankedWins: number | undefined
  rankedLosses: number | undefined
}

const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"])

export function extractSoloDuoRank(rankedEntries: RankedEntry[]): SoloDuoRank {
  const soloDuo = rankedEntries.find((e) => e.queueType === "RANKED_SOLO_5x5")

  if (!soloDuo) {
    return { rank: "Unranked", lp: 0, tier: undefined, division: undefined, rankedWins: undefined, rankedLosses: undefined }
  }

  const { tier, rank: division, leaguePoints, wins, losses } = soloDuo
  const rank = APEX_TIERS.has(tier) ? tier : `${tier} ${division}`

  return { rank, lp: leaguePoints, tier, division, rankedWins: wins, rankedLosses: losses }
}
