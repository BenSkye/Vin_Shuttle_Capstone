'use client'

import { BusScheduleList } from '@/components/schedule-management/BusScheduleList';

export default function BusSchedulesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý lịch trình xe bus</h1>
            </div>
            <BusScheduleList />
        </div>
    );
}