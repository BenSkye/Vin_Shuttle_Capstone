import apiClient from './apiClient'

console.log('API_URL Map Scenics:', process.env.NEXT_PUBLIC_BACKEND_API)

export interface RouteRequest {
  name: string
  description: string
  waypoints: {
    id: number
    name: string
    position: {
      lat: number
      lng: number
    }
    description?: string
  }[]
  scenicRouteCoordinates: {
    lat: number
    lng: number
  }[]
  estimatedDuration: number
  totalDistance: number
  status?: 'draft' | 'active' | 'inactive'
}

export interface RouteResponse extends RouteRequest {
  _id: string
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export const routeService = {
  createRoute: async (data: RouteRequest) => {
    const response = await apiClient.post<RouteResponse>(`/scenic-routes`, data)
    return response.data
  },

  getAllRoutes: async () => {
    const response = await apiClient.get<RouteResponse[]>(`/scenic-routes`)
    return response.data
  },

  getRouteById: async (id: string) => {
    const response = await apiClient.get<RouteResponse>(`/scenic-routes/${id}`)
    return response.data
  },

  editRoute: async (id: string, data: RouteRequest) => {
    if (!id) {
      throw new Error('Route ID is required for editing')
    }

    console.log('Editing route with ID:', id)
    console.log('Edit data:', data)

    const response = await apiClient.put<RouteResponse>(`/scenic-routes/${id}`, data)
    return response.data
  },
}
