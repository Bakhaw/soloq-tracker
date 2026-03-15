"use client"

import { useState, useCallback, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Region, Session, RankedMatch } from "@/types"
import { groupMatchesIntoSessions } from "@/utils/sessionGrouper"
import { useSummoner } from "@/hooks/use-summoner"
import { useMatches } from "@/hooks/use-matches"
import { useSummonerHistory } from "@/hooks/use-summoner-history"
import { SummonerSearch } from "@/components/summoner-search"
import { ProfileCard } from "@/components/profile-card"
import { SessionDashboard } from "@/components/session-dashboard"
import { MatchList } from "@/components/match-list"
import { WinrateChart } from "@/components/winrate-chart"
import { SessionHistory } from "@/components/session-history"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { EmptyState } from "@/components/empty-state"
import { RecentSearches } from "@/components/recent-searches"
import { ArrowLeft, Swords, Shield, ChevronDown, Loader2 } from "lucide-react"
import { PAGE_SIZE } from "@/utils/constants"

interface SearchParams {
  gameName: string
  tag: string
  region: Region
}

function HomeContent() {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [extraMatches, setExtraMatches] = useState<RankedMatch[]>([])
  const [loadMoreStart, setLoadMoreStart] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { addToHistory, history, removeFromHistory } = useSummonerHistory()

  // Initialize search params from URL on mount
  useEffect(() => {
    const gameName = urlSearchParams.get("gameName")
    const tag = urlSearchParams.get("tag")
    const region = urlSearchParams.get("region") as Region | null

    if (gameName && tag && region) {
      setSearchParams({ gameName, tag, region })
    }
  }, [urlSearchParams])

  // Fetch summoner data
  const {
    data: profile,
    isLoading: isLoadingSummoner,
    isError: isSummonerError,
  } = useSummoner({
    gameName: searchParams?.gameName ?? "",
    tag: searchParams?.tag ?? "",
    region: searchParams?.region ?? "EUW",
    enabled: searchParams !== null,
  })

  // Fetch matches data (only when we have a profile with puuid)
  const {
    data: matchesResponse,
    isLoading: isLoadingMatches,
    isError: isMatchesError,
  } = useMatches({
    puuid: profile?.puuid ?? "",
    region: searchParams?.region ?? "EUW",
    enabled: profile !== undefined && profile !== null,
  })

  const initialMatches = matchesResponse?.matches ?? []

  // Merge initial matches with any additionally loaded ones
  const allMatches = useMemo(
    () => [...initialMatches, ...extraMatches],
    [initialMatches, extraMatches]
  )

  // Process matches into sessions
  const sessions = useMemo(() => {
    if (allMatches.length === 0) return []
    return groupMatchesIntoSessions(allMatches)
  }, [allMatches])

  // Once initial matches load, use the API's hasMore to determine if more exist
  useEffect(() => {
    if (matchesResponse !== undefined) {
      setHasMore(matchesResponse.hasMore)
    }
  }, [matchesResponse])

  // Set active session to first session when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // Save to history when profile resolves successfully
  useEffect(() => {
    if (profile && searchParams) {
      addToHistory(profile, searchParams.gameName, searchParams.tag)
    }
  }, [profile, searchParams, addToHistory])

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0]

  // Determine app state
  const isLoading = isLoadingSummoner || isLoadingMatches
  const isError = isSummonerError || isMatchesError
  const hasNoData = !isLoading && !isError && (sessions.length === 0 || !profile)
  const showDashboard = !isLoading && !isError && profile && sessions.length > 0

  // Load more matches starting from loadMoreStart offset
  const handleLoadMore = useCallback(async () => {
    if (!profile || !searchParams || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(
        `/api/matches?puuid=${encodeURIComponent(profile.puuid)}&region=${searchParams.region}&start=${loadMoreStart}`
      )
      if (!res.ok) throw new Error("Failed to fetch")
      const { matches: newMatches, hasMore: moreAvailable }: { matches: RankedMatch[], hasMore: boolean } = await res.json()
      setExtraMatches((prev) => [...prev, ...newMatches])
      setLoadMoreStart((prev) => prev + PAGE_SIZE)
      setHasMore(moreAvailable)
    } catch (err) {
      console.error("[load more] Failed:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [profile, searchParams, loadMoreStart, isLoadingMore])

  const handleSearch = useCallback((gameName: string, tag: string, region: Region) => {
    setSearchParams({ gameName, tag, region })
    setActiveSessionId("")
    setExtraMatches([])
    setLoadMoreStart(PAGE_SIZE)
    setHasMore(true)
    
    // Update URL with search params
    const params = new URLSearchParams({ gameName, tag, region })
    router.push(`/?${params.toString()}`)
  }, [router])

  const handleBack = useCallback(() => {
    setSearchParams(null)
    setActiveSessionId("")
    setExtraMatches([])
    setLoadMoreStart(PAGE_SIZE)
    setHasMore(true)
    
    // Clear URL params
    router.push("/")
  }, [router])

  return (
    <main className="min-h-screen">
      {!searchParams && (
        <div className="container mx-auto px-4 max-w-lg flex flex-col items-center gap-6">
          <SummonerSearch onSearch={handleSearch} isLoading={false} />
          <RecentSearches
            history={history}
            onSelect={handleSearch}
            onRemove={removeFromHistory}
          />
        </div>
      )}

      {isLoading && (
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <BackButton onClick={handleBack} />
          <DashboardSkeleton />
        </div>
      )}

      {searchParams && (isError || hasNoData) && (
        <div className="container mx-auto px-4 max-w-lg">
          <div className="pt-8">
            <BackButton onClick={handleBack} />
            <EmptyState />
          </div>
        </div>
      )}

      {showDashboard && activeSession && profile && (
        <div className="container mx-auto px-4 max-w-6xl py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <BackButton onClick={handleBack} />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              <span className="font-mono uppercase tracking-wider">Ranked Solo/Duo</span>
            </div>
          </div>

          {/* Profile card — always visible, independent of session */}
          <div className="mb-6">
            <ProfileCard profile={profile} />
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
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2 lol-border rounded-lg hover:border-primary/30"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="font-mono uppercase tracking-wider">Loading...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      <span className="font-mono uppercase tracking-wider">Load more sessions</span>
                    </>
                  )}
                </button>
              )}
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-5 order-1 lg:order-2 min-w-0">
              <SessionDashboard session={activeSession} />

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

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <div className="container mx-auto px-4 max-w-lg">
          <SummonerSearch onSearch={() => {}} isLoading={false} />
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
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
