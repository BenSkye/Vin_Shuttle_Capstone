'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusSchedule } from '@/services/api/busSchedules';
import { BusRoute, getBusRoutes } from '@/services/api/busRoutes';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditBusScheduleProps {
    schedule: BusSchedule;
    onSave: (schedule: BusSchedule) => void;
    onClose: () => void;
}

export const EditBusSchedule = ({ schedule, onSave, onClose }: EditBusScheduleProps) => {
    const [formData, setFormData] = useState<BusSchedule>(schedule);
    const [isLoading, setIsLoading] = useState(false);
    const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);

    useEffect(() => {
        const fetchBusRoutes = async () => {
            try {
                const routes = await getBusRoutes();
                setBusRoutes(routes || []);
            } catch (error) {
                console.error('Error fetching bus routes:', error);
            }
        };

        fetchBusRoutes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error updating bus schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof BusSchedule, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {schedule._id ? 'Chỉnh sửa lịch trình xe bus' : 'Thêm lịch trình xe bus mới'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="busRoute" className="text-sm font-medium text-gray-900">
                                Tuyến xe bus
                            </Label>
                            <Select
                                value={formData.busRoute._id}
                                onValueChange={(value) => handleChange('busRoute', value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <SelectValue placeholder="Chọn tuyến xe bus" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                                    <ScrollArea className="h-[200px] w-full">
                                        {busRoutes.map((route) => (
                                            <SelectItem
                                                key={route._id}
                                                value={route._id}
                                                className="py-2.5 px-4 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {route.name}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tripsPerDay" className="text-sm font-medium text-gray-900">
                                Số chuyến xe mỗi ngày
                            </Label>
                            <Input
                                id="tripsPerDay"
                                type="number"
                                value={formData.tripsPerDay}
                                onChange={(e) => handleChange('tripsPerDay', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dailyStartTime" className="text-sm font-medium text-gray-900">
                                Giờ bắt đầu
                            </Label>
                            <Input
                                id="dailyStartTime"
                                type="time"
                                value={formData.dailyStartTime}
                                onChange={(e) => handleChange('dailyStartTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dailyEndTime" className="text-sm font-medium text-gray-900">
                                Giờ kết thúc
                            </Label>
                            <Input
                                id="dailyEndTime"
                                type="time"
                                value={formData.dailyEndTime}
                                onChange={(e) => handleChange('dailyEndTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="effectiveDate" className="text-sm font-medium text-gray-900">
                                Ngày hiệu lực
                            </Label>
                            <Input
                                id="effectiveDate"
                                type="date"
                                value={formData.effectiveDate}
                                onChange={(e) => handleChange('effectiveDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-900">
                                Ngày hết hạn
                            </Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => handleChange('expiryDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-900">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'active' | 'inactive') => handleChange('status', value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                                    <SelectItem value="active" className="py-2.5 px-4 hover:bg-gray-100 cursor-pointer">
                                        Hoạt động
                                    </SelectItem>
                                    <SelectItem value="inactive" className="py-2.5 px-4 hover:bg-gray-100 cursor-pointer">
                                        Không hoạt động
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 