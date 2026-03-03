"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, Flame, Skull, Minus } from "lucide-react"
import type { Session } from "@/types"
import { getSessionLabel } from "@/utils/sessionGrouper"
import { cn } from "@/lib/utils"

interface SessionHistoryProps {
  sessions: Session[]
  activeSessionId: string
  onSelectSession: (sessionId: string) => void
}

function getMoodIcon(winRate: number) {
  if (winRate >= 60) return <Flame className="h-3 w-3 text-win" />
  if (winRate >= 45) return <Minus className="h-3 w-3 text-gold-dim" />
  return <Skull className="h-3 w-3 text-loss" />
}

export function SessionHistory({
  sessions,
  activeSessionId,
  onSelectSession,
}: SessionHistoryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
        <Calendar className="h-4 w-4 text-primary" />
        Session Archive
      </div>
      <div className="flex flex-col gap-1.5">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="w-full text-left"
            >
              <div
                className={cn(
                  "rounded-lg transition-all p-3 flex items-center justify-between gap-2 group",
                  isActive
                    ? "lol-border-glow bg-card"
                    : "lol-border hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {getMoodIcon(session.winRate)}
                  <div className="flex flex-col gap-0.5">
                    <p className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {getSessionLabel(session.date)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {session.totalGames} games &middot; {session.wins}W {session.losses}L
                      {session.remakes > 0 && <span className="text-remake-foreground/70"> {session.remakes}R</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={cn(
                      "text-[10px] border font-bold font-mono px-1.5 h-5",
                      session.winRate >= 60
                        ? "bg-win/15 text-win border-win/30"
                        : session.winRate >= 50
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-loss/15 text-loss border-loss/30"
                    )}
                  >
                    {session.winRate}%
                  </Badge>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
