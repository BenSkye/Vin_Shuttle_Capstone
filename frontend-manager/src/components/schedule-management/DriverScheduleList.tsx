'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DriverSchedule {
    id: string;
    driverName: string;
    busRoute: string;
    shiftStartTime: string;
    shiftEndTime: string;
    workingDays: string[];
    effectiveDate: string;
    expiryDate: string;
    status: string;
}

export const DriverScheduleList = () => {
    const [schedules, setSchedules] = useState<DriverSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSchedules = async () => {
        try {
            const response = await fetch('/api/driver-schedules');
            if (!response.ok) throw new Error('Failed to fetch schedules');
            const data = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching driver schedules:', error);
            alert('Failed to load schedules');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const response = await fetch(`/api/driver-schedules/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete schedule');
            await fetchSchedules();
        } catch (error) {
            console.error('Error deleting driver schedule:', error);
            alert('Failed to delete schedule');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Driver Schedules</h2>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Driver Name</TableHead>
                        <TableHead>Bus Route</TableHead>
                        <TableHead>Shift Start</TableHead>
                        <TableHead>Shift End</TableHead>
                        <TableHead>Working Days</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                            <TableCell>{schedule.driverName}</TableCell>
                            <TableCell>{schedule.busRoute}</TableCell>
                            <TableCell>{schedule.shiftStartTime}</TableCell>
                            <TableCell>{schedule.shiftEndTime}</TableCell>
                            <TableCell>{schedule.workingDays.join(', ')}</TableCell>
                            <TableCell>{new Date(schedule.effectiveDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(schedule.expiryDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${schedule.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {schedule.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(schedule.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}; 