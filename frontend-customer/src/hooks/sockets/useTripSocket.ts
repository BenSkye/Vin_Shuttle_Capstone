import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'

import { tripSocketService } from '@/service/socket/trip.socket'

const useTripSocket = (id?: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Kết nối socket
    tripSocketService.connect()

    // Thiết lập socket listeners
    const cleanupFunctions: (() => void)[] = []

    if (id) {
      const unsubscribe = tripSocketService.onTripDetailUpdate(id, (updatedTrip) => {
        queryClient.setQueryData(QUERY_KEYS.TRIPS.DETAIL(id), updatedTrip)
      })
      cleanupFunctions.push(unsubscribe)
    } else {
      const unsubscribe = tripSocketService.onTripUpdate((updatedTrips) => {
        queryClient.setQueryData(QUERY_KEYS.TRIPS.LIST(), updatedTrips)
      })
      cleanupFunctions.push(unsubscribe)
    }

    return () => {
      cleanupFunctions.forEach((fn) => fn())
      tripSocketService.disconnect()
    }
  }, [id, queryClient])

  const refetch = () => {
    if (id) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.DETAIL(id),
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRIPS.LIST(),
      })
    }
  }
  return { refetch }
}

export default useTripSocket
