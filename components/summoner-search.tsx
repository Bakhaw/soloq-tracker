"use client"

import { useState } from "react"
import { Search, Swords, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Region } from "@/types"
import { VALID_REGIONS } from "@/utils/ranked"

const REGIONS = VALID_REGIONS.map((r) => ({ value: r, label: r }))

interface SummonerSearchProps {
  onSearch: (gameName: string, tag: string, region: Region) => void
  isLoading: boolean
}

export function SummonerSearch({ onSearch, isLoading }: SummonerSearchProps) {
  const [gameName, setGameName] = useState("")
  const [tag, setTag] = useState("")
  const [region, setRegion] = useState<Region>("EUW")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedGameName = gameName.trim()
    const trimmedTag = tag.trim()
    
    if (!trimmedGameName || !trimmedTag) {
      return
    }

    onSearch(trimmedGameName, trimmedTag, region)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
      {/* Logo / Title */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-lg lol-border-glow flex items-center justify-center bg-card">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-primary text-balance text-center">
            SoloQ Tracker
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
            Track your daily ranked grind. See win streaks, tilt detectors, and your session performance at a glance.
          </p>
        </div>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 w-full max-w-md"
      >
        <div className="w-full lol-border rounded-lg p-4 flex flex-col gap-3">
          <div className="flex w-full gap-2">
            <Select
              value={region}
              onValueChange={(val) => setRegion(val as Region)}
            >
              <SelectTrigger className="w-24 bg-input border-border text-foreground font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="GameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="flex-1 bg-input border-border placeholder:text-muted-foreground"
            />
            <div className="flex items-center px-2 text-muted-foreground font-mono">
              #
            </div>
            <Input
              placeholder="TAG"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-24 bg-input border-border placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={!gameName.trim() || !tag.trim() || isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide uppercase text-sm h-11"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Scouting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Scout Summoner
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
