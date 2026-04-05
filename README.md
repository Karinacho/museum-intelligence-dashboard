# Museum Intelligence Dashboard

**Live preview:** [https://sensational-manatee-3724b5.netlify.app/](https://sensational-manatee-3724b5.netlify.app/)

I used the **Bulletproof React** project structure. For routing I used **React Router** with **lazy-loaded** components. For data fetching and caching I used **TanStack Query**.

On initial load, all **departments** are fetched. When the user selects a department, a query fires to retrieve the **full object ID list** for that department. I explored fetching IDs in small batches, but this is a **hard API limitation** — the Met API returns the entire ID list in a single response with no way to paginate it.

Once the ID list is available, I fetch the **object details** for the current page and display them. Results are **cached**, so navigating back to a department or returning to a previously visited page is instant. While the user browses the current page, the **next page’s** object details are prefetched in the background so the transition feels seamless.

## Known issues

The **initial department load** is slower than ideal because the app must wait for the full ID list before any object fetches can begin — this is an unavoidable consequence of the API design.

Additionally, I occasionally receive **403** errors when flipping through pages quickly. My suspicion is that the API detects the burst of parallel requests and temporarily blocks the client. I attempted to mitigate this by **throttling** requests, but it did not fully resolve the issue.

## Additional future steps to improve initial load performance

**Background prefetching:** After the first meaningful render, silently prefetch results for each department in the background and persist them to **IndexedDB**. On subsequent visits, the app hydrates from IndexedDB instantly before any network requests go out — eliminating cold start latency entirely.

**Bootstrap from the Met’s CSV dataset:** The Met publishes a full CSV snapshot of their collection on GitHub (~470k objects). This could be used to pre-populate object IDs and basic metadata at **build time**, so the app never needs to discover IDs at runtime — only fetch the details and images on demand.
