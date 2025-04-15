import axiosInstance from "./axios";
import { uploadDriverImage } from "@/utils/firebase";
import { DriverFilters } from "@/interfaces/index";



export const getAvailableDrivers = async (date: string) => {
    try {
        const response = await axiosInstance.get(`/driver-schedules/driver-not-scheduled/${date}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getPersonalDriver = async (phone: string) => {
    try {
        const response = await axiosInstance.get("/users");
        console.log(phone);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export const getDriver = async (sortOrder: string = 'desc', role: string = 'driver') => {
    try {
        const response = await axiosInstance.get("/users", {
            params: {
                sortOrder,
                role
            }
        });
        console.log("Driver:", response.data);
        return response.data;
        //yessir
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        } else if (typeof error === "object" && error !== null && "response" in error) {
            const err = error as { response?: { data?: { vnMessage?: string, message?: string } } };
            const errorMessage = err.response?.data?.vnMessage || err.response?.data?.message || "Failed to get drivers";
            throw new Error(errorMessage);
        } else {
            throw new Error("Failed to get drivers");
        }
    }
}

export const createDriver = async (name: string, phone: string, email: string, password: string, avatar: string | File = "", role: string = "driver") => {
    try {
        let avatarUrl = "";

        // Check if avatar is a File and upload it to Firebase
        if (avatar instanceof File) {
            avatarUrl = await uploadDriverImage(avatar);
        } else if (typeof avatar === 'string' && avatar) {
            // If it's already a string (URL or base64), use it as is
            avatarUrl = avatar;
        }

        const response = await axiosInstance.post("/auth/register", {
            name,
            phone,
            email,
            password,
            avatar: avatarUrl,
            role
        });

        if (!response.data) {
            throw new Error('Failed to create driver');
        }

        return response.data;
    } catch (error) {
        console.error('Error creating driver:', error);
        throw error;
    }
};

export const getPersonalDriverSchedule = async () => {
    const startDate = '2024-01-01';
    const endDate = '2030-01-01';

    try {
        const response = await axiosInstance.get(`/driver-schedules/get-personal-schedules-from-start-to-end/${startDate}/${endDate}`);
        return response.data;
    } catch (error) {
        console.log('lỗi fetch lịch driver', error)
    }
}



export const filterDriver = async (filters: DriverFilters = {}) => {
    try {
        const {
            sortOrder,
            orderBy,
            skip,
            limit,
            role,
            phone,
            email,
            name,
        } = filters;

        const response = await axiosInstance.get('/users', {
            params: {
                sortOrder,
                orderBy,
                ...(skip !== undefined && { skip }),
                ...(limit !== undefined && { limit }),
                role,
                ...(phone && { phone }),
                ...(email && { email }),
                ...(name && { name }),
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
};

export const getDriverById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching driver by ID:", error);
        throw error;
    }
}