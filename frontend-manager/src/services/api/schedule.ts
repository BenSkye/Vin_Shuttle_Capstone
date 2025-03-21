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


