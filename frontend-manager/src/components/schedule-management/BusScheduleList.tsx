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
import {
    BusSchedule,
    getActiveScheduleByRoute,
    createBusSchedule,
    updateBusSchedule,
    deleteBusSchedule,
    generateTrips
} from '@/services/api/busSchedules';
import { toast } from 'sonner';

export const BusScheduleList = () => {
    const [schedules, setSchedules] = useState<BusSchedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            // TODO: Replace with actual route ID
            const routeId = "507f1f77bcf86cd799439011";
            const data = await getActiveScheduleByRoute(routeId);
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast.error('Failed to fetch schedules');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBusSchedule(id);
            toast.success('Schedule deleted successfully');
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error('Failed to delete schedule');
        }
    };

    const handleGenerateTrips = async (id: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await generateTrips(id, today);
            toast.success('Trips generated successfully');
        } catch (error) {
            console.error('Error generating trips:', error);
            toast.error('Failed to generate trips');
        }
    };

    const handleEdit = (schedule: BusSchedule) => {
        setSelectedSchedule(schedule);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedSchedule: BusSchedule) => {
        try {
            if (updatedSchedule._id) {
                await updateBusSchedule(updatedSchedule._id, updatedSchedule);
                toast.success('Schedule updated successfully');
            } else {
                await createBusSchedule(updatedSchedule);
                toast.success('Schedule created successfully');
            }
            setIsEditModalOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error('Failed to save schedule');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Bus Schedules</h2>
                <Button onClick={() => handleEdit({} as BusSchedule)}>
                    Add New Schedule
                </Button>
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
                        <TableRow key={schedule._id}>
                            <TableCell>{schedule.busRoute}</TableCell>
                            <TableCell>{schedule.tripsPerDay}</TableCell>
                            <TableCell>{schedule.dailyStartTime}</TableCell>
                            <TableCell>{schedule.dailyEndTime}</TableCell>
                            <TableCell>{schedule.effectiveDate}</TableCell>
                            <TableCell>{schedule.expiryDate}</TableCell>
                            <TableCell>{schedule.status}</TableCell>
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
                                        onClick={() => handleGenerateTrips(schedule._id!)}
                                    >
                                        Generate Trips
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(schedule._id!)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {isEditModalOpen && selectedSchedule && (
                <EditBusSchedule
                    schedule={selectedSchedule}
                    onSave={handleSave}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}; 