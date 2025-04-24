import axiosInstance from "./axios";

export const getVehicles = async () => {
    try {
        const response = await axiosInstance.get("/vehicles");
        return response.data;
    } catch (error) {
        console.error("Error:", error)
    }
}

export const getAvailableVehicles = async (date: string) => {
    try {
        const response = await axiosInstance.get(`/driver-schedules/vehicle-not-scheduled/${date}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getVehicleById = async (vehicleId: string) => {
    try {
        const response = await axiosInstance.get(`/vehicles/${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching vehicle by ID:", error);
        throw error;
    }
};