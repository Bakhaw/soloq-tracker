import type { RankedMatch, Role, SummonerProfile, Region } from "@/types"

const CHAMPIONS = [
  "Aatrox", "Ahri", "Akali", "Camille", "Darius", "Ezreal", "Fiora",
  "Garen", "Irelia", "Jhin", "Jinx", "Kaisa", "Katarina", "Khazix",
  "LeeSin", "Lux", "MissFortune", "Morgana", "Nautilus", "Orianna",
  "Pyke", "Renekton", "Senna", "Thresh", "Varus", "Vayne", "Yasuo",
  "Yone", "Zed", "Zyra",
]

const ROLES: Role[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMatch(timestamp: number): RankedMatch {
  const win = Math.random() > 0.45
  const role = randomElement(ROLES)
  const kills = win ? randomInt(3, 18) : randomInt(1, 10)
  const deaths = win ? randomInt(1, 7) : randomInt(3, 12)
  const assists = randomInt(2, 16)
  const duration = randomInt(1200, 2700) // 20-45 mins

  return {
    matchId: `EUW1_${randomInt(6000000000, 7000000000)}`,
    timestamp,
    champion: randomElement(CHAMPIONS),
    win,
    kills,
    deaths,
    assists,
    duration,
    role,
    cs: randomInt(120, 320),
  }
}

function generateMatchHistory(): RankedMatch[] {
  const matches: RankedMatch[] = []
  const now = Date.now()

  // Today's session: 4-6 games, spaced 30-50 min apart
  let ts = now - randomInt(30, 90) * 60 * 1000
  const todayGames = randomInt(4, 6)
  for (let i = 0; i < todayGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  // Yesterday session: 3-5 games
  ts = now - 24 * 60 * 60 * 1000 - randomInt(60, 180) * 60 * 1000
  const yesterdayGames = randomInt(3, 5)
  for (let i = 0; i < yesterdayGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  // 2 days ago: 5-7 games
  ts = now - 2 * 24 * 60 * 60 * 1000 - randomInt(120, 300) * 60 * 1000
  const twoDaysGames = randomInt(5, 7)
  for (let i = 0; i < twoDaysGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  // 4 days ago: 2-4 games
  ts = now - 4 * 24 * 60 * 60 * 1000 - randomInt(60, 240) * 60 * 1000
  const fourDaysGames = randomInt(2, 4)
  for (let i = 0; i < fourDaysGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  // 5 days ago: 3-5 games
  ts = now - 5 * 24 * 60 * 60 * 1000 - randomInt(60, 240) * 60 * 1000
  const fiveDaysGames = randomInt(3, 5)
  for (let i = 0; i < fiveDaysGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  // 7 days ago: 4-6 games
  ts = now - 7 * 24 * 60 * 60 * 1000 - randomInt(60, 240) * 60 * 1000
  const sevenDaysGames = randomInt(4, 6)
  for (let i = 0; i < sevenDaysGames; i++) {
    matches.push(generateMatch(ts))
    ts -= randomInt(30, 50) * 60 * 1000
  }

  return matches
}

// Simulates a delay like a real API call
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSummonerProfile(
  name: string,
  region: Region
): Promise<SummonerProfile> {
  await delay(800)

  return {
    name,
    region,
    level: randomInt(120, 500),
    rank: randomElement(["Iron IV", "Bronze II", "Silver I", "Gold III", "Platinum II", "Diamond IV", "Master", "Grandmaster", "Challenger"]),
    lp: randomInt(0, 100),
  }
}

export async function fetchRankedMatches(
  _name: string,
  _region: Region
): Promise<RankedMatch[]> {
  await delay(1200)
  return generateMatchHistory()
}
