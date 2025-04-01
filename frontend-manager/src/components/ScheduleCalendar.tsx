'use client'
import React, { useState, forwardRef } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isSameWeek } from 'date-fns';
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
    const setCurrentWeek = (week: Date) => {
        setInternalCurrentWeek(week);
        onWeekChange?.(week);
    };

    // Expose current week through ref
    React.useImperativeHandle(ref, () => ({
        getCurrentWeek: () => currentWeek
    }));

    // Generate time slots
    const timeSlots = ['A', 'B', 'C', 'D']; // Shift codes

    const timeRanges: Record<string, string> = {
        A: '06:00 - 14:00',
        B: '10:00 - 18:00',
        C: '12:00 - 20:00',
        D: '15:00 - 23:00',
    };

    // Generate the days of the current week
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const today = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Filter activities for the current week view
    const filteredActivities = activities.filter(activity => {
        if (activity.date) {
            // If the activity has a date, check if it falls within this week
            const activityDate = activity.originalDate || new Date(activity.date);

            // Use isSameWeek to check if the activity is in the current week view
            return isSameWeek(activityDate, currentWeek, { weekStartsOn: 1 });
        }

        // If no date, we'll use the day index (legacy support)
        return true;
    });

    const getActivitiesForTimeAndDay = (time: string, dayIndex: number) => {
        const dayDate = days[dayIndex]; // Current date for this column

        return filteredActivities.filter(activity => {
            if (activity.date) {
                // If activity has a specific date, check if it matches this exact day and time
                const activityDate = activity.originalDate || new Date(activity.date);
                return isSameDay(activityDate, dayDate) && activity.startTime === time;
            }

            // Fallback to using day index (0-6)
            return activity.day === dayIndex && activity.startTime === time;
        });
    };

    // Handle click on a time slot
    const handleSlotClick = (time: string, dayIndex: number) => {
        if (onSlotClick) {
            const actualDate = days[dayIndex]; // This is the actual date for the clicked cell
            console.log(`Clicked on: ${format(actualDate, 'yyyy-MM-dd')} - Shift ${time}`);
            onSlotClick(time, dayIndex, actualDate);
        }
    };

    // Handle activity click
    const handleActivityClick = (e: React.MouseEvent, activity: Activity) => {
        e.stopPropagation(); // Stop event bubbling
        if (onActivityClick) {
            onActivityClick(activity);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Driver Schedule</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">
                        Week of {format(currentWeek, 'MMMM d, yyyy')}
                    </span>
                    <div className="flex space-x-2">
                        <Button size="small" icon={<LeftOutlined />} onClick={prevWeek} />
                        <Button onClick={today}>Today</Button>
                        <Button size="small" icon={<RightOutlined />} onClick={nextWeek} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-8 bg-gray-100 text-gray-700">
                    <div className="p-3 border font-medium">Shift</div>
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
                            <div className="font-medium">Shift {time}</div>
                            <div className="text-xs text-gray-500">{timeRanges[time]}</div>
                        </div>
                        {days.map((day, dayIndex) => {
                            const dayActivities = getActivitiesForTimeAndDay(time, dayIndex);


                            return (
                                <div
                                    key={`${time}-${dayIndex}`}
                                    className="relative p-2 border hover:bg-gray-50 cursor-pointer min-h-[120px]"
                                    onClick={() => handleSlotClick(time, dayIndex)}
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

                                    {/* Always show the plus icon in the bottom right corner */}
                                    <div className="absolute bottom-2 right-2 flex items-center justify-center">
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
});

ScheduleCalendar.displayName = 'ScheduleCalendar';