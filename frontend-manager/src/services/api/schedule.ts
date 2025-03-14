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
        console.error("Error:", error.response.data.vnMessage);
        throw error; // Re-throw to handle in the component
    }
}

export const getDriverSchedule = async () => {
    const startday = "2021-10-01";
    const endday = "2030-10-07";
    try {
        const response = await axiosInstance.get(`/driver-schedules/get-schedule-from-start-to-end/${startday}/${endday}`);
        console.log("Driver Schedule:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const updateDriverSchedule = async (driverScheduleID: string, driver: string, date: string, shift: string, vehicle: string) => {
    try {
        const response = await axiosInstance.put(`/driver-schedules/update-driver-schedule/${driverScheduleID}`, {
            driver,
            date,
            shift,
            vehicle
        });
        return response.data;
    }
    catch (e) {
        console.log(e);
    }

}