'use client';

import { useState, useEffect } from "react";
import Announcements from "@/components/Announcements";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import Performance from "@/components/Performance";
import Image from "next/image";

import { useParams } from "next/navigation";
import { getPersonalDriver } from "@/services/api/driver";
import { getDriverScheduleByQuery } from "@/services/api/schedule";
import { Driver } from "@/interfaces/index";
import { DriverSchedulesStatus, Shift } from "@/interfaces/driver-schedules.enum";
import { Activity } from "@/interfaces/index";

interface DriverSchedule {
    _id: string;
    driver: string | { _id: string; name: string };
    vehicle?: { _id: string; name: string };
    date: string;
    shift: Shift;
    status: DriverSchedulesStatus;
    isLate?: boolean;
    isEarlyCheckout?: boolean;
}

interface ScheduleResponse {
    driverSchedules: DriverSchedule[];
    totalWorkingHours: number;
    actualWorkingHours: number;
}

const DriverSinglePage = () => {
    const { id } = useParams();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [schedules, setSchedules] = useState<DriverSchedule[]>([]);
    const [workingHours, setWorkingHours] = useState({ total: 0, actual: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                setLoading(true);
                if (id) {
                    // Fetch driver details using phone number
                    const allDrivers = await getPersonalDriver(id as string);

                    // Find the driver with the matching phone or ID
                    const driverData = allDrivers.find((d: Driver) =>
                        d.phone === id || d._id === id
                    );

                    if (!driverData) {
                        throw new Error("Driver not found");
                    }

                    setDriver(driverData);

                    // Fetch driver schedules with fixed date range
                    const startDate = "2025-01-01"; // January 1, 2025
                    const endDate = "2030-01-01";   // January 1, 2030

                    const response = await getDriverScheduleByQuery({
                        driver: driverData._id,
                        startDate,
                        endDate
                    });

                    console.log('schedulesData', response);

                    // Handle the correct response structure
                    if (response && typeof response === 'object') {
                        const scheduleResponse = response as ScheduleResponse;

                        // Set schedules from the driverSchedules array
                        if (Array.isArray(scheduleResponse.driverSchedules)) {
                            setSchedules(scheduleResponse.driverSchedules);
                        } else {
                            setSchedules([]);
                        }

                        // Set working hours info
                        setWorkingHours({
                            total: scheduleResponse.totalWorkingHours || 0,
                            actual: scheduleResponse.actualWorkingHours || 0
                        });
                    } else {
                        setSchedules([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching driver data:", err);
                setError("Failed to load driver information");
            } finally {
                setLoading(false);
            }
        };

        fetchDriverData();
    }, [id]);

    // Transform schedules data for calendar as activities
    const calendarActivities: Activity[] = Array.isArray(schedules)
        ? schedules.map((schedule: DriverSchedule, index) => {
            // Create a date object for the schedule
            const scheduleDate = new Date(schedule.date);
            const shift = schedule.shift;

            // Set the day of week (0-6, where 0 is Monday in the calendar component)
            const day = scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1;

            // Create activity for calendar
            return {
                id: schedule._id || `schedule-${index}`,
                name: schedule.vehicle?.name || 'No Vehicle',
                vehicleName: schedule.vehicle?.name || 'No Vehicle',
                driverName: driver?.name || '',
                vehicleId: schedule.vehicle?._id || '',
                driverId: typeof schedule.driver === 'object' ? schedule.driver._id : schedule.driver || driver?._id || '',
                title: `${schedule.vehicle?.name || 'No Vehicle'} (${schedule.shift})`,
                description: `Status: ${schedule.status}`,
                startTime: shift,
                endTime: shift,
                day,
                color: getStatusColor(schedule.status),
                date: schedule.date,
                originalDate: scheduleDate
            };
        })
        : [];

    // Helper function to determine color based on status
    function getStatusColor(status: string): string {
        switch (status) {
            case DriverSchedulesStatus.COMPLETED:
                return 'bg-green-100';
            case DriverSchedulesStatus.IN_PROGRESS:
                return 'bg-blue-100';
            case DriverSchedulesStatus.NOT_STARTED:
                return 'bg-yellow-100';
            case DriverSchedulesStatus.DROPPED_OFF:
                return 'bg-purple-100';
            default:
                return 'bg-gray-100';
        }
    }

    // Format date function
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid date';
        }
    };

    if (loading) return <div className="flex-1 p-4 flex items-center justify-center">Loading...</div>;

    if (error) return <div className="flex-1 p-4 flex items-center justify-center text-red-500">{error}</div>;

    if (!driver) return <div className="flex-1 p-4 flex items-center justify-center">Driver not found</div>;

    // Calculate performance metrics
    const completedSchedules = schedules.filter(s => s.status === DriverSchedulesStatus.COMPLETED);
    const attendanceRate = schedules.length > 0 ? Math.round((completedSchedules.length / schedules.length) * 100) : 0;
    const lateCount = schedules.filter(s => s.isLate).length;

    return (
        <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* USER INFO CARD */}
                    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
                        <div className="w-1/3">
                            <Image
                                src={driver.avatar || ""}
                                alt={driver.name}
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>
                        <div className="w-2/3 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold">{driver.name}</h1>
                            </div>
                            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/icons/date.png" alt="" width={14} height={14} />
                                    <span>{driver.createdAt ? formatDate(driver.createdAt) : 'N/A'}</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/icons/mail.png" alt="" width={14} height={14} />
                                    <span>{driver.email || 'N/A'}</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image src="/icons/phone.png" alt="" width={14} height={14} />
                                    <span>{driver.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* SMALL CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleAttendance.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{attendanceRate}%</h1>
                                <span className="text-sm text-gray-400">Attendance</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleBranch.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{schedules.length}</h1>
                                <span className="text-sm text-gray-400">Schedules</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleLesson.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{workingHours.total}</h1>
                                <span className="text-sm text-gray-400">Total Hours</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleClass.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{workingHours.actual}</h1>
                                <span className="text-sm text-gray-400">Actual Hours</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleWarning.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{lateCount}</h1>
                                <span className="text-sm text-gray-400">Late Arrivals</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* BOTTOM */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <ScheduleCalendar activities={calendarActivities} />
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Recent Schedules</h1>
                    <div className="mt-4 flex flex-col gap-3">
                        {schedules.slice(0, 5).map((schedule, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${schedule.status === DriverSchedulesStatus.COMPLETED ? 'bg-green-500' :
                                        schedule.status === DriverSchedulesStatus.IN_PROGRESS ? 'bg-blue-500' :
                                            schedule.status === DriverSchedulesStatus.NOT_STARTED ? 'bg-gray-500' : 'bg-red-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm font-medium">{schedule.vehicle?.name || 'No Vehicle'}</p>
                                        <p className="text-xs text-gray-500">{new Date(schedule.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{schedule.shift}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <Performance />
                <Announcements />
            </div>
        </div>
    );
};

export default DriverSinglePage;