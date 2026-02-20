"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, Swords, TrendingUp, Flame } from "lucide-react"
import type { Session, SummonerProfile } from "@/types"
import { getSessionStats, getSessionLabel, formatPlaytime } from "@/utils/sessionGrouper"

interface SessionDashboardProps {
  session: Session
  profile: SummonerProfile
}

export function SessionDashboard({ session, profile }: SessionDashboardProps) {
  const stats = getSessionStats(session)
  const label = getSessionLabel(session.date)

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {profile.region}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.rank} &middot; {profile.lp} LP &middot; Level {profile.level}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="text-xs bg-primary/10 text-primary border-none"
        >
          {label}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon={<Swords className="h-4 w-4" />}
          label="Total Games"
          value={String(session.totalGames)}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Win Rate"
          value={`${session.winRate}%`}
          valueColor={
            session.winRate >= 60
              ? "text-win"
              : session.winRate >= 50
              ? "text-chart-3"
              : "text-loss"
          }
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Wins / Losses"
          value={`${session.wins}W ${session.losses}L`}
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Average KDA"
          value={stats.averageKDA}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Total Playtime"
          value={formatPlaytime(stats.totalPlaytime)}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Avg CS"
          value={String(stats.averageCS)}
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className={`text-xl font-bold ${valueColor || "text-foreground"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
