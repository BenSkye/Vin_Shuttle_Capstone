export const QUERY_KEYS = {
  TRIPS: {
    LIST: () => ['trips'] as const,
    DETAIL: (id: string) => ['trip', id] as const,
  },
  RATING: {
    BY_TRIP: (tripId: string) => ['rating', 'byTrip', tripId] as const,
  },
  SCENIC_ROUTE: {
    LIST: () => ['scenicRoute'] as const,
    DETAIL: (id: string) => ['scenicRoute', id] as const,
  }
}
