import { useQuery } from '@tanstack/react-query'

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
