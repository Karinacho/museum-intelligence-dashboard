/** Shared TanStack Query key for raw `/objects/{id}` payloads (gallery + artifact views). */
export const metObjectQueryKey = (id: number) => ['met-object', id] as const;
