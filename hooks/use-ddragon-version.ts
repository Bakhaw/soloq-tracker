import { useQuery } from "@tanstack/react-query"
import { DDRAGON_FALLBACK_VERSION } from "@/utils/constants"

async function fetchDdragonVersion(): Promise<string> {
  const response = await fetch("/api/ddragon-version")
  if (!response.ok) return DDRAGON_FALLBACK_VERSION
  const data = await response.json()
  return data.version
}

export function useDdragonVersion() {
  return useQuery({
    queryKey: ["ddragon-version"],
    queryFn: fetchDdragonVersion,
    // Version barely changes — cache for a full day
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  })
}
