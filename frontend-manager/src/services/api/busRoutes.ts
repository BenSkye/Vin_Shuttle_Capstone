import axiosInstance from "./axios";

export interface BusRoute {
    _id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
}

export const getBusRoutes = async () => {
    try {
        const response = await axiosInstance.get("/bus-routes");
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
} 