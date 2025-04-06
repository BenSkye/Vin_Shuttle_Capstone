import { Rating } from '@/interface/rating.interface'
import apiClient from '@/service/apiClient'

export const RatingApiService = {
  getRateTrip: async (tripId: string): Promise<Rating> => {
    const response = await apiClient.get(`/rating/get-rating-by-trip-id/${tripId}`)
    return response.data
  },

  createRating: async (tripId: string, rate: number, feedback: string): Promise<Rating> => {
    const response = await apiClient.post(`/rating/create-rating`, {
      tripId,
      rate,
      feedback,
    })
    return response.data
  },
}
