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

        // Create new entry
        const newEntry: SummonerHistoryEntry = {
          gameName,
          tag,
          region: profile.region,
          rank: profile.rank,
          lp: profile.lp,
          level: profile.level,
          profileIconId: profile.profileIconId,
          lastSearched: Date.now(),
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

  const getFiltered = useCallback(
    (query: string): SummonerHistoryEntry[] => {
      // Only show results when user is typing (query has content)
      if (!query.trim()) {
        return []
      }

      const lowerQuery = query.toLowerCase()
      
      // If query includes #, split and search both parts
      if (lowerQuery.includes("#")) {
        const [gameNamePart, tagPart = ""] = lowerQuery.split("#", 2)
        return history
          .filter((entry) => {
            const entryGameName = entry.gameName.toLowerCase()
            const entryTag = entry.tag.toLowerCase()
            
            // Match if gameName contains gameNamePart and tag contains tagPart
            const gameNameMatch = gameNamePart ? entryGameName.includes(gameNamePart) : true
            const tagMatch = tagPart ? entryTag.includes(tagPart) : true
            
            return gameNameMatch && tagMatch
          })
          .sort((a, b) => {
            // Prioritize prefix matches over contains matches
            const aGameName = a.gameName.toLowerCase()
            const bGameName = b.gameName.toLowerCase()
            const aStartsWith = aGameName.startsWith(gameNamePart)
            const bStartsWith = bGameName.startsWith(gameNamePart)
            
            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1
            // If both have same match type, sort by lastSearched
            return b.lastSearched - a.lastSearched
          })
      } else {
        // No # in query - search in gameName (prefix match preferred, then contains)
        return history
          .filter((entry) => {
            const entryGameName = entry.gameName.toLowerCase()
            return entryGameName.includes(lowerQuery)
          })
          .sort((a, b) => {
            const aGameName = a.gameName.toLowerCase()
            const bGameName = b.gameName.toLowerCase()
            const aStartsWith = aGameName.startsWith(lowerQuery)
            const bStartsWith = bGameName.startsWith(lowerQuery)
            
            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1
            return b.lastSearched - a.lastSearched
          })
      }
    },
    [history]
  )

  return {
    history: useMemo(() => [...history].sort((a, b) => b.lastSearched - a.lastSearched), [history]),
    addToHistory,
    removeFromHistory,
    getFiltered,
  }
}
