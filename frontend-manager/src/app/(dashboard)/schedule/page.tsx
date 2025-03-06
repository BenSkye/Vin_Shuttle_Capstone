'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { Modal, Form, Button, Select, message } from 'antd';
import { Activity } from '@/interfaces/index';
import EventCalendar from '@/components/EventCalendar';
import Announcements from '@/components/Announcements';
import { getDriver } from '@/services/api/user';
import { Driver } from '@/interfaces/index';
import { getDriverSchedule, DriverSchedule } from '@/services/api/schedule';
import { format } from 'date-fns';

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
        fetchDrivers();
        fetchDriverSchedules();
    }, []);

    // Update selected date when day changes


    // Fetch available drivers
    const fetchDrivers = async () => {
        try {
            const response = await getDriver();
            setDrivers(response);
        } catch (error) {
            console.error("Error fetching drivers:", error);
            message.error("Failed to load drivers");
        }
    };

    const fetchDriverSchedules = async () => {
        try {
            const response = await getDriverSchedule();

            if (!Array.isArray(response)) {
                console.error("Invalid response format:", response);
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
            console.error("Error fetching driver schedules:", error);
            message.error("Failed to load schedules");
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
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleSlotClick = (time: string, day: number, date: Date) => {
        setSelectedTime(time);
        setSelectedDay(day);
        setSelectedActivity(null);

        // Use the exact date from the calendar cell
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log("Selected cell date:", formattedDate, "Day:", day, "Time:", time);

        setSelectedDate(formattedDate);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleAssignDriver = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            if (!selectedDate) {
                message.error("Date calculation error");
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
        } catch (error) {
            console.error("Error assigning driver:", error);
            message.error("Failed to assign driver");
        } finally {
            setLoading(false);
        }
    };

    // Render activity details or form
    const renderModalContent = () => {
        if (selectedActivity) {
            return (
                <div>
                    <p><strong>Driver:</strong> {selectedActivity.title}</p>
                    <p><strong>Description:</strong> {selectedActivity.description}</p>
                    <p>
                        <strong>Shift:</strong> {selectedActivity.endTime}
                        ({shiftTimeRanges[selectedActivity.endTime as keyof typeof shiftTimeRanges] || ''})
                    </p>
                </div>
            );
        }

        return (
            <Form form={form} layout="vertical">
                <div className="mb-4">
                    <p className="text-base font-medium">
                        Assigning driver for:
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
                        <Select.Option value="67878002048da981c9778455">xe 6 chỗ A34</Select.Option>
                        <Select.Option value="6787801c048da981c9778458">xe 7 chỗ B45</Select.Option>
                        <Select.Option value="67a2f142e7e80dd43a68e5ea">xe 16 chỗ C56</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        );
    };

    // Modal footer buttons
    const renderModalFooter = () => [
        <Button key="close" onClick={() => setIsModalOpen(false)}>
            Cancel
        </Button>,
        !selectedActivity && (
            <Button
                key="submit"
                type="primary"
                onClick={handleAssignDriver}
                loading={loading}
            >
                Assign
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
                    title={selectedActivity ? "Driver Schedule Details" : "Assign Driver"}
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
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