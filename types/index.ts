export type Region = "EUW" | "EUNE" | "NA" | "KR" | "JP" | "BR" | "LAN" | "LAS" | "OCE" | "TR" | "RU"

export type Role = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT"

export interface RankedMatch {
  matchId: string
  timestamp: number
  champion: string
  win: boolean
  kills: number
  deaths: number
  assists: number
  duration: number // in seconds
  role: Role
  cs: number
  remake: boolean
}

export interface Session {
  id: string
  date: string // ISO date string
  matches: RankedMatch[]
  totalGames: number
  wins: number
  losses: number
  remakes: number
  winRate: number
}

export interface SessionStats {
  averageKDA: string
  totalPlaytime: number // in seconds
  averageCS: number
}

export interface SummonerProfile {
  name: string
  region: Region
  level: number
  rank: string
  lp: number
  puuid: string
  profileIconId: number
  tier?: string
  division?: string
  rankedWins?: number
  rankedLosses?: number
}

export interface SummonerHistoryEntry {
  gameName: string
  tag: string
  region: Region
  rank: string
  lp: number
  level: number
  profileIconId: number
  lastSearched: number // Date.now()
  tier?: string
  division?: string
  rankedWins?: number
  rankedLosses?: number
}
