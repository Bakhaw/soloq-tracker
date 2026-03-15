"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { SummonerHistoryEntry, SummonerProfile, Region } from "@/types"

const STORAGE_KEY = "soloq-history"
const MAX_ENTRIES = 15

function loadHistory(): SummonerHistoryEntry[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as SummonerHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(history: SummonerHistoryEntry[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error("[use-summoner-history] Failed to save to localStorage:", error)
  }
}

export function useSummonerHistory() {
  const [history, setHistory] = useState<SummonerHistoryEntry[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const addToHistory = useCallback(
    (profile: SummonerProfile, gameName: string, tag: string) => {
      setHistory((prev) => {
        // Remove existing entry if it exists (same gameName, tag, region)
        const filtered = prev.filter(
          (entry) =>
            !(
              entry.gameName.toLowerCase() === gameName.toLowerCase() &&
              entry.tag.toLowerCase() === tag.toLowerCase() &&
              entry.region === profile.region
            )
        )

        const newEntry: SummonerHistoryEntry = {
          gameName,
          tag,
          region: profile.region,
          rank: profile.rank,
          lp: profile.lp,
          level: profile.level,
          profileIconId: profile.profileIconId,
          lastSearched: Date.now(),
          tier: profile.tier,
          division: profile.division,
          rankedWins: profile.rankedWins,
          rankedLosses: profile.rankedLosses,
        }

        // Add to front and limit to MAX_ENTRIES
        const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES)
        saveHistory(updated)
        return updated
      })
    },
    []
  )

  const removeFromHistory = useCallback(
    (gameName: string, tag: string, region: Region) => {
      setHistory((prev) => {
        const filtered = prev.filter(
          (entry) =>
            !(
              entry.gameName.toLowerCase() === gameName.toLowerCase() &&
              entry.tag.toLowerCase() === tag.toLowerCase() &&
              entry.region === region
            )
        )
        saveHistory(filtered)
        return filtered
      })
    },
    []
  )

  return {
    history: useMemo(() => [...history].sort((a, b) => b.lastSearched - a.lastSearched), [history]),
    addToHistory,
    removeFromHistory,
  }
}
