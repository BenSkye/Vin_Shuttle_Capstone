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

// Define modal types for clarity
type ModalType = 'view' | 'assign' | 'update' | 'none';

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
    const [modalType, setModalType] = useState<ModalType>('none');
    const [error, setError] = useState<string | null>(null);

    // Separate forms for assign and update operations
    const [assignForm] = Form.useForm();
    const [updateForm] = Form.useForm();

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
            console.log("Fetching drivers for date:", date);
            const response = await getAvailableDrivers(date);
            console.log("Available drivers:", response);
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
                    originalDate: scheduleDate,
                    vehicleId: schedule.vehicle?._id
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
        setModalType('update'); // Set modal type to 'update'
        setIsModalOpen(true);

        // If the activity has a driver and vehicle ID, prepare for potential updates
        if (activity.driverId) {
            // Fetch available vehicles and drivers for the activity date
            if (activity.date) {
                fetchVehicles(activity.date);
                fetchDrivers(activity.date);
            }

            updateForm.setFieldsValue({
                driverId: activity.driverId ? { value: activity.driverId, label: activity.name } : undefined,
                vehicleId: activity.vehicleId ? { value: activity.vehicleId, label: activity.name } : undefined,
            });

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
        setModalType('assign');

        // Use the exact date from the calendar cell
        const formattedDate = format(date, 'yyyy-MM-dd');

        console.log("Selected cell date:", formattedDate, "Day:", day, "Time:", time);

        // Fetch available vehicles for the selected date
        fetchVehicles(formattedDate);
        fetchDrivers(formattedDate);

        setSelectedDate(formattedDate);
        assignForm.resetFields();
        setIsModalOpen(true);
    };

    const handleAssignDriver = async () => {
        try {
            setError(null);
            setLoading(true);
            const values = await assignForm.validateFields();

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
            const values = await updateForm.validateFields();

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
            setModalType('none');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalType('none');
        setError(null);
    };

    const switchToUpdateMode = () => {
        setModalType('update');
    };

    // Modal title based on the current mode
    const getModalTitle = () => {
        switch (modalType) {
            case 'view':
                return "Driver Schedule Details";
            case 'assign':
                return "Assign Driver";
            case 'update':
                return "Update Schedule";
            default:
                return "Schedule";
        }
    };

    // Render view mode content
    const renderViewContent = () => {
        if (!selectedActivity) return null;

        return (
            <div>
                <p><strong>Driver:</strong> {selectedActivity.title}</p>
                <p><strong>Description:</strong> {selectedActivity.description}</p>
                <p>
                    <strong>Shift:</strong> {selectedActivity.endTime}
                    ({shiftTimeRanges[selectedActivity.endTime as keyof typeof shiftTimeRanges] || ''})
                </p>
                <Button
                    type="primary"
                    onClick={switchToUpdateMode}
                    className="mt-4"
                >
                    Edit Schedule
                </Button>
            </div>
        );
    };

    // Render assign form
    const renderAssignForm = () => {
        return (
            <Form form={assignForm} layout="vertical">
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
                        {vehicles.map(vehicle => (
                            <Select.Option key={vehicle._id} value={vehicle._id}>
                                {vehicle.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        );
    };

    // Render update form
    const renderUpdateForm = () => {
        return (
            <Form form={updateForm} layout="vertical">
                <div className="mb-4">
                    <p className="text-base font-medium">
                        Updating schedule for:
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
                            <Select.Option key={driver.name} value={driver._id}>
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
                            <Select.Option key={vehicle._id} value={vehicle._id}>
                                {vehicle.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        );
    };

    // Render modal content based on mode
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

                {modalType === 'view' && renderViewContent()}
                {modalType === 'assign' && renderAssignForm()}
                {modalType === 'update' && renderUpdateForm()}
            </>
        );
    };

    // Modal footer buttons based on mode
    const renderModalFooter = () => {
        const buttons = [
            <Button key="close" onClick={handleModalClose}>
                Cancel
            </Button>
        ];

        if (modalType === 'assign') {
            buttons.push(
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleAssignDriver}
                    loading={loading}
                >
                    Assign
                </Button>
            );
        } else if (modalType === 'update') {
            buttons.push(
                <Button
                    key="update"
                    type="primary"
                    onClick={handleUpdateSchedule}
                    loading={loading}
                >
                    Update
                </Button>
            );
        }

        return buttons;
    };

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            <div className="">
                <div className="p-4 border-t mt-4">
                    <h4 className="font-medium mb-2">Trạng thái:</h4>
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <span className="w-4 h-4 bg-green-500 inline-block mr-2"></span>
                            <span>Kết thúc ca</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-4 h-4 bg-blue-500 inline-block mr-2"></span>
                            <span>Đang làm việc</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-4 h-4 bg-yellow-500 inline-block mr-2"></span>
                            <span>Chưa checkin</span>
                        </div>
                    </div>
                </div>
                <ScheduleCalendar
                    activities={activities}
                    onActivityClick={handleActivityClick}
                    onSlotClick={handleSlotClick}
                />

                <Modal
                    title={getModalTitle()}
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