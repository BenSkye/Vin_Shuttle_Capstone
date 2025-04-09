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
import { EditBusSchedule } from './EditBusSchedule';

interface BusSchedule {
    id: string;
    busRoute: string;
    vehicles: string[];
    drivers: string[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate: string;
    status: string;
}

export const BusScheduleList = () => {
    const [schedules, setSchedules] = useState<BusSchedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSchedules = async () => {
        try {
            const response = await fetch('/api/bus-schedules');
            if (!response.ok) throw new Error('Failed to fetch schedules');
            const data = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching bus schedules:', error);
            alert('Failed to load schedules');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleEdit = (schedule: BusSchedule) => {
        setSelectedSchedule(schedule);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const response = await fetch(`/api/bus-schedules/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete schedule');

            await fetchSchedules();
        } catch (error) {
            console.error('Error deleting bus schedule:', error);
            alert('Failed to delete schedule');
        }
    };

    const handleGenerateTrips = async (id: string) => {
        try {
            const response = await fetch(`/api/bus-schedules/${id}/generate-trips`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to generate trips');

            alert('Trips generated successfully');
        } catch (error) {
            console.error('Error generating trips:', error);
            alert('Failed to generate trips');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Bus Schedules</h2>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Trips/Day</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                            <TableCell>{schedule.busRoute}</TableCell>
                            <TableCell>{schedule.tripsPerDay}</TableCell>
                            <TableCell>{schedule.dailyStartTime}</TableCell>
                            <TableCell>{schedule.dailyEndTime}</TableCell>
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
                                        onClick={() => handleEdit(schedule)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleGenerateTrips(schedule.id)}
                                    >
                                        Generate Trips
                                    </Button>
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

            {selectedSchedule && (
                <EditBusSchedule
                    schedule={selectedSchedule}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedSchedule(null);
                    }}
                    onUpdate={fetchSchedules}
                />
            )}
        </div>
    );
}; 