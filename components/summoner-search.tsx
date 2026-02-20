"use client"

import { useState } from "react"
import { Search } from "lucide-react"
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

const REGIONS: { value: Region; label: string }[] = [
  { value: "EUW", label: "EUW" },
  { value: "EUNE", label: "EUNE" },
  { value: "NA", label: "NA" },
  { value: "KR", label: "KR" },
  { value: "JP", label: "JP" },
  { value: "BR", label: "BR" },
  { value: "LAN", label: "LAN" },
  { value: "LAS", label: "LAS" },
  { value: "OCE", label: "OCE" },
  { value: "TR", label: "TR" },
  { value: "RU", label: "RU" },
]

interface SummonerSearchProps {
  onSearch: (name: string, region: Region) => void
  isLoading: boolean
}

export function SummonerSearch({ onSearch, isLoading }: SummonerSearchProps) {
  const [name, setName] = useState("")
  const [region, setRegion] = useState<Region>("EUW")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) {
      onSearch(name.trim(), region)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Session Tracker
          </h1>
        </div>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Track your daily ranked sessions, win rates, and performance over time.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 w-full max-w-md"
      >
        <div className="flex w-full gap-2">
          <Select
            value={region}
            onValueChange={(val) => setRegion(val as Region)}
          >
            <SelectTrigger className="w-24 bg-card border-border">
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
            placeholder="Enter your Summoner Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-card border-border placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="submit"
          disabled={!name.trim() || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Looking up summoner...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
