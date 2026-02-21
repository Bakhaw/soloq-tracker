"use client"

import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, Swords, TrendingUp, Flame, Zap, Shield, Skull } from "lucide-react"
import type { Session, SummonerProfile } from "@/types"
import { getSessionStats, getSessionLabel, formatPlaytime } from "@/utils/sessionGrouper"

interface SessionDashboardProps {
  session: Session
  profile: SummonerProfile
}

function getSessionMood(winRate: number): { label: string; icon: React.ReactNode; className: string } {
  if (winRate >= 75) return { label: "UNSTOPPABLE", icon: <Zap className="h-3.5 w-3.5" />, className: "bg-primary/20 text-primary border-primary/40 animate-gold-pulse" }
  if (winRate >= 60) return { label: "ON FIRE", icon: <Flame className="h-3.5 w-3.5" />, className: "bg-win/20 text-win border-win/40" }
  if (winRate >= 50) return { label: "HOLDING STEADY", icon: <Shield className="h-3.5 w-3.5" />, className: "bg-lol-blue/20 text-lol-blue border-lol-blue/40" }
  if (winRate >= 35) return { label: "ROUGH DAY", icon: <Skull className="h-3.5 w-3.5" />, className: "bg-loss/20 text-loss border-loss/40" }
  return { label: "FULL TILT", icon: <Skull className="h-3.5 w-3.5 animate-streak-fire" />, className: "bg-loss/25 text-loss border-loss/50" }
}

function getStreakInfo(matches: Session["matches"]): { type: "win" | "loss" | "none"; count: number } {
  if (matches.length === 0) return { type: "none", count: 0 }
  const first = matches[0].win
  let count = 0
  for (const m of matches) {
    if (m.win === first) count++
    else break
  }
  if (count < 2) return { type: "none", count: 0 }
  return { type: first ? "win" : "loss", count }
}

export function SessionDashboard({ session, profile }: SessionDashboardProps) {
  const stats = getSessionStats(session)
  const label = getSessionLabel(session.date)
  const mood = getSessionMood(session.winRate)
  const streak = getStreakInfo(session.matches)

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Profile header with rank crest */}
      <div className="lol-border rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Rank crest */}
            <div className="relative h-14 w-14 rounded-lg lol-border-glow flex items-center justify-center shrink-0 bg-card">
              <span className="text-xl font-bold text-primary">{profile.rank.charAt(0)}</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-primary bg-card px-1.5 rounded border border-primary/30">
                {profile.lp}LP
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary h-5">
                  {profile.region}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.rank} &middot; Level {profile.level}
              </p>
              <p className="text-xs text-gold-dim font-medium">{label}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Mood badge */}
            <Badge className={`text-[10px] font-bold uppercase tracking-wider border ${mood.className} gap-1`}>
              {mood.icon}
              {mood.label}
            </Badge>
            {/* Streak badge */}
            {streak.type !== "none" && (
              <Badge
                className={`text-[10px] font-bold border gap-1 ${
                  streak.type === "win"
                    ? "bg-win/15 text-win border-win/30"
                    : "bg-loss/15 text-loss border-loss/30"
                }`}
              >
                {streak.type === "win" ? (
                  <Flame className="h-3 w-3 animate-streak-fire" />
                ) : (
                  <Skull className="h-3 w-3" />
                )}
                {streak.count} {streak.type === "win" ? "Win" : "Loss"} Streak
              </Badge>
            )}
          </div>
        </div>

        {/* Win rate XP bar */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Session Win Rate</span>
            <span className="font-mono font-bold text-foreground">{session.winRate}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 animate-xp-fill"
              style={{
                "--fill-width": `${session.winRate}%`,
                width: `${session.winRate}%`,
                background:
                  session.winRate >= 60
                    ? "oklch(0.68 0.18 170)"
                    : session.winRate >= 50
                    ? "oklch(0.78 0.14 80)"
                    : "oklch(0.58 0.22 25)",
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{session.wins}W - {session.losses}L</span>
            <span>{session.totalGames} games played</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - hexagonal/gaming styled */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        <GameStatCard
          icon={<Swords className="h-4 w-4 text-primary" />}
          label="Games"
          value={String(session.totalGames)}
        />
        <GameStatCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="Win Rate"
          value={`${session.winRate}%`}
          highlight={session.winRate >= 60 ? "win" : session.winRate < 45 ? "loss" : undefined}
        />
        <GameStatCard
          icon={<Trophy className="h-4 w-4 text-primary" />}
          label="Record"
          value={`${session.wins}W ${session.losses}L`}
        />
        <GameStatCard
          icon={<Target className="h-4 w-4 text-primary" />}
          label="KDA"
          value={stats.averageKDA}
          sub={`${stats.totalKills}/${stats.totalDeaths}/${stats.totalAssists}`}
        />
        <GameStatCard
          icon={<Clock className="h-4 w-4 text-primary" />}
          label="Playtime"
          value={formatPlaytime(stats.totalPlaytime)}
        />
        <GameStatCard
          icon={<Flame className="h-4 w-4 text-primary" />}
          label="Avg CS"
          value={String(stats.averageCS)}
        />
      </div>
    </div>
  )
}

function GameStatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  highlight?: "win" | "loss"
}) {
  return (
    <div className="lol-border rounded-lg p-3 flex flex-col gap-2 group hover:lol-border-glow transition-shadow">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className={`text-lg font-bold font-mono ${
        highlight === "win" ? "text-win" : highlight === "loss" ? "text-loss" : "text-foreground"
      }`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-muted-foreground font-mono">{sub}</p>
      )}
    </div>
  )
}
