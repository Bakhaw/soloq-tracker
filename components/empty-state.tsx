"use client"

import { Swords } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="h-16 w-16 rounded-lg lol-border-glow flex items-center justify-center bg-card">
        <Swords className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-bold text-foreground uppercase tracking-wider">
          No Battles Found
        </p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          This summoner has no recent ranked matches. Queue up and come back, or try a different summoner name.
        </p>
      </div>
    </div>
  )
}
