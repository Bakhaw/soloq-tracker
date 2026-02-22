"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import type { Region } from "@/types"

interface AutocompleteResult {
  gameName: string
  tag: string
  region: Region
  rank: string
  lp: number
  level: number
  profileIconId: number
  valid: boolean
}

async function validateRiotId(
  gameName: string,
  tag: string,
  region: Region
): Promise<AutocompleteResult | null> {
  try {
    const response = await fetch(
      `/api/summoner/validate?gameName=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tag)}&region=${region}`
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export function useSummonerAutocomplete(query: string, region: Region) {
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  // Parse query to extract gameName and tag
  const parseQuery = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed.includes("#")) return null

    const parts = trimmed.split("#")
    if (parts.length !== 2) return null

    const [gameName, tag] = parts.map((p) => p.trim())
    if (!gameName || !tag) return null

    return { gameName, tag }
  }, [])

  const parsed = parseQuery(debouncedQuery)

  // Only query if we have a complete-looking Riot ID
  const { data: validationResult, isLoading } = useQuery({
    queryKey: ["summoner-autocomplete", parsed?.gameName, parsed?.tag, region],
    queryFn: () => {
      if (!parsed) return null
      return validateRiotId(parsed.gameName, parsed.tag, region)
    },
    enabled: !!parsed && debouncedQuery.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
    retry: false,
  })

  return {
    result: validationResult,
    isLoading,
    hasCompleteRiotId: !!parsed,
  }
}
