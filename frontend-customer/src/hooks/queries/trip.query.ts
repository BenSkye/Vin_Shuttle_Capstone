import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'

import { TripApiService } from '@/service/api/trip.api'

export const useTripQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TRIPS.LIST(),
    queryFn: TripApiService.getPersonalTrips,
  })
}

export const useTripDetailQuery = (tripId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TRIPS.DETAIL(tripId),
    queryFn: () => TripApiService.getPersonalTripById(tripId),
  })
}


export const useCancelTripMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tripId: string; reason: string }) =>
      TripApiService.cancelTrip(data.tripId, data.reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.LIST(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.DETAIL(variables.tripId),
      })
    },
    onError: (error) => {
      console.log('Error canceling trip:', error)
      // const message = getErrorMessage(error)
      // return message
    },
  })
}


