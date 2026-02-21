"use client"

import { useState, useCallback } from "react"
import type { Region, Session, SummonerProfile } from "@/types"
import { groupMatchesIntoSessions } from "@/utils/sessionGrouper"
import { fetchRankedMatches, fetchSummonerProfile } from "@/services/riotMockService"
import { SummonerSearch } from "@/components/summoner-search"
import { SessionDashboard } from "@/components/session-dashboard"
import { MatchList } from "@/components/match-list"
import { WinrateChart } from "@/components/winrate-chart"
import { SessionHistory } from "@/components/session-history"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, Swords, Shield } from "lucide-react"

type AppState = "search" | "loading" | "dashboard" | "empty"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("search")
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [profile, setProfile] = useState<SummonerProfile | null>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0]

  const handleSearch = useCallback(async (name: string, region: Region) => {
    setAppState("loading")

    try {
      const [profileData, matches] = await Promise.all([
        fetchSummonerProfile(name, region),
        fetchRankedMatches(name, region),
      ])

      setProfile(profileData)

      const grouped = groupMatchesIntoSessions(matches)

      if (grouped.length === 0) {
        setAppState("empty")
        return
      }

      setSessions(grouped)
      setActiveSessionId(grouped[0].id)
      setAppState("dashboard")
    } catch {
      setAppState("empty")
    }
  }, [])

  const handleBack = useCallback(() => {
    setAppState("search")
    setSessions([])
    setProfile(null)
    setActiveSessionId("")
  }, [])

  return (
    <main className="min-h-screen">
      {appState === "search" && (
        <div className="container mx-auto px-4 max-w-lg">
          <SummonerSearch onSearch={handleSearch} isLoading={false} />
        </div>
      )}

      {appState === "loading" && (
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <BackButton onClick={handleBack} />
          <DashboardSkeleton />
        </div>
      )}

      {appState === "empty" && (
        <div className="container mx-auto px-4 max-w-lg">
          <div className="pt-8">
            <BackButton onClick={handleBack} />
            <EmptyState />
          </div>
        </div>
      )}

      {appState === "dashboard" && activeSession && profile && (
        <div className="container mx-auto px-4 max-w-6xl py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <BackButton onClick={handleBack} />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              <span className="font-mono uppercase tracking-wider">Ranked Solo/Duo</span>
            </div>
          </div>

          {/* Main layout: sidebar + content */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar - Session History */}
            <aside className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
              <SessionHistory
                sessions={sessions}
                activeSessionId={activeSession.id}
                onSelectSession={setActiveSessionId}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-5 order-1 lg:order-2 min-w-0">
              <SessionDashboard
                session={activeSession}
                profile={profile}
              />

              {/* Win rate chart */}
              {sessions.length > 1 && (
                <WinrateChart sessions={sessions} />
              )}

              {/* Match list */}
              <MatchList matches={activeSession.matches} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4 group"
    >
      <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
      <Swords className="h-3 w-3 text-primary" />
      <span className="font-semibold uppercase tracking-wider">New Search</span>
    </button>
  )
}
