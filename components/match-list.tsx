"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RankedMatch } from "@/types"
import { formatDuration } from "@/utils/sessionGrouper"
import { getChampionIconUrl, getRoleIcon, getRoleColor } from "@/utils/champions"
import { cn } from "@/lib/utils"
import { Swords } from "lucide-react"

interface MatchListProps {
  matches: RankedMatch[]
}

export function MatchList({ matches }: MatchListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
        <Swords className="h-4 w-4" />
        Match History
      </div>
      {matches.map((match) => (
        <MatchRow key={match.matchId} match={match} />
      ))}
    </div>
  )
}

function MatchRow({ match }: { match: RankedMatch }) {
  const kda = `${match.kills}/${match.deaths}/${match.assists}`
  const kdaRatio =
    match.deaths === 0
      ? match.kills + match.assists
      : (match.kills + match.assists) / match.deaths

  return (
    <Card
      className={cn(
        "bg-card border-border overflow-hidden transition-colors hover:bg-accent/40",
        match.win ? "border-l-2 border-l-win" : "border-l-2 border-l-loss"
      )}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Champion icon */}
        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted">
          <img
            src={getChampionIconUrl(match.champion)}
            alt={match.champion}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* Champion name + KDA */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {match.champion}
            </span>
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 border-none font-semibold shrink-0",
                match.win
                  ? "bg-win/15 text-win"
                  : "bg-loss/15 text-loss"
              )}
            >
              {match.win ? "WIN" : "LOSS"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "font-mono font-medium",
                kdaRatio >= 4
                  ? "text-win"
                  : kdaRatio >= 2
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {kda}
            </span>
            <span className="text-border">&middot;</span>
            <span className={getRoleColor(match.role)}>
              {getRoleIcon(match.role)}
            </span>
            <span className="text-border">&middot;</span>
            <span>{match.cs} CS</span>
          </div>
        </div>

        {/* Duration + time */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-xs font-medium text-muted-foreground font-mono">
            {formatDuration(match.duration)}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {formatTimeAgo(match.timestamp)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
