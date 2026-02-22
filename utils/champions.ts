// Champion icon URLs from Riot's Data Dragon CDN
// Version is passed dynamically so icons are always up to date
export function getChampionIconUrl(championName: string, version: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`
}

export function getRoleIcon(role: string): string {
  const roleMap: Record<string, string> = {
    TOP: "Top",
    JUNGLE: "Jungle",
    MID: "Mid",
    ADC: "Bot",
    SUPPORT: "Support",
  }
  return roleMap[role] || role
}

export function getRoleColor(role: string): string {
  const colorMap: Record<string, string> = {
    TOP: "text-amber-400",
    JUNGLE: "text-emerald-400",
    MID: "text-sky-400",
    ADC: "text-red-400",
    SUPPORT: "text-teal-400",
  }
  return colorMap[role] || "text-muted-foreground"
}
