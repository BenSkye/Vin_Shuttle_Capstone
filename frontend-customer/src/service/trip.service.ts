import apiClient from '@/service/apiClient'

export const getPersonalTrip = async () => {
  try {
    const response = await apiClient.get('/trip/customer-personal-trip')
    console.log('Trips:', response.data)
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const getPersonalTripById = async (id: string) => {
  try {
    const response = await apiClient.get(`/trip/customer-personal-trip/${id}`)
    console.log('Trip:', response.data)
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const getRateTrip = async (tripId: string) => {
  try {
    const response = await apiClient.get(`/rating/get-rating-by-trip-id/${tripId}`)
    return response.data
  } catch (error) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const createRating = async (tripId: string, rate: number, feedback: string) => {
  try {
    const response = await apiClient.post(`/rating/create-rating`, {
      tripId,
      rate,
      feedback,
    })
    return response.data
  } catch (e) {
    console.log(e)
  }
}

export const cancelTrip = async (tripId: string, reason: string) => {
  try {
    const response = await apiClient.post(`/trip/cancel-trip/`, {
      tripId,
      reason,
    })
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}
