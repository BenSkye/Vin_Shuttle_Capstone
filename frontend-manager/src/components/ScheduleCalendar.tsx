'use client'
import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface Activity {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    day: number;
    color?: string;
}

interface ScheduleCalendarProps {
    activities?: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onSlotClick?: (time: string, day: number) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    activities = [],
    onActivityClick,
    onSlotClick,
}) => {
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Generate time slots from 8 AM to 8 PM
    const timeSlots = Array.from({ length: 4 }, (_, i) => String.fromCharCode(65 + i));

    const timeRanges: Record<string, string> = {
        A: '06:00 - 14:00',
        B: '10:00 - 18:00',
        C: '12:00 - 20:00',
        D: '15:00 - 23:00',
    };

    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const getActivitiesForSlot = (time: string, day: number) => {
        return activities.filter(
            activity => activity.startTime === time && activity.day === day
        );
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev => {
            const days = direction === 'prev' ? -7 : 7;
            return addDays(prev, days);
        });
    };

    return (
        <Card className="p-4 overflow-x-auto">
            {/* Calendar Header */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {format(currentWeek, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigateWeek('prev')}
                    >
                        Previous Week
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigateWeek('next')}
                    >
                        Next Week
                    </Button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] min-w-[800px]">
                {/* Empty corner cell */}
                <div className="border-b border-r p-2 bg-gray-50"></div>

                {/* Day headers */}
                {days.map((day, index) => (
                    <div
                        key={index}
                        className="border-b border-r p-2 bg-gray-50 text-center font-semibold"
                    >
                        <div>{format(day, 'EEE')}</div>
                        <div className="text-sm text-gray-600">{format(day, 'MMM d')}</div>
                    </div>
                ))}

                {/* Time slots and activity cells */}
                {timeSlots.map((time) => (
                    <React.Fragment key={time}>
                        {/* Time slot */}
                        <div className="border-b border-r p-2 bg-gray-50 text-sm">
                            {time}<span className="text-gray-500 text-xs">({timeRanges[time]})</span>
                        </div>

                        {/* Activity cells for each day */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                            const cellActivities = getActivitiesForSlot(time, dayIndex);

                            return (
                                <div
                                    key={`${time}-${dayIndex}`}
                                    className="border-b border-r p-1 min-h-[60px] relative hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onSlotClick?.(time, dayIndex)}
                                >
                                    {cellActivities.map(activity => (
                                        <Popover key={activity.id}>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className={`
                            mb-1 p-1 rounded text-sm cursor-pointer
                            ${activity.color || 'bg-blue-100 hover:bg-blue-200'}
                          `}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onActivityClick?.(activity);
                                                    }}
                                                >
                                                    <div className="font-medium">{activity.title}</div>

                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64">
                                                <div className="p-2">
                                                    <h3 className="font-bold">{activity.title}</h3>
                                                    {activity.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {activity.description}
                                                        </p>
                                                    )}
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {format(days[activity.day], 'MMMM d')} •{' '}
                                                        {activity.startTime} - {activity.endTime}
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </Card>
    );
};