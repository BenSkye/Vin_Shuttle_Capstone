import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'

import { RatingApiService } from '@/service/api/rating.api'

export const useRatingByTripQuery = (tripId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.RATING.BY_TRIP(tripId),
    queryFn: () => RatingApiService.getRateTrip(tripId),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateRatingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tripId: string; rate: number; feedback: string }) =>
      RatingApiService.createRating(data.tripId, data.rate, data.feedback),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RATING.BY_TRIP(variables.tripId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.LIST(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.DETAIL(variables.tripId),
      })
    },
  })
}
