"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-28" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Match list skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-20 mb-2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-3 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
