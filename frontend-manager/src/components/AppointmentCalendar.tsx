'use client'

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Appointment {
    id: string;
    date: Date;
    title: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    startTime: string;
    endTime: string;
}

interface AppointmentCalendarProps {
    appointments?: Appointment[];
    onAppointmentClick?: (appointment: Appointment) => void;
    onDateSelect?: (date: Date) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    appointments = [],
    onAppointmentClick,
    onDateSelect,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Get all days in current month
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            if (direction === 'prev') {
                newDate.setMonth(prevDate.getMonth() - 1);
            } else {
                newDate.setMonth(prevDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter(appointment =>
            isSameDay(new Date(appointment.date), date)
        );
    };

    return (
        <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigateMonth('prev')}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigateMonth('next')}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div
                        key={day}
                        className="p-2 text-center font-semibold bg-gray-100"
                    >
                        {day}
                    </div>
                ))}

                {daysInMonth.map(date => {
                    const dayAppointments = getAppointmentsForDate(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                    return (
                        <div
                            key={date.toISOString()}
                            className={`
                min-h-[100px] p-2 border cursor-pointer
                ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}
              `}
                            onClick={() => handleDateClick(date)}
                        >
                            <div className="font-medium">{format(date, 'd')}</div>
                            <div className="mt-1">
                                {dayAppointments.map(appointment => (
                                    <div
                                        key={appointment.id}
                                        className={`
                      text-sm p-1 mb-1 rounded
                      ${appointment.status === 'confirmed' ? 'bg-green-100' :
                                                appointment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'}
                    `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAppointmentClick?.(appointment);
                                        }}
                                    >
                                        {appointment.title}
                                        <div className="text-xs text-gray-600">
                                            {appointment.startTime} - {appointment.endTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};