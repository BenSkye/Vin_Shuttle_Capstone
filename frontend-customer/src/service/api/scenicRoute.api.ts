import { ScenicRouteQuery } from "@/interface/scenicRoute.interface"
import apiClient from "@/service/apiClient"



export const ScenicRouteApiService = {
    getScenicRoute: async (query?: ScenicRouteQuery) => {
        const response = await apiClient.get('/scenic-routes',
            { params: query }
        )
        return response.data
    },

    getScenicRouteById: async (id: string) => {
        const response = await apiClient.get(`/scenic-routes/${id}`)
        return response.data
    }
}