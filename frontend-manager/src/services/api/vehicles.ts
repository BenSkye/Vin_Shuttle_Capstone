import axiosInstance from "./axios";

export const getVehicles = async () => {
    try {
        const response = await axiosInstance.get("/vehicles");

        return response.data;
    } catch (error) {
        console.error("Error:", error)
    }
}