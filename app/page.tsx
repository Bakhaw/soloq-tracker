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
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <DashboardSkeleton />
        </div>
      )}

      {appState === "empty" && (
        <div className="container mx-auto px-4 max-w-lg">
          <div className="pt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <EmptyState />
          </div>
        </div>
      )}

      {appState === "dashboard" && activeSession && profile && (
        <div className="container mx-auto px-4 max-w-6xl py-6">
          {/* Back button */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              New Search
            </Button>
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
            <div className="flex-1 flex flex-col gap-6 order-1 lg:order-2 min-w-0">
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
