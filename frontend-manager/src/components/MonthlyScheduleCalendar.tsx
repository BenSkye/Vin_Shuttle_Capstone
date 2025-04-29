'use client'

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, startOfWeek, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Activity } from '@/interfaces';
import { DriverSchedulesStatus } from '@/interfaces/driver-schedules.enum';

interface MonthlyScheduleCalendarProps {
    activities: Activity[];
    onActivityClick?: (activity: Activity) => void;
}

export const MonthlyScheduleCalendar: React.FC<MonthlyScheduleCalendarProps> = ({
    activities = [],
    onActivityClick,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get all days in current month
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    // Get the days of the week for the calendar header (start from Monday)
    const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    // Calculate calendar grid with leading and trailing days to fill the grid
    const calendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday

        const daysGrid = [];
        let day = startDate;

        // Create 6 weeks (42 days) to ensure enough space for any month
        for (let i = 0; i < 42; i++) {
            daysGrid.push(day);
            day = addDays(day, 1);
            if (isSameDay(day, addDays(monthEnd, 7))) break;
        }

        return daysGrid;
    };

    // Get activities for a specific date
    const getActivitiesForDate = (date: Date) => {
        return activities.filter(activity => {
            if (!activity.date) return false;
            const activityDate = new Date(activity.date);
            return isSameDay(activityDate, date);
        });
    };

    // Navigation functions for month
    const prevMonth = () => {
        setCurrentDate(date => {
            const newDate = new Date(date);
            newDate.setMonth(date.getMonth() - 1);
            return newDate;
        });
    };

    const nextMonth = () => {
        setCurrentDate(date => {
            const newDate = new Date(date);
            newDate.setMonth(date.getMonth() + 1);
            return newDate;
        });
    };

    const today = () => {
        setCurrentDate(new Date());
    };

    // Get status color based on activity status
    const getStatusColor = (status?: string): string => {
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

    // Handle activity click
    const handleActivityClick = (e: React.MouseEvent, activity: Activity) => {
        e.stopPropagation();
        if (onActivityClick) onActivityClick(activity);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-semibold">
                    {format(currentDate, 'MMMM yyyy', { locale: vi })}
                </h2>
                <div className="flex space-x-2">
                    <Button size="small" icon={<LeftOutlined />} onClick={prevMonth} />
                    <Button onClick={today}>Hôm nay</Button>
                    <Button size="small" icon={<RightOutlined />} onClick={nextMonth} />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* Days of the week */}
                {weekDays.map(day => (
                    <div key={day} className="p-2 text-center font-medium bg-gray-50 rounded">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays().map((date, index) => {
                    const dayActivities = getActivitiesForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div
                            key={index}
                            className={`
                                min-h-[100px] p-2 border rounded-md
                                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                                ${isToday ? 'border-blue-500 bg-blue-50' : ''}
                            `}
                        >
                            <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                                {format(date, 'd')}
                            </div>
                            <div className="mt-1 space-y-1 max-h-[90px] overflow-y-auto">
                                {dayActivities.map(activity => (
                                    <div
                                        key={activity.id}
                                        className={`
                                            text-xs p-1 rounded cursor-pointer
                                            ${activity.color || getStatusColor(activity.status)}
                                            hover:opacity-90
                                        `}
                                        onClick={(e) => handleActivityClick(e, activity)}
                                    >
                                        <div className="font-medium truncate">
                                            {activity.title || `${activity.vehicleName} (${activity.startTime})`}
                                        </div>
                                        <div className="text-xs truncate text-gray-600">
                                            {activity.startTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 