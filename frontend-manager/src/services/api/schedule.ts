import axiosInstance from "./axios"

export const DriverSchedule = async (scheduleData: {
    driver: string;
    vehicle: string;
    date: string;
    shift: string;
}) => {
    try {
        const response = await axiosInstance.post("/driver-schedules", [scheduleData]);
        console.log("Driver Schedule:", response.data);
        return response.data;
    } catch (error) {

        throw error; // Re-throw to handle in the component
    }
}


export const updateDriverSchedule = async (
    driverScheduleID: string,
    driver: string,
    date: string,
    shift: string,
    vehicle: string
) => {
    try {
        const response = await axiosInstance.put(`/driver-schedules/update-driver-schedule/${driverScheduleID}`, {
            driver,
            date,
            shift,
            vehicle
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else if (typeof error === "object" && error !== null && "response" in error) {
            const err = error as { response?: { data?: { vnMessage?: string, message?: string } } };
            const errorMessage = err.response?.data?.vnMessage || err.response?.data?.message || "Failed to update schedule";
            throw new Error(errorMessage);
        } else {
            throw new Error("Failed to update schedule");
        }
    }
}

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