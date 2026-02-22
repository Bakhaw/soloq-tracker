import { useQuery } from "@tanstack/react-query"
import type { Region, SummonerProfile } from "@/types"

interface UseSummonerParams {
  gameName: string
  tag: string
  region: Region
  enabled?: boolean
}

async function fetchSummoner({
  gameName,
  tag,
  region,
}: UseSummonerParams): Promise<SummonerProfile> {
  const response = await fetch(
    `/api/summoner?gameName=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tag)}&region=${region}`
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to fetch summoner (${response.status})`)
  }

  return response.json()
}

export function useSummoner(params: UseSummonerParams) {
  return useQuery({
    queryKey: ["summoner", params.gameName, params.tag, params.region],
    queryFn: () => fetchSummoner(params),
    enabled: params.enabled ?? false,
    retry: false,
  })
}
