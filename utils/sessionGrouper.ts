import type { RankedMatch, Session } from "@/types"

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000

export function groupMatchesIntoSessions(matches: RankedMatch[]): Session[] {
  if (matches.length === 0) return []

  // Sort matches by timestamp descending (newest first)
  const sorted = [...matches].sort((a, b) => b.timestamp - a.timestamp)

  const sessions: Session[] = []
  let currentSessionMatches: RankedMatch[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const timeDiff = currentSessionMatches[currentSessionMatches.length - 1].timestamp - sorted[i].timestamp

    if (timeDiff > EIGHT_HOURS_MS) {
      // Start a new session
      sessions.push(buildSession(currentSessionMatches, sessions.length))
      currentSessionMatches = [sorted[i]]
    } else {
      currentSessionMatches.push(sorted[i])
    }
  }

  // Push the last session
  if (currentSessionMatches.length > 0) {
    sessions.push(buildSession(currentSessionMatches, sessions.length))
  }

  return sessions
}

function buildSession(matches: RankedMatch[], index: number): Session {
  const countableMatches = matches.filter((m) => !m.remake)
  const wins = countableMatches.filter((m) => m.win).length
  const losses = countableMatches.length - wins
  const remakes = matches.length - countableMatches.length
  const date = new Date(matches[0].timestamp).toISOString().split("T")[0]

  return {
    id: `session-${index}`,
    date,
    matches,
    totalGames: matches.length,
    wins,
    losses,
    remakes,
    winRate: countableMatches.length > 0 ? Math.round((wins / countableMatches.length) * 100) : 0,
  }
}

export function getSessionStats(session: Session) {
  // Exclude remakes from stats to avoid skewing averages with near-zero-stat games
  const countableMatches = session.matches.filter((m) => !m.remake)
  const baseMatches = countableMatches.length > 0 ? countableMatches : session.matches

  const totalKills = baseMatches.reduce((sum, m) => sum + m.kills, 0)
  const totalDeaths = baseMatches.reduce((sum, m) => sum + m.deaths, 0)
  const totalAssists = baseMatches.reduce((sum, m) => sum + m.assists, 0)
  const totalPlaytime = baseMatches.reduce((sum, m) => sum + m.duration, 0)
  const totalCS = baseMatches.reduce((sum, m) => sum + m.cs, 0)

  const kda = totalDeaths === 0
    ? `${(totalKills + totalAssists).toFixed(1)} Perfect`
    : ((totalKills + totalAssists) / totalDeaths).toFixed(2)

  return {
    averageKDA: kda,
    totalKills,
    totalDeaths,
    totalAssists,
    totalPlaytime,
    averageCS: Math.round(totalCS / baseMatches.length),
  }
}

export function getSessionLabel(dateStr: string): string {
  const sessionDate = new Date(dateStr + "T12:00:00")
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const diffDays = Math.round((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today's Session"
  if (diffDays === 1) return "Yesterday's Session"
  if (diffDays < 7) return `${diffDays} days ago`

  return sessionDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toString().padStart(2, "0")}s`
}

export function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
