import axiosInstance from "./axios";

export interface Driver {
    _id: string;
    fullName: string;
    phone: string;
}

export interface Vehicle {
    _id: string;
    name: string;
    plateNumber: string;
}

export interface BusStop {
    stopId: string;
    orderIndex: number;
    distanceFromStart: number;
    estimatedTime: number;
}

export interface BusRoute {
    _id: string;
    name: string;
    description: string;
    stops: BusStop[];
}

export interface DailyTrip {
    startTime: string;
    endTime: string;
    driver: string;
    vehicle: string;
    status: string;
    estimatedDuration: number;
}

export interface DriverAssignment {
    driverId: string;
    vehicleId: string;
    startTime: string;
    endTime: string;
}

export interface BusSchedule {
    _id: string;
    busRoute: BusRoute;
    vehicles: Vehicle[];
    drivers: Driver[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate?: string;
    status: 'active' | 'inactive';
    dailyTrips?: DailyTrip[];
    driverAssignments: DriverAssignment[];
}

export interface CreateBusScheduleDto {
    busRoute: string;
    vehicles: string[];
    drivers: string[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate?: string;
    status?: 'active' | 'inactive';
    driverAssignments?: DriverAssignment[];
}

export const createBusSchedule = async (schedule: CreateBusScheduleDto) => {
    try {
        const response = await axiosInstance.post("/bus-schedules", schedule);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getActiveScheduleByRoute = async (routeId: string, date?: string) => {
    try {
        const url = date 
            ? `/bus-schedules/route/${routeId}?date=${date}`
            : `/bus-schedules/route/${routeId}`;
        const response = await axiosInstance.get<BusSchedule[]>(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBusSchedule = async (id: string, schedule: Partial<CreateBusScheduleDto>) => {
    try {
        const response = await axiosInstance.put(`/bus-schedules/${id}`, schedule);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBusSchedule = async (id: string) => {
    try {
        await axiosInstance.delete(`/bus-schedules/${id}`);
    } catch (error) {
        throw error;
    }
};

export const generateTrips = async (id: string, date: string) => {
    try {
        const response = await axiosInstance.post(`/bus-schedules/${id}/generate-trips/${date}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 