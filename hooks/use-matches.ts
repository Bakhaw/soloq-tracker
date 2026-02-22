import { useQuery } from "@tanstack/react-query"
import type { Region, RankedMatch } from "@/types"

interface UseMatchesParams {
  puuid: string
  region: Region
  count?: number
  enabled?: boolean
}

async function fetchMatches({
  puuid,
  region,
  count = 30,
}: UseMatchesParams): Promise<RankedMatch[]> {
  const response = await fetch(
    `/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}&count=${count}`
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to fetch matches (${response.status})`)
  }

  return response.json()
}

export function useMatches(params: UseMatchesParams) {
  return useQuery({
    queryKey: ["matches", params.puuid, params.region, params.count],
    queryFn: () => fetchMatches(params),
    enabled: params.enabled ?? false,
    retry: false,
  })
}
