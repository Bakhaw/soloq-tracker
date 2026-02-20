"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
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
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Win Rate by Session
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.01 260)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "oklch(0.60 0.02 260)" }}
                axisLine={{ stroke: "oklch(0.25 0.01 260)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "oklch(0.60 0.02 260)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine
                y={50}
                stroke="oklch(0.40 0.01 260)"
                strokeDasharray="4 4"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-popover border border-border rounded-md px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-foreground">{d.name}</p>
                      <p className="text-muted-foreground">
                        {d.winRate}% WR &middot; {d.wins}W {d.losses}L
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.winRate >= 60
                        ? "oklch(0.70 0.18 155)"
                        : entry.winRate >= 50
                        ? "oklch(0.65 0.2 250)"
                        : "oklch(0.55 0.22 25)"
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
