"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Profile header skeleton */}
      <div className="lol-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-lg bg-muted" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-5 w-40 bg-muted" />
            <Skeleton className="h-3.5 w-56 bg-muted" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-2.5 w-full rounded-full bg-muted" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 bg-muted" />
            <Skeleton className="h-3 w-20 bg-muted" />
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="lol-border rounded-lg p-3 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-16 bg-muted" />
            <Skeleton className="h-6 w-12 bg-muted" />
          </div>
        ))}
      </div>

      {/* Match list skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 bg-muted mb-1" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="lol-border rounded-lg p-3 flex items-center gap-3">
            <Skeleton className="w-1 h-10 rounded-full bg-muted" />
            <Skeleton className="h-11 w-11 rounded-lg bg-muted" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-28 bg-muted" />
              <Skeleton className="h-3 w-40 bg-muted" />
            </div>
            <Skeleton className="h-4 w-14 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
