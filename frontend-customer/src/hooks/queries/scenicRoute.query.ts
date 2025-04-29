import { QUERY_KEYS } from "@/constants/queryKeys"
import { ScenicRouteQuery } from "@/interface/scenicRoute.interface"
import { ScenicRouteApiService } from "@/service/api/scenicRoute.api"
import { useQuery } from "@tanstack/react-query"

export const useScenicRouteQuery = (query?: ScenicRouteQuery) => {
    return useQuery({
        queryKey: QUERY_KEYS.SCENIC_ROUTE.LIST(),
        queryFn: () => ScenicRouteApiService.getScenicRoute(query),
    })
}

export const useScenicRouteDetailQuery = (id: string) => {
    console.log('id', id)
    return useQuery({
        queryKey: QUERY_KEYS.SCENIC_ROUTE.DETAIL(id),
        queryFn: () => ScenicRouteApiService.getScenicRouteById(id),
        enabled: !!id
    })
}