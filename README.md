# SoloQ Tracker

> Track your League of Legends ranked sessions, win rates, and performance — one day at a time.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22B5BF)](https://recharts.org)

> 📋 See what's coming next → [ROADMAP.md](./ROADMAP.md)

---

## Features

- **Session grouping** — matches are automatically grouped into daily play sessions
- **Performance Timeline** — bar chart showing win rate per session with game counts
- **Battle Log** — per-match breakdown with champion, KDA, role, CS, duration, and Victory/Defeat label
- **Load more sessions** — paginated match history, load older sessions on demand
- **Summoner search history** — recent searches saved locally for quick access
- **11 regions supported** — EUW, EUNE, NA, KR, JP, BR, LAN, LAS, OCE, TR, RU
- **Solo/Duo ranked only** — filters out flex, normals, and other queue types automatically
- **Riot API rate limit handling** — automatic retry with `Retry-After` respect on 429 responses

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16 | Framework (App Router + API routes) |
| [React](https://react.dev) | 19 | UI |
| [TypeScript](https://www.typescriptlang.org) | 5.7 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling |
| [Recharts](https://recharts.org) | 2.15 | Performance Timeline chart |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state & caching |
| [shadcn/ui](https://ui.shadcn.com) | — | UI component primitives |
| [Riot Match V5 API](https://developer.riotgames.com) | — | Match & summoner data |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) (recommended) — or npm / yarn
- A [Riot Games API key](https://developer.riotgames.com) (free developer key works)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/soloq-tracker.git
cd soloq-tracker
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your values (see [Environment Variables](#environment-variables) below).

**4. Start the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file at the root of the project with the following:

```env
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

| Variable | Description | Where to get it |
|---|---|---|
| `RIOT_API_KEY` | Riot Games API key used to fetch summoner and match data | [developer.riotgames.com](https://developer.riotgames.com) — sign in and generate a key |

> **Note:** Developer API keys expire every **24 hours**. Regenerate yours at [developer.riotgames.com](https://developer.riotgames.com) if you get a 403 error.

---

## API Rate Limits

This app is designed to work with a **Riot developer API key**, which has the following limits:

| Limit | Cap |
|---|---|
| Per second | 20 requests |
| Per 2 minutes | 100 requests |

The app fetches **30 matches per page** with rate-limit-aware batching and automatic retry on `429` responses. If you have a production API key with higher limits, you can increase `PAGE_SIZE` and `MAX_MATCHES` in `app/api/matches/route.ts`.

---

## Project Structure

```
soloq-tracker/
├── app/
│   ├── api/
│   │   ├── _lib/
│   │   │   └── riot.ts          # Riot API client (fetch helpers, retry logic)
│   │   ├── matches/
│   │   │   └── route.ts         # GET /api/matches — paginated match fetching
│   │   ├── summoner/
│   │   │   └── route.ts         # GET /api/summoner — profile + ranked data
│   │   └── ddragon-version/
│   │       └── route.ts         # GET /api/ddragon-version — latest DDragon version
│   ├── page.tsx                 # Main page (search, dashboard, load more)
│   └── layout.tsx               # Root layout + metadata
├── components/
│   ├── match-list.tsx           # Battle Log — per-match cards
│   ├── session-dashboard.tsx    # Active session stats (KDA, CS, playtime)
│   ├── session-history.tsx      # Sidebar session list
│   ├── winrate-chart.tsx        # Performance Timeline bar chart
│   ├── summoner-search.tsx      # Search input with region selector
│   └── ui/                      # shadcn/ui component primitives
├── hooks/
│   ├── use-matches.ts           # TanStack Query hook for match data
│   ├── use-summoner.ts          # TanStack Query hook for summoner profile
│   └── use-summoner-history.ts  # Local search history (localStorage)
├── types/
│   └── index.ts                 # Shared TypeScript types
└── utils/
    ├── sessionGrouper.ts        # Groups matches into daily sessions
    └── champions.ts             # Champion icon URLs + role helpers
```

---

## Supported Regions

| Region | Server |
|---|---|
| EUW | Europe West |
| EUNE | Europe Nordic & East |
| NA | North America |
| KR | Korea |
| JP | Japan |
| BR | Brazil |
| LAN | Latin America North |
| LAS | Latin America South |
| OCE | Oceania |
| TR | Turkey |
| RU | Russia |

---

## Disclaimer

SoloQ Tracker is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

Match and summoner data is fetched in real time from the [Riot Games API](https://developer.riotgames.com).
