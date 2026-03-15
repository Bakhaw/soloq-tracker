"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useDdragonVersion } from "@/hooks/use-ddragon-version"
import type { SummonerProfile } from "@/types"

const RANK_EMBLEM_BASE = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests"

function getRankEmblemUrl(tier?: string): string {
  if (!tier) return `${RANK_EMBLEM_BASE}/unranked.svg`
  return `${RANK_EMBLEM_BASE}/${tier.toLowerCase()}.svg`
}

interface ProfileCardProps {
  profile: SummonerProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { data: ddragonVersion } = useDdragonVersion()
  const isRanked = profile.rank !== "Unranked"

  const profileIconUrl = ddragonVersion
    ? `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${profile.profileIconId}.png`
    : null

  return (
    <div className="lol-border rounded-lg p-4 animate-slide-up">
      <div className="flex items-center gap-4">
        {/* Profile icon */}
        <div className="relative h-16 w-16 rounded-lg lol-border-glow shrink-0 overflow-hidden bg-card flex items-center justify-center">
          {profileIconUrl ? (
            <img
              src={profileIconUrl}
              alt="Profile Icon"
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <span className="text-xl font-bold text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-muted-foreground bg-card px-1.5 rounded border border-border">
            {profile.level}
          </span>
        </div>

        {/* Name + region */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground truncate">{profile.name}</h2>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary h-5">
              {profile.region}
            </Badge>
          </div>
        </div>

        {/* Rank info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-sm font-semibold text-foreground">
              {isRanked ? `${profile.rank} - ${profile.lp} LP` : "Unranked"}
            </p>
            {profile.rankedWins != null && profile.rankedLosses != null && (
              <p className="text-[11px] text-muted-foreground font-mono">
                {profile.rankedWins}W {profile.rankedLosses}L ({Math.round((profile.rankedWins / (profile.rankedWins + profile.rankedLosses)) * 100)}%)
              </p>
            )}
          </div>
          <RankEmblem tier={profile.tier} lp={profile.lp} rank={profile.rank} />
        </div>
      </div>
    </div>
  )
}

function RankEmblem({ tier, lp, rank }: { tier?: string; lp: number; rank: string }) {
  const [imgError, setImgError] = useState(false)
  const emblemUrl = getRankEmblemUrl(tier)
  const isRanked = rank !== "Unranked"

  return (
    <div className="relative h-14 w-14 rounded-lg lol-border-glow flex items-center justify-center shrink-0 bg-card">
      {!imgError ? (
        <img
          src={emblemUrl}
          alt={rank}
          className="h-10 w-10 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-xl font-bold text-primary">{rank.charAt(0)}</span>
      )}
      {isRanked && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-primary bg-card px-1.5 rounded border border-primary/30">
          {lp}LP
        </span>
      )}
    </div>
  )
}
