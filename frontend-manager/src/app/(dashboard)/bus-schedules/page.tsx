'use client'
import { BusScheduleCalendar } from '@/components/bus-schedule/BusScheduleCalendar';
// import { BusScheduleForm } from '@/components/bus-schedule/BusScheduleForm';
import { useState } from 'react';
import { BusSchedule } from '@/interfaces/bus-schedule';

export default function BusSchedulesPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [schedules, setSchedules] = useState<BusSchedule[]>([]);

    const handleScheduleClick = (schedule: BusSchedule) => {
        // Handle schedule click
        console.log('Schedule clicked:', schedule);
    };

    const handleSlotClick = (time: string, day: number, date: Date) => {
        // Handle slot click
        setSchedules([...schedules, {
            id: '1',
            routeId: '1',
            routeName: 'Route 1',
            vehicleId: '1',
            vehicleName: 'Vehicle 1',
            startTime: '08:00',
            endTime: '18:00',
            status: 'ACTIVE'
        }]);
        console.log('Slot clicked:', { time, day, date });
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý lịch trình xe bus</h1>
                {/* <BusScheduleForm /> */}
            </div>
            <BusScheduleCalendar
                schedules={schedules}
                onScheduleClick={handleScheduleClick}
                onSlotClick={handleSlotClick}
                currentWeek={selectedDate}
                onWeekChange={setSelectedDate}
            />
        </div>
    );
}