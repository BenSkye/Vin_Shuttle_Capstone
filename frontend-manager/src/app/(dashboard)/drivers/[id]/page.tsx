'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import Announcements from "@/components/Announcements";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { MonthlyScheduleCalendar } from "@/components/MonthlyScheduleCalendar";
// import Performance from "@/components/Performance";
import Image from "next/image";
import { Tabs } from "antd";
import { isSameWeek, isSameMonth, startOfWeek } from "date-fns";

import { useParams } from "next/navigation";
import { getPersonalDriver } from "@/services/api/driver";
import { getDriverScheduleByQuery } from "@/services/api/schedule";
import { Driver } from "@/interfaces/index";
import { DriverSchedulesStatus, Shift } from "@/interfaces/driver-schedules.enum";
import { Activity } from "@/interfaces/index";

interface BreakTime {
    startTime: string;
    endTime: string;
    reason: string;
}

interface DriverSchedule {
    _id: string;
    driver: string | { _id: string; name: string };
    vehicle?: { _id: string; name: string };
    date: string;
    shift: Shift;
    status: DriverSchedulesStatus;
    isLate?: boolean;
    isEarlyCheckout?: boolean;
    totalWorkingHours: number;
    actualWorkingHours: number;
    checkinTime?: string;
    checkoutTime?: string;
    breakTimes: BreakTime[];
    taskType: string;
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
    const [selectedPeriodHours, setSelectedPeriodHours] = useState({ total: 0, actual: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("weekly");
    const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const weeklyCalendarRef = useRef<{ getCurrentWeek: () => Date }>(null);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                setLoading(true);

                // Validate ID exists
                if (!id) {
                    throw new Error("ID không hợp lệ");
                }

                // Fetch driver details
                const allDrivers = await getPersonalDriver(id as string);

                // Validate API response
                if (!Array.isArray(allDrivers)) {
                    throw new Error("Dữ liệu không hợp lệ");
                }

                // Find the driver with the matching phone or ID
                const driverData = allDrivers.find((d: Driver) =>
                    d.phone === id || d._id === id
                );

                if (!driverData) {
                    throw new Error("Không tìm thấy tài xế");
                }

                setDriver(driverData);

                // Calculate dynamic date range instead of hardcoded future dates
                const today = new Date();
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(today.getMonth() - 3);

                const sixMonthsFromNow = new Date(today);
                sixMonthsFromNow.setMonth(today.getMonth() + 6);

                const startDate = threeMonthsAgo.toISOString().split('T')[0];
                const endDate = sixMonthsFromNow.toISOString().split('T')[0];

                const response = await getDriverScheduleByQuery({
                    driver: driverData._id,
                    startDate,
                    endDate
                });

                // Validate response structure safely
                if (response && typeof response === 'object') {
                    const scheduleResponse = response as ScheduleResponse;

                    setSchedules(Array.isArray(scheduleResponse.driverSchedules)
                        ? scheduleResponse.driverSchedules
                        : []);

                    setWorkingHours({
                        total: scheduleResponse.totalWorkingHours || 0,
                        actual: scheduleResponse.actualWorkingHours || 0
                    });
                } else {
                    setSchedules([]);
                    setWorkingHours({ total: 0, actual: 0 });
                }
            } catch (err) {
                console.error("Error fetching driver data:", err);
                setError(err instanceof Error ? err.message : "Không thể tải thông tin tài xế");
            } finally {
                setLoading(false);
            }
        };

        fetchDriverData();
    }, [id]);

    // Helper function to determine color based on status
    const getStatusColor = (status: string): string => {
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
    };

    // Helper function to translate status
    const getStatusTranslation = (status: string): string => {
        switch (status) {
            case DriverSchedulesStatus.COMPLETED:
                return 'Đã hoàn thành';
            case DriverSchedulesStatus.IN_PROGRESS:
                return 'Đang thực hiện';
            case DriverSchedulesStatus.NOT_STARTED:
                return 'Chưa bắt đầu';
            case DriverSchedulesStatus.DROPPED_OFF:
                return 'Đã trả khách';
            default:
                return status;
        }
    };

    // Format date function with simplified error handling
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Format time function with simplified error handling
    const formatTime = (dateString?: string): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';

        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate total break time for a schedule in minutes
    const calculateTotalBreakTime = (breakTimes: BreakTime[]): number => {
        if (!breakTimes || !Array.isArray(breakTimes) || breakTimes.length === 0) {
            return 0;
        }

        return breakTimes.reduce((total, breakTime) => {
            if (!breakTime.startTime || !breakTime.endTime) return total;

            const start = new Date(breakTime.startTime);
            const end = new Date(breakTime.endTime);

            // Validate dates before calculation
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;

            // Ensure end time is after start time
            if (end <= start) return total;

            const diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
            return total + diff;
        }, 0);
    };

    // Calculate hours for selected week
    const calculateWeeklyHours = useCallback((week: Date) => {
        const weeklySchedules = schedules.filter(schedule => {
            try {
                const scheduleDate = new Date(schedule.date);
                return isSameWeek(scheduleDate, week, { weekStartsOn: 1 });
            } catch (error) {
                console.error("Error parsing date:", error, schedule.date);
                return false;
            }
        });

        const totalWeeklyHours = weeklySchedules.reduce((sum, schedule) => sum + (schedule.totalWorkingHours || 0), 0);
        const actualWeeklyHours = weeklySchedules.reduce((sum, schedule) => sum + (schedule.actualWorkingHours || 0), 0);

        setSelectedPeriodHours({
            total: totalWeeklyHours,
            actual: actualWeeklyHours
        });
    }, [schedules]);

    // Calculate hours for selected month
    const calculateMonthlyHours = useCallback((month: Date) => {
        const monthlySchedules = schedules.filter(schedule => {
            try {
                const scheduleDate = new Date(schedule.date);
                return isSameMonth(scheduleDate, month);
            } catch (error) {
                console.error("Error parsing date:", error, schedule.date);
                return false;
            }
        });

        const totalMonthlyHours = monthlySchedules.reduce((sum, schedule) => sum + (schedule.totalWorkingHours || 0), 0);
        const actualMonthlyHours = monthlySchedules.reduce((sum, schedule) => sum + (schedule.actualWorkingHours || 0), 0);

        setSelectedPeriodHours({
            total: totalMonthlyHours,
            actual: actualMonthlyHours
        });
    }, [schedules]);

    // Handle week change
    const handleWeekChange = useCallback((week: Date) => {
        setCurrentWeek(week);
        calculateWeeklyHours(week);
    }, [calculateWeeklyHours]);

    // Handle month change
    const handleMonthChange = useCallback((month: Date) => {
        setCurrentMonth(month);
        calculateMonthlyHours(month);
    }, [calculateMonthlyHours]);

    // Initialize calculations when schedules are loaded
    useEffect(() => {
        if (activeTab === "weekly") {
            calculateWeeklyHours(currentWeek);
        } else {
            calculateMonthlyHours(currentMonth);
        }
    }, [schedules, activeTab, calculateWeeklyHours, calculateMonthlyHours, currentWeek, currentMonth]);

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);

        if (key === "weekly") {
            const week = weeklyCalendarRef.current?.getCurrentWeek() || currentWeek;
            calculateWeeklyHours(week);
        } else {
            calculateMonthlyHours(currentMonth);
        }
    };

    // Memoize calendar activities to avoid recomputation on re-renders
    const calendarActivities = useMemo<Activity[]>(() => {
        return schedules.map((schedule: DriverSchedule, index) => {
            // Validate date before creating date object
            let scheduleDate = new Date();
            try {
                scheduleDate = new Date(schedule.date);
                if (isNaN(scheduleDate.getTime())) {
                    scheduleDate = new Date(); // Use today as fallback
                }
            } catch (e) {
                console.log(e)
            }

            const shift = schedule.shift;
            const day = scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1;
            const vehicleName = schedule.vehicle?.name || 'Không có xe';

            return {
                id: schedule._id || `schedule-${index}`,
                name: vehicleName,
                vehicleName,
                driverName: driver?.name || '',
                vehicleId: schedule.vehicle?._id || '',
                driverId: typeof schedule.driver === 'object'
                    ? schedule.driver._id
                    : schedule.driver || driver?._id || '',
                title: `${vehicleName} (${shift})`,
                description: `Trạng thái: ${getStatusTranslation(schedule.status)}`,
                startTime: shift,
                endTime: shift,
                day,
                color: getStatusColor(schedule.status),
                date: schedule.date,
                originalDate: scheduleDate,
                status: schedule.status,
                checkinTime: schedule.checkinTime,
                checkoutTime: schedule.checkoutTime
            };
        });
    }, [schedules, driver]);

    // Memoize performance metrics to avoid recomputation
    const performanceMetrics = useMemo(() => {
        const completedSchedules = schedules.filter(s => s.status === DriverSchedulesStatus.COMPLETED);
        const attendanceRate = schedules.length > 0
            ? Math.round((completedSchedules.length / schedules.length) * 100)
            : 0;
        const lateCount = schedules.filter(s => s.isLate).length;
        const earlyCheckoutCount = schedules.filter(s => s.isEarlyCheckout).length;
        const totalBreakTimeMinutes = schedules.reduce(
            (total, schedule) => total + calculateTotalBreakTime(schedule.breakTimes),
            0
        );
        const avgBreakTimePerDay = completedSchedules.length > 0
            ? Math.round(totalBreakTimeMinutes / completedSchedules.length)
            : 0;

        return {
            completedSchedules,
            attendanceRate,
            lateCount,
            earlyCheckoutCount,
            totalBreakTimeMinutes,
            avgBreakTimePerDay
        };
    }, [schedules]);

    // Early returns for loading/error states
    if (loading) return <div className="flex-1 p-4 flex items-center justify-center">Đang tải...</div>;
    if (error) return <div className="flex-1 p-4 flex items-center justify-center text-red-500">{error}</div>;
    if (!driver) return <div className="flex-1 p-4 flex items-center justify-center">Không tìm thấy tài xế</div>;

    // Tab items configuration
    const tabItems = [
        {
            key: 'weekly',
            label: 'Lịch hàng tuần',
            children: <ScheduleCalendar
                activities={calendarActivities}
                ref={weeklyCalendarRef}
                currentWeek={currentWeek}
                onWeekChange={handleWeekChange}
            />
        },
        {
            key: 'monthly',
            label: 'Lịch tháng',
            children: <MonthlyScheduleCalendar
                activities={calendarActivities}
                currentDate={currentMonth}
                onMonthChange={handleMonthChange}
            />
        }
    ];

    const {
        completedSchedules,
        attendanceRate,
        lateCount,
        earlyCheckoutCount,
        avgBreakTimePerDay
    } = performanceMetrics;

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
                                src={driver.avatar || "/images/default-avatar.png"}
                                alt={driver.name || "Tài xế"}
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                                onError={(e) => {
                                    // Handle image loading error
                                    e.currentTarget.src = "/images/default-avatar.png";
                                }}
                            />
                        </div>
                        <div className="w-2/3 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold">{driver.name || "Tài xế chưa có tên"}</h1>
                            </div>
                            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:flex-wrap text-xs font-medium">
                                <div className="flex items-center gap-2">
                                    <Image src="/icons/date.png" alt="Ngày" width={14} height={14} />
                                    <span>{formatDate(driver.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Image src="/icons/mail.png" alt="Email" width={14} height={14} />
                                    <span className="truncate max-w-[180px]">{driver.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Image src="/icons/phone.png" alt="Điện thoại" width={14} height={14} />
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
                                alt="Tỷ lệ điểm danh"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{attendanceRate}%</h1>
                                <span className="text-sm text-gray-400">Tỷ lệ điểm danh</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleBranch.png"
                                alt="Lịch trình"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{schedules.length}</h1>
                                <span className="text-sm text-gray-400">Lịch trình</span>
                            </div>
                        </div>
                        {/* CARD - Selected Period Total Hours */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleLesson.png"
                                alt="Tổng giờ làm"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{workingHours.total}</h1>
                                <span className="text-sm text-gray-400">
                                    Tổng giờ làm
                                </span>
                            </div>
                        </div>
                        {/* CARD - Selected Period Actual Hours */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleClass.png"
                                alt="Giờ làm thực tế"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{workingHours.actual.toFixed(2)}</h1>
                                <span className="text-sm text-gray-400">
                                    Giờ làm thực tế
                                </span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleWarning.png"
                                alt="Đi muộn"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{lateCount}</h1>
                                <span className="text-sm text-gray-400">Đi muộn</span>
                            </div>
                        </div>
                        {/* CARD - Early Checkout */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleClass.png"
                                alt="Về sớm"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{earlyCheckoutCount}</h1>
                                <span className="text-sm text-gray-400">Về sớm</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleClass.png"
                                alt="Ca hoàn thành"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{completedSchedules.length}</h1>
                                <span className="text-sm text-gray-400">Ca hoàn thành</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image
                                src="/icons/singleClass.png"
                                alt="Tạm dừng ca"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{avgBreakTimePerDay} phút</h1>
                                <span className="text-sm text-gray-400">Tạm dừng ca</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* BOTTOM */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="text-lg font-semibold">
                            {activeTab === 'weekly' ? 'Lịch tuần' : 'Lịch tháng'}
                        </h2>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-500">Tổng giờ:</span>
                                <span className="font-medium">{selectedPeriodHours.total.toFixed(2)} giờ</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500">Giờ thực tế:</span>
                                <span className="font-medium">{selectedPeriodHours.actual.toFixed(2)} giờ</span>
                            </div>
                        </div>
                    </div>
                    <Tabs
                        items={tabItems}
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        className="h-full"
                    />
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Lịch trình gần đây</h1>
                    <div className="mt-4 flex flex-col gap-3">
                        {schedules.slice(0, 5).map((schedule, index) => {
                            const isValidDate = !isNaN(new Date(schedule.date).getTime());

                            return (
                                <div key={index} className="flex flex-col p-3 rounded-md bg-gray-50 hover:bg-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${schedule.status === DriverSchedulesStatus.COMPLETED ? 'bg-green-500' :
                                                schedule.status === DriverSchedulesStatus.IN_PROGRESS ? 'bg-blue-500' :
                                                    schedule.status === DriverSchedulesStatus.NOT_STARTED ? 'bg-gray-500' : 'bg-purple-500'
                                                }`}></div>
                                            <div>
                                                <p className="text-sm font-medium">{schedule.vehicle?.name || 'Không có xe'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {isValidDate
                                                        ? new Date(schedule.date).toLocaleDateString()
                                                        : 'Ngày không hợp lệ'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{schedule.shift}</span>
                                    </div>

                                    {/* Additional details for completed or in-progress schedules */}
                                    {(schedule.status === DriverSchedulesStatus.COMPLETED ||
                                        schedule.status === DriverSchedulesStatus.IN_PROGRESS) && (
                                            <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-gray-500">Giờ vào:</p>
                                                    <p>{formatTime(schedule.checkinTime)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Giờ ra:</p>
                                                    <p>{formatTime(schedule.checkoutTime)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Giờ làm việc:</p>
                                                    <p>{schedule.actualWorkingHours.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Số lần nghỉ:</p>
                                                    <p>{schedule.breakTimes?.length || 0}</p>
                                                </div>
                                                {schedule.isLate && (
                                                    <div className="col-span-2">
                                                        <span className="text-red-500">Đi làm muộn</span>
                                                    </div>
                                                )}
                                                {schedule.isEarlyCheckout && (
                                                    <div className="col-span-2">
                                                        <span className="text-red-500">Về sớm</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                        {schedules.length === 0 && (
                            <div className="p-3 text-center text-gray-500">
                                Không có lịch trình nào
                            </div>
                        )}
                    </div>
                </div>
                {/* <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Tổng kết hiệu suất</h1>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                            <h3 className="text-sm font-medium">Tổng giờ</h3>
                            <p className="text-xl mt-1">{workingHours.total}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <h3 className="text-sm font-medium">Giờ thực tế</h3>
                            <p className="text-xl mt-1">{workingHours.actual.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <h3 className="text-sm font-medium">Ca hoàn thành</h3>
                            <p className="text-xl mt-1">{completedSchedules.length}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <h3 className="text-sm font-medium">Giờ nghỉ TB</h3>
                            <p className="text-xl mt-1">{avgBreakTimePerDay} phút</p>
                        </div>
                    </div>
                </div> */}
                {/* <Performance />
                <Announcements /> */}
            </div>
        </div>
    );
};

export default DriverSinglePage;