"use client"

import { TrendingUp, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import type { Session } from "@/types"
import { getSessionLabel } from "@/utils/sessionGrouper"

interface WinrateChartProps {
  sessions: Session[]
}

export function WinrateChart({ sessions }: WinrateChartProps) {
  const data = [...sessions].reverse().map((s) => ({
    name: getSessionLabel(s.date),
    winRate: s.winRate,
    games: s.totalGames,
    wins: s.wins,
    losses: s.losses,
  }))

  return (
    <div className="lol-border rounded-lg p-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <BarChart3 className="h-4 w-4 text-primary" />
          Performance Timeline
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="font-mono">
            {data.length} sessions tracked
          </span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.24 0.03 250)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "oklch(0.55 0.03 250)" }}
              axisLine={{ stroke: "oklch(0.24 0.03 250)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "oklch(0.55 0.03 250)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine
              y={50}
              stroke="oklch(0.78 0.14 80 / 0.3)"
              strokeDasharray="4 4"
              label={{
                value: "50%",
                position: "right",
                fill: "oklch(0.78 0.14 80 / 0.5)",
                fontSize: 9,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload
                return (
                  <div className="lol-border-glow rounded-lg px-3 py-2 text-xs bg-card shadow-xl">
                    <p className="font-bold text-primary text-[11px]">{d.name}</p>
                    <p className="text-foreground font-mono mt-1">
                      {d.winRate}% WR
                    </p>
                    <p className="text-muted-foreground">
                      {d.wins}W {d.losses}L &middot; {d.games} games
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.winRate >= 60
                      ? "oklch(0.68 0.18 170)"
                      : entry.winRate >= 50
                      ? "oklch(0.78 0.14 80)"
                      : "oklch(0.58 0.22 25)"
                  }
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
