import type { Region, RankedMatch, Role } from "@/types"

// Region to platform code mapping (for Summoner V4, League V4)
const REGION_TO_PLATFORM: Record<Region, string> = {
  EUW: "euw1",
  EUNE: "eun1",
  NA: "na1",
  KR: "kr",
  JP: "jp1",
  BR: "br1",
  LAN: "la1",
  LAS: "la2",
  OCE: "oc1",
  TR: "tr1",
  RU: "ru",
}

// Region to regional routing value (for Account V1, Match V5)
const REGION_TO_ROUTING: Record<Region, string> = {
  EUW: "europe",
  EUNE: "europe",
  NA: "americas",
  KR: "asia",
  JP: "asia",
  BR: "americas",
  LAN: "americas",
  LAS: "americas",
  OCE: "americas",
  TR: "europe",
  RU: "europe",
}

// Map Riot's teamPosition to our Role type
function mapTeamPositionToRole(teamPosition: string): Role {
  switch (teamPosition) {
    case "TOP":
      return "TOP"
    case "JUNGLE":
      return "JUNGLE"
    case "MIDDLE":
      return "MID"
    case "BOTTOM":
      return "ADC"
    case "UTILITY":
      return "SUPPORT"
    default:
      return "MID"
  }
}

// Get API key from environment
function getApiKey(): string {
  const key = process.env.RIOT_API_KEY
  if (!key || key === "RGAPI-xxxx" || key.trim() === "") {
    throw new Error(
      "RIOT_API_KEY is not set or is using a placeholder value. Please add a valid key to .env.local. Get yours at https://developer.riotgames.com/"
    )
  }
  return key.trim()
}

// Riot API base URLs
function getAccountApiUrl(region: Region): string {
  return `https://${REGION_TO_ROUTING[region]}.api.riotgames.com`
}

function getPlatformApiUrl(region: Region): string {
  return `https://${REGION_TO_PLATFORM[region]}.api.riotgames.com`
}

function getRegionalApiUrl(region: Region): string {
  return `https://${REGION_TO_ROUTING[region]}.api.riotgames.com`
}

// Helper: make a Riot API request with proper error handling and automatic retry on 429
async function riotFetch(url: string, apiKey: string, retries = 1): Promise<Response> {
  const response = await fetch(url, {
    headers: { "X-Riot-Token": apiKey },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    let message = `Riot API error: ${response.status} ${response.statusText}`

    if (response.status === 404) {
      throw new Error("Summoner not found")
    }
    if (response.status === 403) {
      let detail = ""
      try {
        const json = JSON.parse(errorText)
        detail = json.status?.message || json.message || ""
      } catch {
        detail = errorText
      }
      throw new Error(
        `API key authentication failed (403)${detail ? `: ${detail}` : ". Please verify your RIOT_API_KEY is valid and not expired."}`
      )
    }
    if (response.status === 429) {
      if (retries > 0) {
        // Respect the Retry-After header but cap at 5s to avoid long hangs
        const retryAfter = Math.min(parseInt(response.headers.get("Retry-After") ?? "5", 10), 5)
        console.warn(`[Riot API] Rate limited. Retrying after ${retryAfter}s (${retries} retries left)`)
        await new Promise((resolve) => setTimeout(resolve, (retryAfter + 1) * 1000))
        return riotFetch(url, apiKey, retries - 1)
      }
      throw new Error("Rate limit exceeded. Please wait a moment before trying again.")
    }

    console.error(`[Riot API] ${response.status} ${url}:`, errorText)
    throw new Error(message)
  }

  return response
}

// Account V1: Get PUUID by Riot ID
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: Region
): Promise<{ puuid: string; gameName: string; tagLine: string }> {
  const apiKey = getApiKey()
  const baseUrl = getAccountApiUrl(region)
  const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  const response = await riotFetch(url, apiKey)
  return response.json()
}

// Summoner V4: Get summoner data by PUUID
export async function getSummonerByPuuid(
  puuid: string,
  region: Region
): Promise<{
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}> {
  const apiKey = getApiKey()
  const url = `${getPlatformApiUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  const response = await riotFetch(url, apiKey)
  return response.json()
}

// League V4: Get ranked entries by summoner ID
export async function getRankedEntries(
  summonerId: string,
  region: Region
): Promise<
  Array<{
    leagueId: string
    queueType: string
    tier: string
    rank: string
    summonerId: string
    leaguePoints: number
    wins: number
    losses: number
  }>
> {
  const apiKey = getApiKey()
  const url = `${getPlatformApiUrl(region)}/lol/league/v4/entries/by-summoner/${summonerId}`
  const response = await riotFetch(url, apiKey)
  return response.json()
}

// Match V5: Get match IDs by PUUID (ranked only)
export async function getMatchIds(
  puuid: string,
  region: Region,
  count: number = 100,
  start: number = 0
): Promise<string[]> {
  const apiKey = getApiKey()
  const url = `${getRegionalApiUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=${start}&count=${count}`
  const response = await riotFetch(url, apiKey)
  return response.json()
}

// Match V5: Get match detail by match ID
export async function getMatchDetail(
  matchId: string,
  region: Region
): Promise<any> {
  const apiKey = getApiKey()
  const url = `${getRegionalApiUrl(region)}/lol/match/v5/matches/${matchId}`

  try {
    const response = await riotFetch(url, apiKey)
    return response.json()
  } catch (err: any) {
    // 404 for a single match is non-fatal — skip it
    if (err.message === "Summoner not found" || err.message?.includes("404")) {
      return null
    }
    throw err
  }
}

// Champion ID to name mapping cache
let championIdToNameCache: Record<number, string> | null = null
let cachedDdragonVersion: string | null = null

// Fetch latest DDragon version
export async function getLatestDdragonVersion(): Promise<string> {
  if (cachedDdragonVersion) return cachedDdragonVersion

  const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
  const versions: string[] = await response.json()
  cachedDdragonVersion = versions[0]
  return cachedDdragonVersion
}

// Fetch champion data from Data Dragon and build ID → DDragon ID mapping
async function getChampionIdToNameMap(): Promise<Record<number, string>> {
  if (championIdToNameCache) return championIdToNameCache

  try {
    const version = await getLatestDdragonVersion()
    const championResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    )
    const championData = await championResponse.json()

    const mapping: Record<number, string> = {}
    for (const championInfo of Object.values(championData.data)) {
      const champ = championInfo as { key: string; id: string }
      const championId = parseInt(champ.key, 10)
      if (!isNaN(championId)) {
        mapping[championId] = champ.id
      }
    }

    championIdToNameCache = mapping
    return mapping
  } catch (error) {
    console.error("[DDragon] Failed to fetch champion data:", error)
    return {}
  }
}

// Process match data and extract the relevant participant's stats
// Only processes Solo/Duo ranked games (queueId 420)
export async function extractMatchData(
  matchData: any,
  puuid: string
): Promise<RankedMatch | null> {
  if (!matchData?.info) return null

  // Filter: Only Solo/Duo ranked (queueId 420)
  // Flex ranked is 440, other queues are different
  const queueId = matchData.info.queueId
  if (queueId !== 420) {
    return null // Skip non-Solo/Duo ranked games
  }

  const { participants, gameDuration, gameCreation } = matchData.info

  if (!Array.isArray(participants)) return null

  // Match V5: participant puuid is directly on each participant object
  const participant = participants.find((p: any) => p.puuid === puuid)
  if (!participant) {
    console.error("[extractMatchData] Participant not found for puuid:", puuid)
    return null
  }

  const {
    championId,
    teamPosition,
    win,
    kills,
    deaths,
    assists,
    totalMinionsKilled,
    neutralMinionsKilled,
    gameEndedInEarlySurrender,
  } = participant

  // A remake is an early surrender that happened before ~3 min (we use 300s as the safe threshold)
  const remake = gameEndedInEarlySurrender === true && gameDuration < 300

  const championMap = await getChampionIdToNameMap()
  const champion = championMap[championId] || `Champion${championId}`

  // Calculate end timestamp: gameCreation (ms) + gameDuration (seconds * 1000)
  const endTimestamp = gameCreation + gameDuration * 1000

  return {
    matchId: matchData.metadata.matchId,
    timestamp: endTimestamp,
    champion,
    win,
    kills,
    deaths,
    assists,
    duration: gameDuration,
    role: mapTeamPositionToRole(teamPosition || "MIDDLE"),
    cs: (totalMinionsKilled || 0) + (neutralMinionsKilled || 0),
    remake,
  }
}
