# Museum Intelligence Dashboard

A small React app that browses The Met’s public Collection API: filter a gallery of artworks, open a detail view, and see related works. I use **TanStack Query** so fetching stays predictable and the UI can reuse cached data when you move between pages.

---

## How I fetch data

I needed to separate **“which object IDs match the filters?”** from **“what does each object look like?”** because the API works that way: search and department endpoints return ID lists, and every card or detail row needs its own `/objects/{id}` call.

**Departments** — On load I fetch `/departments` once for the filter dropdown.

**Gallery** — I resolve IDs for the current URL filters: either `/objects?departmentIds=…` when you’re only browsing a department, or `/search` with query params when there’s a keyword, date range, or highlights mode. Then I load **only the objects on the current page** (paginated), not the whole list.

**Artifact page** — The main record is the same `/objects/{id}` as in the gallery. For “related works” I run `/search` with a department + date window to get more IDs, then fetch each related object the same way as gallery cards.

**HTTP** — In development I send traffic through a Vite proxy (`/api/met`) to avoid CORS issues; in production builds I call the Met API directly. I also throttle and queue requests in a small client so I don’t hammer the API.

---

## How I cache with TanStack Query

I decided to let the cache do the heavy lifting: dedupe in-flight requests, remember responses, and avoid pointless refetches when you tab back to the app.

**Default behavior (global `QueryClient`)** — I set a **24-hour** `staleTime` and matching `gcTime`, turned off refetch on window focus and on mount, and kept **refetch on reconnect** so a dropped connection can recover. Queries that don’t override this (like the gallery ID list) inherit these defaults.

**Stable query keys** — I needed cache entries to line up with what the user actually asked for:

- Gallery ID lists use a key built from the **normalized filter state** (department, keyword, dates), so changing filters gets a fresh list without colliding with other searches.
- Every **single object** uses the same key shape, `['met-object', id]`, everywhere. I decided on that so when you open an artwork from the grid, the detail page can **reuse the data you already loaded** for the card instead of fetching again.
- Related-work ID searches get their own key (artifact + department + date bounds) so they don’t clash with the main gallery search.
- Departments sit under a fixed key — that list rarely changes.

**Per-object requests** — I treat Met object payloads as **effectively static** for the session: `staleTime` is infinite, with a shorter `gcTime` (~30 minutes) so unused entries eventually drop out. I added **smarter retries** (more attempts, longer backoff) when the API returns rate-limit style errors (403/429), and lighter retries for other failures.

**Related work ID search** — That list is more contextual, so I use a **5-minute** stale window and a **10-minute** `gcTime` instead of the all-day default.

**Prefetch** — When you’re on a gallery page, I prefetch the **next page’s** objects when the browser is idle so pagination feels quicker without blocking the main work.

---

## Run it locally

```bash
npm install
npm run dev
```

Build: `npm run build`. Tests: `npm test`.
