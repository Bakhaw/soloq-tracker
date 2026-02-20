"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight } from "lucide-react"
import type { Session } from "@/types"
import { getSessionLabel } from "@/utils/sessionGrouper"
import { cn } from "@/lib/utils"

interface SessionHistoryProps {
  sessions: Session[]
  activeSessionId: string
  onSelectSession: (sessionId: string) => void
}

export function SessionHistory({
  sessions,
  activeSessionId,
  onSelectSession,
}: SessionHistoryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
        <Calendar className="h-4 w-4" />
        Session History
      </div>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="w-full text-left"
            >
              <Card
                className={cn(
                  "bg-card border-border transition-colors hover:bg-accent/60 cursor-pointer",
                  isActive && "border-primary/40 bg-primary/5"
                )}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {getSessionLabel(session.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.totalGames} games
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs border-none font-semibold",
                        session.winRate >= 60
                          ? "bg-win/15 text-win"
                          : session.winRate >= 50
                          ? "bg-primary/15 text-primary"
                          : "bg-loss/15 text-loss"
                      )}
                    >
                      {session.winRate}%
                    </Badge>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
