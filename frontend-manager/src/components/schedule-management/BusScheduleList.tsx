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
import { CreateBusSchedule } from './CreateBusSchedule';
import {
    BusSchedule,
    getActiveScheduleByRoute,
    deleteBusSchedule,
    generateTrips
} from '@/services/api/busSchedules';
import { BusRoute, getActiveBusRoutes } from '@/services/api/busRoutes';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bus, Calendar, Clock, User, Car } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AxiosError } from 'axios';

export const BusScheduleList = () => {
    const [schedules, setSchedules] = useState<BusSchedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [routes, setRoutes] = useState<BusRoute[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    useEffect(() => {
        if (selectedRoute) {
            fetchSchedules();
        }
    }, [selectedRoute]);

    const fetchRoutes = async () => {
        try {
            const routesData = await getActiveBusRoutes();
            setRoutes(routesData);
            if (routesData.length > 0) {
                setSelectedRoute(routesData[0]._id);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
            toast.error('Không thể tải danh sách tuyến xe');
        }
    };

    const fetchSchedules = async () => {
        if (!selectedRoute) return;

        setIsLoading(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const data = await getActiveScheduleByRoute(selectedRoute, today);
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            if (error instanceof AxiosError && error.response?.status === 404) {
                setSchedules([]);
            } else {
                toast.error('Không thể tải danh sách lịch trình');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBusSchedule(id);
            toast.success('Xóa lịch trình thành công');
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error('Không thể xóa lịch trình');
        }
    };

    const handleGenerateTrips = async (id: string) => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            await generateTrips(id, today);
            toast.success('Tạo chuyến xe thành công');
            fetchSchedules();
        } catch (error) {
            console.error('Error generating trips:', error);
            toast.error('Không thể tạo chuyến xe');
        }
    };

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), 'HH:mm');
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
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý lịch trình xe bus</h2>
                    <div className="w-[400px]">
                        <Select
                            value={selectedRoute}
                            onValueChange={setSelectedRoute}
                        >
                            <SelectTrigger className="w-full bg-white border-2 border-gray-200 h-12 text-base font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                <SelectValue placeholder="Chọn tuyến xe" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-100 shadow-lg rounded-lg">
                                <div className="max-h-[300px] overflow-auto">
                                    {routes.map((route) => (
                                        <SelectItem
                                            key={route._id}
                                            value={route._id}
                                            className="py-3 px-4 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bus className="h-5 w-5 text-primary" />
                                                <span className="font-medium">{route.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-black hover:bg-primary/90"
                >
                    <Bus className="w-4 h-4 mr-2" />
                    Thêm lịch trình mới
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
                    <Bus className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-xl font-medium text-gray-600">Chưa có lịch trình nào cho tuyến này</p>
                    <p className="text-sm text-gray-500 mt-2">Hãy thêm lịch trình mới bằng cách nhấn nút &quot;Thêm lịch trình mới&quot;</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Accordion type="single" collapsible>
                        {schedules.map((schedule) => (
                            <AccordionItem key={schedule._id} value={schedule._id}>
                                <div className="flex items-center">
                                    <AccordionTrigger className="flex-1 px-4 hover:bg-gray-50">
                                        <div className="grid grid-cols-6 w-full gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Bus className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{schedule.busRoute.name}</span>
                                            </div>
                                            <div className="text-center">{schedule.tripsPerDay} chuyến</div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span>{schedule.dailyStartTime} - {schedule.dailyEndTime}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span>
                                                    {format(new Date(schedule.effectiveDate), 'dd/MM/yyyy')}
                                                    {schedule.expiryDate && ` - ${format(new Date(schedule.expiryDate), 'dd/MM/yyyy')}`}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span>{schedule.drivers.length} tài xế</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Car className="w-4 h-4 text-gray-500" />
                                                    <span>{schedule.vehicles.length} xe</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Badge variant={schedule.status === 'active' ? 'success' : 'secondary'}>
                                                    {schedule.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex items-center space-x-2 px-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedSchedule(schedule);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGenerateTrips(schedule._id)}
                                        >
                                            Tạo chuyến
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(schedule._id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent>
                                    <div className="px-4 py-3 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-gray-900">Thông tin tuyến xe</h4>
                                                <p className="text-sm text-gray-600">{schedule.busRoute.description}</p>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Điểm dừng:</span>{' '}
                                                        {schedule.busRoute.stops.length} trạm
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-gray-900">Phân công tài xế</h4>
                                                {schedule.driverAssignments.map((assignment, index) => (
                                                    <div key={index} className="text-sm text-gray-600 space-y-1">
                                                        <p>
                                                            <span className="font-medium">Ca làm việc {index + 1}:</span>{' '}
                                                            {format(new Date(assignment.startTime), 'HH:mm')} -{' '}
                                                            {format(new Date(assignment.endTime), 'HH:mm')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Danh sách chuyến xe trong ngày</h4>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>STT</TableHead>
                                                            <TableHead>Giờ xuất phát</TableHead>
                                                            <TableHead>Giờ kết thúc</TableHead>
                                                            <TableHead>Thời gian di chuyển</TableHead>
                                                            <TableHead>Trạng thái</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {schedule.dailyTrips?.map((trip, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell>{formatTime(trip.startTime)}</TableCell>
                                                                <TableCell>{formatTime(trip.endTime)}</TableCell>
                                                                <TableCell>{trip.estimatedDuration} phút</TableCell>
                                                                <TableCell>
                                                                    <Badge variant={trip.status === 'active' ? 'success' : 'secondary'}>
                                                                        {trip.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {isCreateModalOpen && (
                <CreateBusSchedule
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchSchedules();
                    }}
                />
            )}

            {isEditModalOpen && selectedSchedule && (
                <EditBusSchedule
                    schedule={selectedSchedule}
                    onSave={async () => {
                        setIsEditModalOpen(false);
                        await fetchSchedules();
                    }}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}; 