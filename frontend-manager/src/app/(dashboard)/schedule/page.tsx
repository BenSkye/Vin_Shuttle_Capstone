'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { Modal, Form, Button, Select, message, Alert } from 'antd';
import { Activity } from '@/interfaces/index';
import EventCalendar from '@/components/EventCalendar';
import Announcements from '@/components/Announcements';

import { Driver } from '@/interfaces/index';
import { getDriverSchedule, getAvailableDrivers } from '@/services/api/driver';
import { DriverSchedule, updateDriverSchedule } from '@/services/api/schedule';
import { format } from 'date-fns';

import { Vehicle } from '@/interfaces/index';
import { getAvailableVehicles } from '../../../services/api/vehicles';


const SchedulePage = () => {
    // State definitions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [form] = Form.useForm();

    // Time slot mappings
    const shiftTimeRanges = {
        'A': '06:00 - 14:00',
        'B': '10:00 - 18:00',
        'C': '12:00 - 20:00',
        'D': '15:00 - 23:00',
    };

    // Day names mapping
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Initial data loading
    useEffect(() => {

        fetchDriverSchedules();
    }, []);

    const fetchVehicles = async (date: string) => {
        try {
            setError(null);
            setLoading(true);
            console.log("Fetching vehicles for date:", date);
            const response = await getAvailableVehicles(date);
            console.log("Available vehicles:", response);
            setVehicles(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load vehicles";
            console.error("Error fetching vehicles:", error);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };




    // Fetch available drivers
    const fetchDrivers = async (date: string) => {
        try {
            setError(null);
            setLoading(true);
            console.log("Fetching vehicles for date:", date);
            const response = await getAvailableDrivers(date);
            console.log("Available vehicles:", response);
            setDrivers(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load drivers";
            console.error("Error fetching drivers:", error);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchDriverSchedules = async () => {
        try {
            setError(null);
            const response = await getDriverSchedule();

            if (!Array.isArray(response)) {
                const errorMessage = "Invalid response format for schedules";
                console.error(errorMessage, response);
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            const formattedActivities = response.map((schedule) => {
                // Process date and convert to actual Date object
                const scheduleDate = new Date(schedule.date);

                // Get day of week from the schedule's date (0 = Sunday, 1 = Monday, etc.)
                // Convert to our day index system (0 = Monday, 6 = Sunday)
                const dayOfWeek = scheduleDate.getDay();
                const day = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                return {
                    id: schedule._id,
                    driverId: schedule.driver?._id || "Unknown Driver ID",
                    title: schedule.driver?.name || "Unknown Driver",
                    description: `Vehicle: ${schedule.vehicle?.name || "N/A"}`,
                    startTime: schedule.shift,
                    endTime: schedule.shift,
                    day: day,
                    color: getStatusColor(schedule.status),
                    date: scheduleDate.toISOString().split('T')[0],
                    // Store original date object to help with week calculations
                    originalDate: scheduleDate
                };
            });

            setActivities(formattedActivities);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load schedules";
            console.error("Error fetching driver schedules:", error);
            setError(errorMessage);
            message.error(errorMessage);
        }
    };
    // Get color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 hover:bg-green-200';
            case 'in_progress':
                return 'bg-blue-100 hover:bg-blue-200';
            case 'not_started':
                return 'bg-yellow-100 hover:bg-yellow-200';
            default:
                return 'bg-gray-100 hover:bg-gray-200';
        }
    };

    // Event handlers
    const handleActivityClick = (activity: Activity) => {
        setError(null);
        setSelectedActivity(activity);
        setIsModalOpen(true);

        // If the activity has a driver and vehicle ID, populate the form
        if (activity.driverId) {
            // Fetch available vehicles for the activity date
            if (activity.date) {
                fetchVehicles(activity.date);
            }

            form.setFieldsValue({
                driverId: activity.driverId,
                vehicleId: (activity.description ?? '').replace('Vehicle: ', '').trim() !== 'N/A'
                    ? vehicles.find(v => v.name === (activity.description ?? '').replace('Vehicle: ', '').trim())?._id
                    : undefined
            });
            setIsEditing(true);
            setSelectedTime(activity.startTime);
            setSelectedDay(activity.day);
            if (activity.date) {
                setSelectedDate(activity.date);
            }
        }
    };

    const handleSlotClick = (time: string, day: number, date: Date) => {
        setError(null);
        setSelectedTime(time);
        setSelectedDay(day);
        setSelectedActivity(null);
        setIsEditing(false);

        // Use the exact date from the calendar cell
        const formattedDate = format(date, 'yyyy-MM-dd');

        console.log("Selected cell date:", formattedDate, "Day:", day, "Time:", time);

        // Fetch available vehicles for the selected date
        fetchVehicles(formattedDate);
        fetchDrivers(formattedDate);

        setSelectedDate(formattedDate);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleAssignDriver = async () => {
        try {
            setError(null);
            setLoading(true);
            const values = await form.validateFields();

            if (!selectedDate) {
                const errorMessage = "Date calculation error";
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            const scheduleData = {
                driver: values.driverId,
                vehicle: values.vehicleId,
                date: selectedDate,
                shift: selectedTime
            };

            await DriverSchedule(scheduleData);
            message.success("Driver scheduled successfully");
            setIsModalOpen(false);
            fetchDriverSchedules();
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (typeof error === "object" && error !== null && "response" in error) {
                const err = error as { response?: { data?: { vnMessage?: string } } };
                errorMessage = err.response?.data?.vnMessage || errorMessage;
            }

            console.error("Error assigning driver:", errorMessage);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async () => {
        if (!selectedActivity) return;

        try {
            setError(null);
            setLoading(true);
            const values = await form.validateFields();

            await updateDriverSchedule(
                selectedActivity.id,
                values.driverId,
                selectedDate,
                selectedTime,
                values.vehicleId
            );

            message.success("Schedule updated successfully");
            setIsModalOpen(false);
            fetchDriverSchedules();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update schedule";
            console.error("Error updating schedule:", error);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setError(null);
    };

    // Render activity details or form
    const renderModalContent = () => {
        return (
            <>
                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        className="mb-4"
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                {selectedActivity && !isEditing ? (
                    <div>
                        <p><strong>Driver:</strong> {selectedActivity.title}</p>
                        <p><strong>Description:</strong> {selectedActivity.description}</p>
                        <p>
                            <strong>Shift:</strong> {selectedActivity.endTime}
                            ({shiftTimeRanges[selectedActivity.endTime as keyof typeof shiftTimeRanges] || ''})
                        </p>
                        <Button
                            type="primary"
                            onClick={() => setIsEditing(true)}
                            className="mt-4"
                        >
                            Edit Schedule
                        </Button>
                    </div>
                ) : (
                    <Form form={form} layout="vertical">
                        <div className="mb-4">
                            <p className="text-base font-medium">
                                {isEditing ? "Updating" : "Assigning"} driver for:
                                <span className="font-bold ml-1">
                                    {dayNames[selectedDay]} - Shift {selectedTime}
                                    ({shiftTimeRanges[selectedTime as keyof typeof shiftTimeRanges] || ''})
                                </span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Date: {selectedDate}</p>
                        </div>

                        <Form.Item
                            name="driverId"
                            label="Select Driver"
                            rules={[{ required: true, message: 'Please select a driver' }]}
                        >
                            <Select
                                placeholder="Choose a driver"
                                showSearch
                                optionFilterProp="children"
                            >
                                {drivers.map(driver => (
                                    <Select.Option key={driver._id} value={driver._id}>
                                        {driver.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="vehicleId"
                            label="Select Vehicle"
                            rules={[{ required: true, message: 'Please select a vehicle' }]}
                        >
                            <Select placeholder="Choose a vehicle">
                                {vehicles.map(vehicle => (
                                    <Select.Option value={vehicle._id} key={vehicle._id}>{vehicle.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                )}
            </>
        );
    };

    // Modal footer buttons
    const renderModalFooter = () => [
        <Button key="close" onClick={handleModalClose}>
            Cancel
        </Button>,
        (!selectedActivity || isEditing) && (
            <Button
                key="submit"
                type="primary"
                onClick={isEditing ? handleUpdateSchedule : handleAssignDriver}
                loading={loading}
            >
                {isEditing ? "Update" : "Assign"}
            </Button>
        )
    ];

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">

            <div className="p-4 flex-grow">
                <ScheduleCalendar
                    activities={activities}
                    onActivityClick={handleActivityClick}
                    onSlotClick={handleSlotClick}
                />

                <Modal
                    title={selectedActivity && !isEditing ? "Driver Schedule Details" : isEditing ? "Update Schedule" : "Assign Driver"}
                    open={isModalOpen}
                    onCancel={handleModalClose}
                    footer={renderModalFooter()}
                >
                    {renderModalContent()}
                </Modal>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <EventCalendar />
                <Announcements />
            </div>
        </div>
    );
};

export default SchedulePage;