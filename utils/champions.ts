import type { Role } from "@/types"

const ROLE_LABELS: Record<Role, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  ADC: "Bot",
  SUPPORT: "Support",
}

const ROLE_COLORS: Record<Role, string> = {
  TOP: "text-amber-400",
  JUNGLE: "text-emerald-400",
  MID: "text-sky-400",
  ADC: "text-red-400",
  SUPPORT: "text-teal-400",
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

export function getRoleColor(role: Role): string {
  return ROLE_COLORS[role] ?? "text-muted-foreground"
}
