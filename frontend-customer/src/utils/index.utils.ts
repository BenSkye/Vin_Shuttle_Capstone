import { ApiError } from '@/interface/auth.interface'

export const isEqual = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) => {
  return pos1.lat === pos2.lat && pos1.lng === pos2.lng
}

export const getErrorMessage = (error: unknown): string => {
  const err = error as ApiError

  return err.response?.data?.vnMessage || err.vnMessage || 'Có lỗi xảy ra. Vui lòng thử lại.'
}
