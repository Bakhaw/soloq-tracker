"use client"

import { SearchX } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-foreground">No matches found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          This summoner has no recent ranked matches. Try a different summoner name or region.
        </p>
      </div>
    </div>
  )
}
