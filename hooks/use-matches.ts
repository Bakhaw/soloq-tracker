import { useQuery } from "@tanstack/react-query"
import type { Region, RankedMatch } from "@/types"

interface UseMatchesParams {
  puuid: string
  region: Region
  start?: number
  enabled?: boolean
}

interface MatchesResponse {
  matches: RankedMatch[]
  hasMore: boolean
}

async function fetchMatches({
  puuid,
  region,
  start = 0,
}: UseMatchesParams): Promise<MatchesResponse> {
  const response = await fetch(
    `/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}&start=${start}`
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to fetch matches (${response.status})`)
  }

  return response.json()
}

export function useMatches(params: UseMatchesParams) {
  return useQuery({
    queryKey: ["matches", params.puuid, params.region, params.start ?? 0],
    queryFn: () => fetchMatches(params),
    enabled: params.enabled ?? false,
    retry: false,
  })
}
