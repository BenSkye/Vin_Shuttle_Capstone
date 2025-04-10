import axiosInstance from "./axios";

export interface DriverAssignment {
    driverId: string;
    vehicleId: string;
    startTime: string;
    endTime: string;
}

export interface BusSchedule {
    _id?: string;
    busRoute: string;
    vehicles: string[];
    drivers: string[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate: string;
    status: 'active' | 'inactive';
    driverAssignments: DriverAssignment[];
}

export const createBusSchedule = async (schedule: Omit<BusSchedule, '_id'>) => {
    try {
        const response = await axiosInstance.post("/bus-schedules", schedule);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
};

export const getActiveScheduleByRoute = async (routeId: string) => {
    try {
        const response = await axiosInstance.get(`/bus-schedules/route/${routeId}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
};

export const updateBusSchedule = async (id: string, schedule: Partial<BusSchedule>) => {
    try {
        const response = await axiosInstance.put(`/bus-schedules/${id}`, schedule);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
};

export const deleteBusSchedule = async (id: string) => {
    try {
        await axiosInstance.delete(`/bus-schedules/${id}`);
    } catch (error) {
        console.error("Error:", error);
    }
};

export const generateTrips = async (id: string, date: string) => {
    try {
        const response = await axiosInstance.post(`/bus-schedules/${id}/generate-trips/${date}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
}; 