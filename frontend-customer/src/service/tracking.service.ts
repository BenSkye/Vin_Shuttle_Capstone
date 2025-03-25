import apiClient from '@/service/apiClient'

export const getLastVehicleLocation = async (id: string) => {
  try {
    const response = await apiClient.get(`/tracking/last-location/${id}`)
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}
