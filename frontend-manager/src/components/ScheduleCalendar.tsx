'use client'
import React, { useState, forwardRef, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isSameWeek, isBefore, startOfDay } from 'date-fns';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Activity } from '@/interfaces';

interface ScheduleCalendarProps {
    activities?: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onSlotClick?: (time: string, day: number, date: Date) => void; // Date parameter is crucial
    currentWeek?: Date;
    onWeekChange?: (week: Date) => void;
    isLoading?: boolean;
    setIsLoading?: (loading: boolean) => void;
}

export const ScheduleCalendar = forwardRef<{ getCurrentWeek: () => Date }, ScheduleCalendarProps>(({
    activities = [],
    onActivityClick,
    onSlotClick,
    currentWeek: externalCurrentWeek,
    onWeekChange,
    isLoading = false,
}, ref) => {
    const [internalCurrentWeek, setInternalCurrentWeek] = useState(
        externalCurrentWeek || startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const currentWeek = externalCurrentWeek || internalCurrentWeek;

    // Update internal state when external state changes
    useEffect(() => {
        if (externalCurrentWeek) {
            setInternalCurrentWeek(externalCurrentWeek);
        }
    }, [externalCurrentWeek]);

    // Expose current week through ref
    React.useImperativeHandle(ref, () => ({
        getCurrentWeek: () => currentWeek
    }));

    // Tạo các khung giờ
    const timeSlots = ['A', 'B', 'C', 'D']; // Mã ca làm việc

    const timeRanges: Record<string, string> = {
        A: '06:00 - 14:00',
        B: '10:00 - 18:00',
        C: '12:00 - 20:00',
        D: '15:00 - 23:00',
    };

    // Tạo các ngày trong tuần hiện tại
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const prevWeek = () => {
        const newWeek = subWeeks(currentWeek, 1);
        setInternalCurrentWeek(newWeek);
        if (onWeekChange) {
            onWeekChange(newWeek);
        }
    };

    const nextWeek = () => {
        const newWeek = addWeeks(currentWeek, 1);
        setInternalCurrentWeek(newWeek);
        if (onWeekChange) {
            onWeekChange(newWeek);
        }
    };

    const today = () => {
        const newWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
        setInternalCurrentWeek(newWeek);
        if (onWeekChange) {
            onWeekChange(newWeek);
        }
    };

    // Kiểm tra nếu ngày đã qua
    const isDateInPast = (date: Date) => {
        const today = startOfDay(new Date());
        return isBefore(date, today);
    };

    // Lọc hoạt động cho tuần hiện tại
    const filteredActivities = activities.filter(activity => {
        if (activity.date) {
            // Nếu hoạt động có ngày, kiểm tra xem nó có trong tuần này không
            const activityDate = activity.originalDate || new Date(activity.date);

            // Sử dụng isSameWeek để kiểm tra nếu hoạt động ở trong tuần hiện tại
            return isSameWeek(activityDate, currentWeek, { weekStartsOn: 1 });
        }

        // Bắt đầu tải dữ liệu
        // Nếu không có ngày, sử dụng chỉ số ngày (hỗ trợ cũ)
        return true;
    });

    const getActivitiesForTimeAndDay = (time: string, dayIndex: number) => {
        const dayDate = days[dayIndex]; // Ngày hiện tại cho cột này
        return filteredActivities.filter(activity => {
            if (activity.date) {
                // Nếu hoạt động có ngày cụ thể, kiểm tra xem nó có trùng với ngày và giờ này không
                const activityDate = activity.originalDate || new Date(activity.date);
                return isSameDay(activityDate, dayDate) && activity.startTime === time;
            }

            // Trở lại sử dụng chỉ số ngày (0-6)
            return activity.day === dayIndex && activity.startTime === time;
        });
    };

    // Xử lý khi nhấp vào khung giờ
    const handleSlotClick = (time: string, dayIndex: number) => {
        if (onSlotClick) {
            const actualDate = days[dayIndex]; // Đây là ngày thực tế của ô được nhấp

            // Kiểm tra nếu ngày đã qua
            if (isDateInPast(actualDate)) {
                return; // Không cho phép đặt lịch cho ngày đã qua
            }

            onSlotClick(time, dayIndex, actualDate);
        }
    };

    // Xử lý khi nhấp vào hoạt động
    const handleActivityClick = (e: React.MouseEvent, activity: Activity) => {
        e.stopPropagation(); // Ngăn sự kiện lan truyền
        if (onActivityClick) {
            onActivityClick(activity);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b">
                {/* <h2 className="text-lg font-semibold">Lịch Tài Xế</h2> */}
                <div className="flex items-center space-x-4">
                    <span className="text-sm">
                        Tuần từ {format(currentWeek, 'MMMM d, yyyy')}
                    </span>
                    <div className="flex space-x-2">
                        <Button size="small" icon={<LeftOutlined />} onClick={prevWeek} />
                        <Button onClick={today}>Hôm nay</Button>
                        <Button size="small" icon={<RightOutlined />} onClick={nextWeek} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-8 bg-gray-100 text-gray-700">
                    <div className="p-3 border font-medium">Ca</div>
                    {days.map((day, i) => (
                        <div key={i} className="p-3 border text-center font-medium">
                            <div>{format(day, 'EEEE')}</div>
                            <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                        </div>
                    ))}
                </div>

                {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-8 min-h-[120px]">
                        <div className="p-2 border bg-gray-50">
                            <div className="font-medium">Ca {time}</div>
                            <div className="text-xs text-gray-500">{timeRanges[time]}</div>
                        </div>
                        {days.map((day, dayIndex) => {
                            const dayActivities = getActivitiesForTimeAndDay(time, dayIndex);
                            const isPastDate = isDateInPast(day);

                            return (
                                <div
                                    key={`${time}-${dayIndex}`}
                                    className={`relative p-2 border ${isPastDate ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} min-h-[120px]`}
                                    onClick={() => !isPastDate && handleSlotClick(time, dayIndex)}
                                >
                                    {isLoading ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div role="status">
                                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                </svg>
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        dayActivities.map(activity => {
                                            const isPastActivity = isDateInPast(activity.originalDate || (activity.date ? new Date(activity.date) : new Date()));
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className={`p-2 rounded ${activity.color || 'bg-blue-100'} cursor-pointer text-sm mb-1`}
                                                    onClick={(e) => handleActivityClick(e, activity)}
                                                >
                                                    <div className={`font-medium truncate ${isPastActivity ? 'text-gray-500' : ''}`}>{activity.title}</div>
                                                    <div className={`text-xs truncate ${isPastActivity ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</div>
                                                    {activity.status === 'completed' && activity.checkinTime && activity.checkoutTime && (
                                                        <div className="mt-1 text-xs text-gray-700">
                                                            <div>
                                                                <span className="font-medium">Check-in:</span> {new Date(activity.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Check-out:</span> {new Date(activity.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}


                                    {/* Chỉ hiển thị biểu tượng + cho ngày tương lai */}
                                    {!isPastDate && (
                                        <div className="absolute bottom-2 right-2 flex items-center justify-center">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors">
                                                <PlusOutlined className="text-gray-500 hover:text-blue-600 text-base" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
});

ScheduleCalendar.displayName = 'ScheduleCalendar';