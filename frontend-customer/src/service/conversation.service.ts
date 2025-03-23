import apiClient from '@/service/apiClient'

export const getPersonalConversations = async () => {
  try {
    const response = await apiClient.get('/conversation/personal-conversation')
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const getConversationById = async (id: string) => {
  try {
    const response = await apiClient.get(`/conversation/${id}`)
    return response.data
  } catch (error: unknown) {
    if (error.response) {
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}
