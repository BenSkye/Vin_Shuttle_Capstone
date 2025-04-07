'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { Modal, Form, Button, Select, message, Alert, } from 'antd';
import { Activity } from '@/interfaces/index';
import EventCalendar from '@/components/EventCalendar';
import Announcements from '@/components/Announcements';

import { Driver } from '@/interfaces/index';
import { getDriverSchedule, getAvailableDrivers } from '@/services/api/driver';
import { DriverSchedule, updateDriverSchedule } from '@/services/api/schedule';
import { format, isBefore, startOfDay } from 'date-fns';

import { Vehicle } from '@/interfaces/index';
import { getAvailableVehicles } from '../../../services/api/vehicles';

// Định nghĩa các loại modal để rõ ràng
type ModalType = 'view' | 'assign' | 'update' | 'none';

const SchedulePage = () => {
    // Định nghĩa state
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
    const [isAssigningWeekly, setIsAssigningWeekly] = useState(false);


    // Form riêng biệt cho thao tác gán và cập nhật
    const [assignForm] = Form.useForm();
    const [updateForm] = Form.useForm();


    // Bảng ánh xạ thời gian ca làm
    const shiftTimeRanges = {
        'A': '06:00 - 14:00',
        'B': '10:00 - 18:00',
        'C': '12:00 - 20:00',
        'D': '15:00 - 23:00',
    };

    // Bảng ánh xạ tên ngày
    const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    // Add ref for ScheduleCalendar
    const calendarRef = React.useRef<{ getCurrentWeek: () => Date }>(null);

    // Check if a date is in the past
    const isDateInPast = (date: Date | string) => {
        const today = startOfDay(new Date());
        const dateToCheck = typeof date === 'string' ? new Date(date) : date;
        return isBefore(dateToCheck, today);
    };

    // Tải dữ liệu ban đầu
    useEffect(() => {
        fetchDriverSchedules();
    }, []);

    const fetchVehicles = async (date: string) => {
        try {
            setError(null);
            setLoading(true);
            console.log("Đang tải xe cho ngày:", date);
            const response = await getAvailableVehicles(date);
            console.log("Xe khả dụng:", response);
            setVehicles(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách xe";
            console.error("Lỗi khi tải xe:", error);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách tài xế khả dụng
    const fetchDrivers = async (date: string) => {
        try {
            setError(null);
            setLoading(true);
            console.log("Đang tải tài xế cho ngày:", date);
            const response = await getAvailableDrivers(date);
            console.log("Tài xế khả dụng:", response);
            setDrivers(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách tài xế";
            console.error("Lỗi khi tải tài xế:", error);
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
                const errorMessage = "Định dạng phản hồi không hợp lệ cho lịch trình";
                console.error(errorMessage, response);
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            const formattedActivities = response.map((schedule) => {
                // Xử lý ngày và chuyển đổi thành đối tượng Date
                const scheduleDate = new Date(schedule.date);

                // Lấy ngày trong tuần từ ngày của lịch trình (0 = Chủ Nhật, 1 = Thứ Hai, v.v.)
                // Chuyển đổi sang hệ thống chỉ mục ngày của chúng ta (0 = Thứ Hai, 6 = Chủ Nhật)
                const dayOfWeek = scheduleDate.getDay();
                const day = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                return {
                    id: schedule._id,
                    driverId: schedule.driver?._id || "ID Tài Xế Không Xác Định",
                    driverName: schedule.driver?.name || "Tài Xế Không Xác Định",
                    title: schedule.driver?.name || "Tài Xế Không Xác Định",
                    name: schedule.driver?.name || "Tài Xế Không Xác Định", // Thêm thuộc tính 'name'
                    description: `Xe: ${schedule.vehicle?.name || "N/A"}`,
                    startTime: schedule.shift,
                    endTime: schedule.shift,
                    day: day,
                    color: getStatusColor(schedule.status),
                    date: scheduleDate.toISOString().split('T')[0],
                    // Lưu trữ đối tượng ngày gốc để giúp tính toán tuần
                    originalDate: scheduleDate,
                    vehicleId: schedule.vehicle?._id,
                    vehicleName: schedule.vehicle?.name || "Xe Không Xác Định"
                };
            });

            setActivities(formattedActivities);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể tải lịch trình tài xế";
            console.error("Lỗi khi tải lịch trình tài xế:", error);
            setError(errorMessage);
            message.error(errorMessage);
        }
    };

    // Lấy màu dựa trên trạng thái
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

    // Xử lý sự kiện
    const handleActivityClick = (activity: Activity) => {
        setError(null);

        // Check if the activity date is in the past
        if (activity.date && isDateInPast(activity.date)) {
            message.warning("Không thể chỉnh sửa lịch trình trong quá khứ");
            setModalType('view');
            setSelectedActivity(activity);
            setIsModalOpen(true);
            return;
        }

        setSelectedActivity(activity);
        setModalType('update'); // Đặt loại modal thành 'update'
        setIsModalOpen(true);

        // Nếu hoạt động có ID tài xế và xe, chuẩn bị cho các cập nhật tiềm năng
        if (activity.driverId) {
            // Đặt thời gian và ngày ngay lập tức
            setSelectedTime(activity.startTime);
            setSelectedDay(activity.day);
            if (activity.date) {
                setSelectedDate(activity.date);

                // Tải cả hai loại dữ liệu, sau đó đặt giá trị form một lần
                Promise.all([
                    fetchVehicles(activity.date),
                    fetchDrivers(activity.date)
                ]).then(() => {
                    const selectedDriver = drivers.find(d => d._id === activity.driverId);
                    const selectedVehicle = vehicles.find(v => v._id === activity.vehicleId);

                    // Sau khi cả hai loại dữ liệu được tải, đặt giá trị form
                    updateForm.setFieldsValue({
                        driverId: {
                            value: activity.driverId,
                            label: selectedDriver?.name || activity.driverName
                        },
                        vehicleId: {
                            value: activity.vehicleId,
                            label: selectedVehicle?.name || activity.vehicleName
                        }
                    });
                });
            }
        }
    };

    const handleSlotClick = (time: string, day: number, date: Date) => {
        setError(null);

        // Check if the date is in the past
        if (isDateInPast(date)) {
            message.warning("Không thể thêm lịch trình cho ngày trong quá khứ");
            return;
        }

        setSelectedTime(time);
        setSelectedDay(day);
        setSelectedActivity(null);
        setModalType('assign');

        // Sử dụng ngày chính xác từ ô lịch
        const formattedDate = format(date, 'yyyy-MM-dd');

        console.log("Ngày ô đã chọn:", formattedDate, "Ngày:", day, "Thời gian:", time);

        // Tải xe khả dụng cho ngày đã chọn
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
                const errorMessage = "Lỗi tính toán ngày";
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            // Check if the date is in the past
            if (isDateInPast(selectedDate)) {
                const errorMessage = "Không thể thêm lịch trình cho ngày trong quá khứ";
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            const scheduleData = {
                driver: values.driverId.value,
                vehicle: values.vehicleId.value,
                date: selectedDate,
                shift: selectedTime
            };

            await DriverSchedule(scheduleData);
            message.success("Đã lên lịch tài xế thành công");
            setIsModalOpen(false);
            fetchDriverSchedules();
        } catch (error: unknown) {
            let errorMessage = "Đã xảy ra lỗi không mong muốn";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (typeof error === "object" && error !== null && "response" in error) {
                const err = error as { response?: { data?: { vnMessage?: string } } };
                errorMessage = err.response?.data?.vnMessage || errorMessage;
            }

            console.error("Lỗi khi gán tài xế:", errorMessage);
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

            // Check if the date is in the past
            if (isDateInPast(selectedDate)) {
                const errorMessage = "Không thể cập nhật lịch trình cho ngày trong quá khứ";
                setError(errorMessage);
                message.error(errorMessage);
                return;
            }

            const values = await updateForm.validateFields();

            await updateDriverSchedule(
                selectedActivity.id,
                values.driverId.value,
                selectedDate,
                selectedTime,
                values.vehicleId.value
            );

            message.success("Cập nhật lịch trình thành công");
            setIsModalOpen(false);
            fetchDriverSchedules();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật lịch trình";
            console.error("Lỗi khi cập nhật lịch trình:", error);
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
        // Check if the date is in the past
        if (selectedDate && isDateInPast(selectedDate)) {
            message.warning("Không thể chỉnh sửa lịch trình trong quá khứ");
            return;
        }

        setModalType('update');
    };

    // Tiêu đề modal dựa trên chế độ hiện tại
    const getModalTitle = () => {
        switch (modalType) {
            case 'view':
                return "Chi Tiết Lịch Trình Tài Xế";
            case 'assign':
                return "Phân Công Tài Xế";
            case 'update':
                return "Cập Nhật Lịch Trình";
            default:
                return "Lịch Trình";
        }
    };

    // Hiển thị nội dung chế độ xem
    const renderViewContent = () => {
        if (!selectedActivity) return null;

        return (
            <div>
                <p><strong>Tài xế:</strong> {selectedActivity.title}</p>
                <p><strong>Mô tả:</strong> {selectedActivity.description}</p>
                <p>
                    <strong>Ca:</strong> {selectedActivity.endTime}
                    ({shiftTimeRanges[selectedActivity.endTime as keyof typeof shiftTimeRanges] || ''})
                </p>
                {selectedActivity.date && !isDateInPast(selectedActivity.date) && (
                    <Button
                        type="primary"
                        onClick={switchToUpdateMode}
                        className="mt-4"
                    >
                        Chỉnh Sửa Lịch Trình
                    </Button>
                )}
                {selectedActivity.date && isDateInPast(selectedActivity.date) && (
                    <Alert
                        message="Không thể chỉnh sửa"
                        description="Lịch trình trong quá khứ không thể được chỉnh sửa"
                        type="warning"
                        showIcon
                        className="mt-4"
                    />
                )}
            </div>
        );
    };

    // Hiển thị form cập nhật
    const renderUpdateForm = () => {
        return (
            <Form form={updateForm} layout="vertical">
                <div className="mb-4">
                    <p className="text-base font-medium">
                        Cập nhật lịch trình cho:
                        <span className="font-bold ml-1">
                            {dayNames[selectedDay]} - Ca {selectedTime}
                            ({shiftTimeRanges[selectedTime as keyof typeof shiftTimeRanges] || ''})
                        </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ngày: {selectedDate}</p>
                </div>

                <Form.Item
                    name="driverId"
                    label="Chọn Tài Xế"
                    rules={[{ required: true, message: 'Vui lòng chọn tài xế' }]}
                >
                    <Select
                        placeholder="Chọn tài xế"
                        showSearch
                        labelInValue
                        optionFilterProp="label"
                        options={drivers.map(driver => ({
                            value: driver._id,
                            label: driver.name
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="vehicleId"
                    label="Chọn Xe"
                    rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
                >
                    <Select
                        placeholder="Chọn xe"
                        labelInValue
                        options={vehicles.map(vehicle => ({
                            value: vehicle._id,
                            label: vehicle.name
                        }))}
                    />
                </Form.Item>
            </Form>
        );
    };
    //yessir

    // Hiển thị form gán
    const renderAssignForm = () => {
        return (
            <Form form={assignForm} layout="vertical">
                <div className="mb-4">
                    <p className="text-base font-medium">
                        Phân công tài xế cho:
                        <span className="font-bold ml-1">
                            {dayNames[selectedDay]} - Ca {selectedTime}
                            ({shiftTimeRanges[selectedTime as keyof typeof shiftTimeRanges] || ''})
                        </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ngày: {selectedDate}</p>
                </div>

                <Form.Item
                    name="driverId"
                    label="Chọn Tài Xế"
                    rules={[{ required: true, message: 'Vui lòng chọn tài xế' }]}
                >
                    <Select
                        placeholder="Chọn tài xế"
                        showSearch
                        labelInValue
                        optionFilterProp="label"
                        options={drivers.map(driver => ({
                            value: driver._id,
                            label: driver.name
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="vehicleId"
                    label="Chọn Xe"
                    rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
                >
                    <Select
                        placeholder="Chọn xe"
                        labelInValue
                        options={vehicles.map(vehicle => ({
                            value: vehicle._id,
                            label: vehicle.name
                        }))}
                    />
                </Form.Item>
            </Form>
        );
    };

    // Hiển thị nội dung modal dựa trên chế độ
    const renderModalContent = () => {
        return (
            <>
                {error && (
                    <Alert
                        message="Lỗi"
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

    // Các nút chân trang modal dựa trên chế độ
    const renderModalFooter = () => {
        const buttons = [
            <Button key="close" onClick={handleModalClose}>
                Hủy
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
                    Phân Công
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
                    Cập Nhật
                </Button>
            );
        }

        return buttons;
    };

    // Modify handleAssignWeekly to use current week
    const handleAssignWeekly = async () => {
        try {
            setError(null);
            setLoading(true);
            setIsAssigningWeekly(true);

            // Get current week from calendar
            const currentWeek = calendarRef.current?.getCurrentWeek();
            if (!currentWeek) {
                throw new Error("Không thể lấy thông tin tuần hiện tại");
            }

            // Format the start date of the current week
            const baseDate = format(currentWeek, 'yyyy-MM-dd');

            // Get all available drivers and vehicles for the week
            const allDrivers = await getAvailableDrivers(baseDate);
            const allVehicles = await getAvailableVehicles(baseDate);

            if (!allDrivers.length || !allVehicles.length) {
                throw new Error("Không đủ tài xế hoặc xe để phân công cho tuần");
            }

            // Create arrays for rotation
            const driverPool = [...allDrivers];
            const vehiclePool = [...allVehicles];
            let driverIndex = 0;
            let vehicleIndex = 0;

            // Get current week's dates
            const weekDates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(currentWeek);
                date.setDate(currentWeek.getDate() + i);
                return format(date, 'yyyy-MM-dd');
            });

            // Define shifts
            const shifts = ['A', 'B', 'C', 'D'];

            // Create assignments for each day and shift
            for (const date of weekDates) {
                // Skip past dates
                if (isDateInPast(date)) {
                    continue;
                }

                for (const shift of shifts) {
                    // Get next driver and vehicle from pools
                    const driver = driverPool[driverIndex % driverPool.length];
                    const vehicle = vehiclePool[vehicleIndex % vehiclePool.length];

                    // Create schedule data
                    const scheduleData = {
                        driver: driver._id,
                        vehicle: vehicle._id,
                        date: date,
                        shift: shift
                    };
                    //yessir

                    // Assign the schedule
                    await DriverSchedule(scheduleData);

                    // Move to next driver and vehicle
                    driverIndex++;
                    vehicleIndex++;
                }
            }

            message.success("Đã phân công lịch trình cho tuần thành công");
            fetchDriverSchedules(); // Refresh the schedule display
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể phân công lịch trình cho tuần";
            console.error("Lỗi khi phân công lịch trình tuần:", error);
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
            setIsAssigningWeekly(false);
        }
    };

    // Remove the week selection modal and its related code
    const showWeekSelectModal = () => {
        handleAssignWeekly();
    };

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            <div className="">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Lịch Trình Tài Xế</h2>
                    <Button
                        type="primary"
                        onClick={showWeekSelectModal}
                        loading={isAssigningWeekly}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Phân Công Lịch Trình Tuần
                    </Button>
                </div>
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
                        <div className='flex items-center'>
                            <span className="w-4 h-4 bg-gray-500 inline-block mr-2"></span>
                            <span>Không đi làm</span>

                        </div>
                    </div>
                </div>
                <ScheduleCalendar
                    ref={calendarRef}
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

            </div>
        </div>
    );
};

export default SchedulePage;