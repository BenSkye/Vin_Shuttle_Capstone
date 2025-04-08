'use client'
import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { BusSchedule } from '@/interfaces/bus-schedule';

interface BusScheduleCalendarProps {
    schedules?: BusSchedule[];
    onScheduleClick?: (schedule: BusSchedule) => void;
    onSlotClick?: (time: string, day: number, date: Date) => void;
    currentWeek?: Date;
    onWeekChange?: (week: Date) => void;
}

export const BusScheduleCalendar = ({
    schedules = [],
    onScheduleClick,
    onSlotClick,
    currentWeek: externalCurrentWeek,
    onWeekChange,
}: BusScheduleCalendarProps) => {
    const [internalCurrentWeek, setInternalCurrentWeek] = useState(
        externalCurrentWeek || startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const currentWeek = externalCurrentWeek || internalCurrentWeek;
    const setCurrentWeek = (week: Date) => {
        setInternalCurrentWeek(week);
        onWeekChange?.(week);
    };

    // Generate time slots for bus schedules (different from driver shifts)
    const timeSlots = [
        '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
        '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    // Generate the days of the current week
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const today = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const getSchedulesForTimeAndDay = (time: string, dayIndex: number) => {
        const dayDate = days[dayIndex];
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime);
            return isSameDay(scheduleDate, dayDate) &&
                format(scheduleDate, 'HH:mm') === time;
        });
    };

    const handleSlotClick = (time: string, dayIndex: number) => {
        if (onSlotClick) {
            const actualDate = days[dayIndex];
            onSlotClick(time, dayIndex, actualDate);
        }
    };

    const handleScheduleClick = (e: React.MouseEvent, schedule: BusSchedule) => {
        e.stopPropagation();
        if (onScheduleClick) {
            onScheduleClick(schedule);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Lịch trình xe bus</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">
                        Tuần từ {format(currentWeek, 'dd/MM/yyyy')}
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
                    <div className="p-3 border font-medium">Giờ</div>
                    {days.map((day, i) => (
                        <div key={i} className="p-3 border text-center font-medium">
                            <div>{format(day, 'EEEE')}</div>
                            <div className="text-xs text-gray-500">{format(day, 'dd/MM')}</div>
                        </div>
                    ))}
                </div>

                {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-8 min-h-[80px]">
                        <div className="p-2 border bg-gray-50">
                            <div className="font-medium">{time}</div>
                        </div>
                        {days.map((day, dayIndex) => {
                            const daySchedules = getSchedulesForTimeAndDay(time, dayIndex);

                            return (
                                <div
                                    key={`${time}-${dayIndex}`}
                                    className="relative p-2 border hover:bg-gray-50 cursor-pointer min-h-[80px]"
                                    onClick={() => handleSlotClick(time, dayIndex)}
                                >
                                    {daySchedules.map(schedule => (
                                        <div
                                            key={schedule.id}
                                            className="p-2 rounded bg-blue-100 cursor-pointer text-sm mb-1"
                                            onClick={(e) => handleScheduleClick(e, schedule)}
                                        >
                                            <div className="font-medium truncate">
                                                {schedule.routeName}
                                            </div>
                                            <div className="text-xs truncate text-gray-600">
                                                {schedule.vehicleName}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="absolute bottom-2 right-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors">
                                            <PlusOutlined className="text-gray-500 hover:text-blue-600 text-base" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};