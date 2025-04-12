'use client'
import React, { useState, forwardRef } from 'react';
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
}

export const ScheduleCalendar = forwardRef<{ getCurrentWeek: () => Date }, ScheduleCalendarProps>(({
    activities = [],
    onActivityClick,
    onSlotClick,
    currentWeek: externalCurrentWeek,
    onWeekChange,
}, ref) => {
    const [internalCurrentWeek, setInternalCurrentWeek] = useState(
        externalCurrentWeek || startOfWeek(new Date(), { weekStartsOn: 1 })
    );


    const currentWeek = externalCurrentWeek || internalCurrentWeek;
    console.log('Current Week:', currentWeek);
    const setCurrentWeek = (week: Date) => {
        setInternalCurrentWeek(week);
        onWeekChange?.(week);
    };

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

    const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const today = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

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
                console.log(`Không thể đặt lịch cho ngày đã qua: ${format(actualDate, 'yyyy-MM-dd')}`);
                return; // Không cho phép đặt lịch cho ngày đã qua
            }

            console.log(`Đã nhấp vào: ${format(actualDate, 'yyyy-MM-dd')} - Ca ${time}`);
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
                <h2 className="text-lg font-semibold">Lịch Tài Xế</h2>
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
                        <div key={i} className={`p-3 border text-center font-medium ${isDateInPast(day) ? 'bg-gray-200' : ''}`}>
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
                                    className={`relative p-2 border ${isPastDate ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} min-h-[120px]`}
                                    onClick={() => !isPastDate && handleSlotClick(time, dayIndex)}
                                >
                                    {dayActivities.map(activity => (
                                        <div
                                            key={activity.id}
                                            className={`p-2 rounded ${activity.color || 'bg-blue-100'} cursor-pointer text-sm mb-1`}
                                            onClick={(e) => handleActivityClick(e, activity)}
                                        >
                                            <div className="font-medium truncate">{activity.title}</div>
                                            <div className="text-xs truncate text-gray-600">{activity.description}</div>
                                        </div>
                                    ))}

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