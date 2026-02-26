# Roadmap

This file tracks what's coming next for SoloQ Tracker. Check items off as they get shipped.

---

## 🎨 UI / Design

- [ ] Dark / light theme toggle in the top bar
- [ ] Fully responsive mobile layout (match cards, sidebar stacking, chart scaling)
- [ ] Champion icon fallback (placeholder when DDragon image fails to load)
- [ ] Skeleton loading refinements — per-section skeletons instead of a full-page placeholder
- [ ] Smooth page transitions between search and dashboard
- [ ] Empty session state illustration (no games played that day)
- [ ] Win/loss color theming consistency audit across all components

---

## 🧭 UX

- [ ] Loading progress indicator during long match fetches (progress bar or step counter "Loading 15 / 30...")
- [ ] Error toast notifications (rate limit hit, API key expired, summoner not found)
- [ ] Shareable summoner URL that loads the dashboard directly (already partially implemented via query params — needs social preview / OG tags)
- [ ] Keyboard navigation — press `Escape` to go back, arrow keys to switch sessions
- [ ] Click a session in the sidebar to auto-scroll the main content to the top
- [ ] Confirm "Load more sessions" shows a count of newly added sessions after loading

---

## ✨ Features

- [ ] **Champion breakdown** — which champions were played most, individual win rates per champion
- [ ] **Role filter** — filter the battle log by role (TOP / JGL / MID / ADC / SUP)
- [ ] **Streak detection** — highlight active win/loss streaks in the session header
- [ ] **LP tracking** — store and display LP over time per session (requires persisting data)
- [ ] **Multi-summoner comparison** — compare win rates and KDA between two summoners side by side
- [ ] **Date range filter** — filter sessions by custom date range
- [ ] **Season stats** — aggregate stats across all loaded sessions (total games, overall win rate, most played champion)
- [ ] **CS/min stat** — show CS per minute instead of raw CS on match cards

---

## ⚡ Performance / Code

- [ ] **Server-side caching** — cache match responses in Redis or Vercel KV to avoid re-fetching the same games
- [x] **`.env.example` file** — add a committed example env file so setup is one less step
- [ ] **Replace `handleLoadMore` direct fetch with React Query** — use `useInfiniteQuery` for cleaner pagination state management
- [ ] **Memoize `MatchRow`** — wrap with `React.memo` to avoid re-renders when only the active session changes
- [ ] **Deduplicate matches on load more** — guard against the same match appearing in two pages (edge case around page boundaries)
- [ ] **Type the Riot API responses** — replace `any` in `getMatchDetail` and `extractMatchData` with proper types
- [ ] **Centralise constants** — move `PAGE_SIZE`, `BATCH_SIZE`, `BATCH_DELAY_MS` to a shared config file

---

## 🧪 Testing

- [ ] **Unit tests for `sessionGrouper`** — test grouping logic, edge cases (midnight boundary, single game sessions)
- [ ] **Unit tests for KDA helpers** — `getKDALabel`, `formatDuration`, `formatTimeAgo`
- [ ] **Unit tests for `extractMatchData`** — test queue filtering, participant lookup, CS calculation
- [ ] **Integration tests for API routes** — mock Riot API responses and assert correct route behaviour
- [ ] **E2E tests with Playwright** — search flow, session switching, load more button
- [ ] Set up **Vitest** as the test runner (compatible with Next.js App Router)
- [ ] Add a `test` script to `package.json`

---

## 📱 PWA

- [ ] Add `manifest.json` (name, icons, theme color, display mode)
- [ ] Register a service worker for offline fallback
- [ ] Offline page — friendly message when the user is offline instead of a blank error
- [ ] "Add to Home Screen" prompt on mobile
- [ ] Cache DDragon champion icons via service worker for faster repeated loads

---

## 🏗️ Infrastructure

- [ ] **GitHub Actions CI** — run `tsc --noEmit` + `eslint` on every pull request
- [ ] **Vercel deploy button** in README for one-click deployment
- [ ] **Dependabot** — auto-open PRs for outdated dependencies
- [ ] **Branch protection** — require CI to pass before merging to `main`
- [ ] Production Riot API key setup guide in README (personal vs. production key tiers)
