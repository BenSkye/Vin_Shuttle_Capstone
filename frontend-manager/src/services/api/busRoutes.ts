import axiosInstance from "./axios";

export interface BusRoute {
    _id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
}

export const getBusRoutes = async () => {
    try {
        const response = await axiosInstance.get<BusRoute[]>("/bus-routes");
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const getActiveBusRoutes = async () => {
    try {
        const routes = await getBusRoutes();
        return routes.filter((route: BusRoute) => route.status === 'active');
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
} 