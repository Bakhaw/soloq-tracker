const RANK_EMBLEM_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests"

export function getRankEmblemUrl(tier?: string): string {
  if (!tier) return `${RANK_EMBLEM_BASE}/unranked.svg`
  return `${RANK_EMBLEM_BASE}/${tier.toLowerCase()}.svg`
}

export function getProfileIconUrl(
  profileIconId: number,
  ddragonVersion: string | undefined
): string | null {
  if (!ddragonVersion) return null
  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${profileIconId}.png`
}

export function getChampionIconUrl(championName: string, version: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`
}
