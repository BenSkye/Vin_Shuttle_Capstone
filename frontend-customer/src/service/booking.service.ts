import axios from 'axios'

import {
  BookingDestinationRequest,
  BookingHourRequest,
  BookingRouteRequest,
  IBooking,
  BookingSharedRequest,
} from '@/interface/booking.interface'
import { BookingResponse } from '@/interface/booking.interface'
import apiClient from '@/service/apiClient'

export const bookingHour = async (payload: BookingHourRequest): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post('/booking/create-booking-hour', payload)
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const getCustomerPersonalBooking = async (): Promise<IBooking[]> => {
  try {
    const response = await apiClient.get('/booking/customer-personal-booking')
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const getCustomerPersonalBookingById = async (id: string): Promise<IBooking> => {
  try {
    const response = await apiClient.get(`/booking/customer-personal-booking/${id}`)
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const bookingDestination = async (
  payload: BookingDestinationRequest
): Promise<BookingResponse> => {
  try {
    console.log('payloaddđ', payload)
    const response = await apiClient.post('/booking/create-booking-destination', payload)
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const bookingRoute = async (payload: BookingRouteRequest): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post('/booking/create-booking-scenic-route', payload)
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}

export const bookingShared = async (payload: BookingSharedRequest): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post('/booking/create-booking-shared-route', payload)
    console.log('response', response.data)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const serverError = error.response.data
      console.error('severError', serverError.statusCode)
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw new Error('Lỗi kết nối máy chủ')
  }
}