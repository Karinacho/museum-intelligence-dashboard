# Museum Intelligence Dashboard

**Live preview:** [https://sensational-manatee-3724b5.netlify.app/](https://sensational-manatee-3724b5.netlify.app/)

I used the **Bulletproof React** project structure. For routing I used **React Router** with **lazy-loaded** components. For data fetching and caching I used **TanStack Query**.

On initial load, all **departments** are fetched. When the user selects a department, a query fires to retrieve the **full object ID list** for that department. I explored fetching IDs in small batches, but this is a **hard API limitation** — the Met API returns the entire ID list in a single response with no way to paginate it.

Once the ID list is available, I fetch the **object details** for the current page and display them. Results are **cached**, so navigating back to a department or returning to a previously visited page is instant. While the user browses the current page, the **next page’s** object details are prefetched in the background so the transition feels seamless.

## Known issues

The **initial department load** is slower than ideal because the app must wait for the full ID list before any object fetches can begin — this is an unavoidable consequence of the API design.

Additionally, I occasionally receive **403** errors when flipping through pages quickly. My suspicion is that the API detects the burst of parallel requests and temporarily blocks the client. I attempted to mitigate this by **throttling** requests, but it did not fully resolve the issue.
