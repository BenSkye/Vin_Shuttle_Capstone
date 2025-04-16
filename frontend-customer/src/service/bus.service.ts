import axios from 'axios'
import apiClient from './apiClient'

export interface BusStop {
  stopId: {
    _id: string
    name: string
    description: string
    position: {
      lat: number
      lng: number
    }
    status: string
    address: string
  }
  orderIndex: number
  distanceFromStart: number
  estimatedTime: number
}

export interface BusRoute {
  _id: string
  name: string
  description: string
  stops: BusStop[]
  routeCoordinates: Array<{ lat: number; lng: number }>
  totalDistance: number
  estimatedDuration: number
  vehicleCategory: {
    _id: string
    name: string
    description: string
    numberOfSeat: number
  }
  status: string
  pricingConfig: string
}

export interface BusSchedule {
  _id: string
  busRoute: {
    _id: string
    name: string
    description: string
  }
  vehicles: Array<{
    _id: string
    name: string
    plateNumber: string
  }>
  drivers: Array<{
    _id: string
    fullName: string
    phone: string
  }>
  dailyTrips: Array<{
    startTime: string
    endTime: string
    driver: string
    vehicle: string
    status: string
  }>
}

export interface Vehicle {
  _id: string
  name: string
  plateNumber: string
  type: string
  operationStatus: string
}

export interface Driver {
  _id: string
  fullName: string
  phone: string
  email: string
}

export const getAllBusRoutes = async (): Promise<BusRoute[]> => {
  try {
    const response = await apiClient.get('/bus-routes')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Error Response:', error.response.data)
      const serverError = error.response.data
      throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định')
    }
    throw error
  }
}

export const getBusScheduleByRoute = async (routeId: string, date?: string): Promise<BusSchedule[]> => {
  try {
    const url = date 
      ? `/bus-schedules/route/${routeId}?date=${date}`
      : `/bus-schedules/route/${routeId}`
    
    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Error Response:', error.response.data)
      const serverError = error.response.data
      return {
        error: serverError.vnMessage || serverError.message || 'Không tìm thấy lịch trình cho tuyến này'
      } as unknown as BusSchedule[]
    }
    return {
      error: 'Lỗi không xác định khi tải lịch trình'
    } as unknown as BusSchedule[]
  }
}
