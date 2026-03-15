"use client"

import { X, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDdragonVersion } from "@/hooks/use-ddragon-version"
import type { SummonerHistoryEntry, Region } from "@/types"

const RANK_EMBLEM_BASE = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests"

interface RecentSearchesProps {
  history: SummonerHistoryEntry[]
  onSelect: (gameName: string, tag: string, region: Region) => void
  onRemove: (gameName: string, tag: string, region: Region) => void
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentSearches({ history, onSelect, onRemove }: RecentSearchesProps) {
  const { data: ddragonVersion } = useDdragonVersion()

  if (history.length === 0) return null

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Recent Searches
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {history.map((entry) => {
          const iconUrl = ddragonVersion
            ? `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${entry.profileIconId}.png`
            : null

          return (
            <div
              key={`${entry.gameName}-${entry.tag}-${entry.region}`}
              className="group lol-border rounded-lg px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => onSelect(entry.gameName, entry.tag, entry.region)}
            >
              {/* Profile icon */}
              <div className="h-9 w-9 rounded-md lol-border shrink-0 overflow-hidden bg-card flex items-center justify-center">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt="Profile Icon"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <span className="text-base font-bold text-primary">
                    {entry.gameName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Summoner info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {entry.gameName}
                    <span className="text-muted-foreground font-normal">#{entry.tag}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono border-primary/30 text-primary h-4 px-1 shrink-0"
                  >
                    {entry.region}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {entry.tier && (
                    <img
                      src={`${RANK_EMBLEM_BASE}/${entry.tier.toLowerCase()}.svg`}
                      alt={entry.rank}
                      className="h-4 w-4 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                    />
                  )}
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {entry.rank} &middot; {entry.lp} LP
                  </span>
                </div>
              </div>

              {/* Timestamp + remove */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {timeAgo(entry.lastSearched)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(entry.gameName, entry.tag, entry.region)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-loss p-0.5 rounded"
                  aria-label="Remove from history"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
