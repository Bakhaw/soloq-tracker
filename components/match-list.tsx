"use client"

import { Badge } from "@/components/ui/badge"
import type { RankedMatch } from "@/types"
import { formatDuration } from "@/utils/sessionGrouper"
import { getRoleLabel, getRoleColor } from "@/utils/champions"
import { getChampionIconUrl } from "@/utils/ddragon"
import { useDdragonVersion } from "@/hooks/use-ddragon-version"
import { DDRAGON_FALLBACK_VERSION } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Swords, Crown, Skull, Flame, RotateCcw } from "lucide-react"

interface MatchListProps {
  matches: RankedMatch[]
}

function getKDALabel(kills: number, deaths: number, assists: number): { label: string; className: string } | null {
  const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths
  if (deaths === 0 && kills + assists >= 6) return { label: "PERFECT", className: "text-primary bg-primary/15 border-primary/30" }
  if (kda >= 5) return { label: "LEGENDARY", className: "text-primary bg-primary/15 border-primary/30" }
  if (kda >= 3.5) return { label: "GREAT", className: "text-win bg-win/15 border-win/30" }
  if (deaths >= 8) return { label: "FEEDER", className: "text-loss bg-loss/15 border-loss/30" }
  return null
}

export function MatchList({ matches }: MatchListProps) {
  const { data: ddragonVersion = DDRAGON_FALLBACK_VERSION } = useDdragonVersion()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
        <Swords className="h-4 w-4 text-primary" />
        Battle Log
        <span className="text-primary font-mono">({matches.length})</span>
      </div>
      {matches.map((match, i) => (
        <div key={match.matchId} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
          <MatchRow match={match} ddragonVersion={ddragonVersion} />
        </div>
      ))}
    </div>
  )
}

function MatchRow({ match, ddragonVersion }: { match: RankedMatch; ddragonVersion: string }) {
  const kda = `${match.kills}/${match.deaths}/${match.assists}`
  const kdaRatio =
    match.deaths === 0
      ? match.kills + match.assists
      : (match.kills + match.assists) / match.deaths
  // Don't show KDA performance badges for remakes
  const kdaLabel = match.remake ? null : getKDALabel(match.kills, match.deaths, match.assists)

  const isRemake = match.remake

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg",
        isRemake
          ? "border border-remake/30 bg-remake/5"
          : match.win
          ? "lol-border bg-win/5"
          : "border border-loss/30 bg-loss/5"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Win/Loss/Remake indicator bar */}
        <div className={cn(
          "w-1.5 self-stretch rounded-full shrink-0",
          isRemake ? "bg-remake/60" : match.win ? "bg-win" : "bg-loss"
        )} />

        {/* Champion icon with ring */}
        <div className={cn(
          "relative h-11 w-11 shrink-0 rounded-lg overflow-hidden ring-2",
          isRemake ? "ring-remake/40" : match.win ? "ring-win/50" : "ring-loss/50"
        )}>
          <img
            src={getChampionIconUrl(match.champion, ddragonVersion)}
            alt={match.champion}
            className={cn("h-full w-full object-cover", isRemake && "opacity-60 grayscale")}
            crossOrigin="anonymous"
          />
          {/* Outcome icon overlay */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center",
            isRemake ? "bg-remake/80" : match.win ? "bg-win" : "bg-loss"
          )}>
            {isRemake ? (
              <RotateCcw className="h-2.5 w-2.5 text-remake-foreground" />
            ) : match.win ? (
              <Crown className="h-2.5 w-2.5 text-win-foreground" />
            ) : (
              <Skull className="h-2.5 w-2.5 text-loss-foreground" />
            )}
          </div>
        </div>

        {/* Champion name + KDA + role */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold truncate",
              isRemake ? "text-muted-foreground" : "text-foreground"
            )}>
              {match.champion}
            </span>
            {kdaLabel && (
              <Badge
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 border font-bold uppercase tracking-wider shrink-0",
                  kdaLabel.className
                )}
              >
                {kdaLabel.label}
              </Badge>
            )}
            {isRemake && (
              <Badge className="text-[9px] px-1.5 py-0 h-4 border font-bold uppercase tracking-wider shrink-0 text-remake-foreground bg-remake/15 border-remake/30">
                Remake
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "font-mono font-semibold",
                isRemake
                  ? "text-muted-foreground/60"
                  : kdaRatio >= 4
                  ? "text-win"
                  : kdaRatio >= 2
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {kda}
            </span>
            <span className="text-border">|</span>
            <span className={cn("font-medium", isRemake ? "text-muted-foreground/60" : getRoleColor(match.role))}>
              {getRoleLabel(match.role)}
            </span>
            <span className="text-border">|</span>
            <span className={cn("font-mono", isRemake && "text-muted-foreground/60")}>{match.cs} CS</span>
          </div>
        </div>

        {/* Duration + outcome label + MVP marker */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn(
            "text-[11px] font-bold uppercase tracking-widest font-mono",
            isRemake ? "text-remake-foreground/80" : match.win ? "text-win" : "text-loss"
          )}>
            {isRemake ? "Remake" : match.win ? "Victory" : "Defeat"}
          </span>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {formatDuration(match.duration)}
          </span>
          {!isRemake && match.win && kdaRatio >= 4 && (
            <div className="flex items-center gap-0.5">
              <Flame className="h-3 w-3 text-primary animate-streak-fire" />
              <span className="text-[9px] font-bold text-primary uppercase">MVP</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {formatTimeAgo(match.timestamp)}
          </span>
        </div>
      </div>
    </div>
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
