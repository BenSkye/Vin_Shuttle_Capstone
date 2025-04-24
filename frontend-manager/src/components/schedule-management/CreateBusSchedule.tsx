import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select as AntSelect } from 'antd';
import { createBusSchedule } from '@/services/api/busSchedules';
import { getAvailableDrivers } from '@/services/api/driver';
import { getAvailableVehicles } from '@/services/api/vehicles';
import { BusRoute, getActiveBusRoutes } from '@/services/api/busRoutes';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Clock, Calendar, Bus, User, MapPin, Car } from 'lucide-react';

interface CreateBusScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Driver {
    _id: string;
    name: string;
}

interface Vehicle {
    _id: string;
    name: string;
}

interface FormData {
    busRoute: string;
    vehicles: string[];
    drivers: string[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate: string;
    status: 'active' | 'inactive';
    driverAssignments: {
        driverId: string;
        vehicleId: string;
        startTime: string;
        endTime: string;
    }[];
}


const { Option } = AntSelect;

export const CreateBusSchedule = ({ isOpen, onClose, onSuccess }: CreateBusScheduleProps) => {
    const [formData, setFormData] = useState<FormData>({
        busRoute: '',
        vehicles: [],
        drivers: [],
        tripsPerDay: 12,
        dailyStartTime: '06:00',
        dailyEndTime: '22:00',
        effectiveDate: format(new Date(), 'yyyy-MM-dd'),
        expiryDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        status: 'active',
        driverAssignments: []
    });

    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const date = format(new Date(formData.effectiveDate), 'yyyy-MM-dd');
                const [routesData, driversData, vehiclesData] = await Promise.all([
                    getActiveBusRoutes(),
                    getAvailableDrivers(date),
                    getAvailableVehicles(date)
                ]);
                setBusRoutes(routesData || []);
                setAvailableDrivers(driversData || []);
                setAvailableVehicles(vehiclesData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Lỗi khi tải dữ liệu');
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, formData.effectiveDate]);

    const handleInputChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
        console.log(`Updating ${field}:`, value);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRouteChange = (value: string) => {
        console.log('Route selection changed:', value);
        setFormData(prev => ({
            ...prev,
            busRoute: value
        }));
    };

    const handleVehicleChange = (value: string[]) => {
        console.log('Vehicle selection changed:', value);
        setFormData(prev => ({
            ...prev,
            vehicles: value
        }));
    };

    const handleDriverChange = (value: string[]) => {
        console.log('Driver selection changed:', value);
        setFormData(prev => ({
            ...prev,
            drivers: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const driverAssignments = formData.drivers.map((driverId, index) => ({
                driverId,
                vehicleId: formData.vehicles[index % formData.vehicles.length],
                startTime: new Date(formData.effectiveDate + 'T' + formData.dailyStartTime).toISOString(),
                endTime: new Date(formData.effectiveDate + 'T' + formData.dailyEndTime).toISOString()
            }));

            await createBusSchedule({
                ...formData,
                driverAssignments
            });

            toast.success('Tạo lịch trình xe bus thành công');
            onClose();
            onSuccess();
        } catch (error) {
            console.error('Error creating bus schedule:', error);
            toast.error('Lỗi khi tạo lịch trình xe bus');
        } finally {
            setLoading(false);
        }
    };

    const multiSelectProps = {
        mode: "multiple" as const,
        style: { width: '100%' },
        showSearch: true,
        optionFilterProp: "children",
        notFoundContent: null,
        maxTagCount: 3,
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        getPopupContainer: (trigger: HTMLElement) => trigger.parentNode as HTMLElement
    };

    const singleSelectProps = {
        style: { width: '100%' },
        showSearch: true,
        optionFilterProp: "children",
        notFoundContent: null,
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        getPopupContainer: (trigger: HTMLElement) => trigger.parentNode as HTMLElement
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[600px] p-0">
                <DialogHeader className="p-6 pb-4 bg-gray-50 dark:bg-gray-900">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bus className="w-5 h-5" />
                        Tạo lịch trình xe bus mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Route Selection */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Tuyến xe
                                    </Label>
                                    <AntSelect
                                        {...singleSelectProps}
                                        placeholder="Chọn tuyến xe"
                                        value={formData.busRoute}
                                        onChange={handleRouteChange}
                                    >
                                        {busRoutes.map((route) => (
                                            <Option key={route._id} value={route._id}>
                                                {route.name}
                                            </Option>
                                        ))}
                                    </AntSelect>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Số chuyến mỗi ngày
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.tripsPerDay}
                                        onChange={(e) => handleInputChange('tripsPerDay', parseInt(e.target.value))}
                                        min={1}
                                        className="bg-white dark:bg-gray-700 border-gray-200 h-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operating Time */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Thời gian hoạt động
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Giờ bắt đầu
                                    </Label>
                                    <Input
                                        type="time"
                                        value={formData.dailyStartTime}
                                        onChange={(e) => handleInputChange('dailyStartTime', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Giờ kết thúc
                                    </Label>
                                    <Input
                                        type="time"
                                        value={formData.dailyEndTime}
                                        onChange={(e) => handleInputChange('dailyEndTime', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule Period */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Thời gian áp dụng
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Ngày bắt đầu
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Ngày kết thúc
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border-gray-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignments */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Phân công
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Car className="w-4 h-4" />
                                        Xe
                                    </Label>
                                    <AntSelect
                                        {...multiSelectProps}
                                        placeholder="Chọn xe"
                                        value={formData.vehicles}
                                        onChange={handleVehicleChange}
                                    >
                                        {availableVehicles.map((vehicle) => (
                                            <Option key={vehicle._id} value={vehicle._id}>
                                                {vehicle.name}
                                            </Option>
                                        ))}
                                    </AntSelect>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Tài xế
                                    </Label>
                                    <AntSelect
                                        {...multiSelectProps}
                                        placeholder="Chọn tài xế"
                                        value={formData.drivers}
                                        onChange={handleDriverChange}
                                    >
                                        {availableDrivers.map((driver) => (
                                            <Option key={driver._id} value={driver._id}>
                                                {driver.name}
                                            </Option>
                                        ))}
                                    </AntSelect>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-black hover:bg-primary/90"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo lịch trình'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 