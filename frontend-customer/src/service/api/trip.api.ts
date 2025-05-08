import { Trip } from '@/interface/trip.interface'
import apiClient from '@/service/apiClient'

export const TripApiService = {
  getPersonalTrips: async (): Promise<Trip[]> => {
    const response = await apiClient.get('/trip/customer-personal-trip', {
      params: {
        orderBy: 'updatedAt',
        sortOrder: 'desc',
      },
    })
    console.log(response.data)
    return response.data
  },

  getPersonalTripById: async (id: string): Promise<Trip> => {
    const response = await apiClient.get(`/trip/customer-personal-trip/${id}`)
    return response.data
  },

  cancelTrip: async (id: string, reason: string): Promise<Trip> => {
    const response = await apiClient.post(`/trip/cancel-trip/`, {
      tripId: id,
      reason,
    })
    return response.data
  },
}
