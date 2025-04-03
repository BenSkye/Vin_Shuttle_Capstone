'use client';
import { useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Button, Form, Spin, notification, Modal } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Sidebar from '../common/Sidebar';
import { busStopService } from '../../services/busServices';
import MapView from './components/MapView';
import BusStopList from './components/BusStopList';
import BusStopForm from './components/BusStopForm';

// Import trực tiếp các hình ảnh từ node_modules
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const COLORS = [
    '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', 
    '#3498db', '#e67e22', '#1abc9c', '#34495e',
];

// Tạo icon cho điểm dừng bus
export const createBusStopIcon = ({ color }: { color: string }) => {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
            <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
        </svg>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

// Thiết lập icon mặc định cho Leaflet
const DefaultIcon = L.icon({
    iconUrl: icon.src,
    iconRetinaUrl: iconRetina.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Interface cho dữ liệu frontend
export interface BusStopData {
    id?: string; // Sử dụng cho điểm dừng mới (chưa có _id)
    _id?: string; // Sử dụng cho điểm dừng đã tồn tại
    name: string;
    description: string;
    address: string;
    position: L.LatLng;
    status: 'active' | 'inactive' | 'maintenance';
    color: string;
}

export const STATUS_OPTIONS = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
    { value: 'maintenance', label: 'Đang bảo trì' }
];

// Helper function lấy địa chỉ từ tọa độ
export const getAddressFromCoordinates = async (latlng: L.LatLng): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
        const data = await response.json();
        
        // Tách tên đường dựa trên dấu phẩy và lấy 2 phần tử đầu
        const addressParts = data.display_name ? data.display_name.split(',') : [];
        const address = addressParts.slice(0, 3).join(', '); // Kết hợp lại thành chuỗi
        
        return address || 'Không xác định';
    } catch (error) {
        console.error('Error getting address:', error);
        return 'Không xác định';
    }
};

export default function BusMap() {
    const [busStops, setBusStops] = useState<BusStopData[]>([]);
    const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBusStop, setSelectedBusStop] = useState<BusStopData | null>(null);
    const [isCreatingBusStop, setIsCreatingBusStop] = useState(false);
    const [currentBusStop, setCurrentBusStop] = useState<BusStopData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
    const [form] = Form.useForm();

    // Lấy tất cả các điểm dừng khi component được mount
    useEffect(() => {
        const fetchBusStops = async () => {
            try {
                setIsLoading(true);
                const stops = await busStopService.getAllBusStops();
                const stopsWithColor = stops.map((stop, index) => ({
                    ...stop,
                    position: L.latLng(stop.position.lat, stop.position.lng),
                    color: COLORS[index % COLORS.length],
                    status: stop.status || 'active',
                }));
                setBusStops(stopsWithColor);
            } catch (error) {
                notification.error({
                    message: 'Không thể tải điểm dừng',
                    description: 'Đã xảy ra lỗi khi tải danh sách điểm dừng xe bus.',
                });
                console.error('Error fetching bus stops:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchBusStops();
    }, []);

    // Xử lý click vào bản đồ để tạo điểm dừng mới
    const handleMapClick = useCallback(async (latlng: L.LatLng) => {
        if (!isCreatingBusStop) return;
        
        try {
            setIsLoading(true);
            const address = await getAddressFromCoordinates(latlng);
            
            const newBusStop: BusStopData = {
                id: `temp-${Date.now()}`, // ID tạm thời cho điểm dừng mới
                name: `Điểm dừng mới`,
                description: '',
                address,
                position: latlng,
                status: 'active',
                color: COLORS[busStops.length % COLORS.length],
            };
            
            setCurrentBusStop(newBusStop);
            form.setFieldsValue({
                name: newBusStop.name,
                description: '',
                status: 'active',
                address,
            });
            
        } catch (error) {
            console.error('Error creating new bus stop:', error);
        } finally {
            setIsLoading(false);
        }
    }, [busStops.length, form, isCreatingBusStop]);

    // Xử lý khi chọn một điểm dừng
    const handleSelectBusStop = useCallback((busStop: BusStopData) => {
        setSelectedBusStop(busStop);
        setIsCreatingBusStop(false);
        
        // Khi chọn điểm dừng, tự động chuyển sang chế độ chỉ xem điểm được chọn
        setViewMode('selected');
    }, []);

    // Xử lý sự kiện edit điểm dừng
    const handleEditBusStop = useCallback((busStop: BusStopData) => {
        setIsEditing(true);
        setCurrentBusStop(busStop);
        form.setFieldsValue({
            name: busStop.name,
            description: busStop.description,
            status: busStop.status,
            address: busStop.address,
        });
    }, [form]);

    // Xử lý lưu điểm dừng
    const handleSaveBusStop = useCallback(async (values: any) => {
        if (!currentBusStop) return;
        
        try {
            setIsLoading(true);
            
            const busStopData = {
                name: values.name,
                description: values.description,
                status: values.status,
                address: values.address,
                position: {
                    lat: currentBusStop.position.lat,
                    lng: currentBusStop.position.lng,
                },
            };
            
            // Nếu đang chỉnh sửa điểm dừng hiện có
            if (isEditing && currentBusStop._id) {
                const updatedBusStop = await busStopService.updateBusStop(currentBusStop._id, busStopData);
                
                // Cập nhật state
                setBusStops(prev => prev.map(stop => 
                    stop._id === currentBusStop._id 
                        ? { ...updatedBusStop, color: currentBusStop.color, position: L.latLng(updatedBusStop.position.lat, updatedBusStop.position.lng) } 
                        : stop
                ));
                
                notification.success({
                    message: 'Cập nhật thành công',
                    description: `Điểm dừng "${values.name}" đã được cập nhật.`,
                });
            } 
            // Nếu đang tạo điểm dừng mới
            else {
                const newBusStop = await busStopService.createBusStop(busStopData as any);
                const newBusStopWithColor = {
                    ...newBusStop,
                    color: currentBusStop.color,
                    position: L.latLng(newBusStop.position.lat, newBusStop.position.lng),
                };
                
                setBusStops(prev => [...prev, newBusStopWithColor]);
                
                notification.success({
                    message: 'Tạo thành công',
                    description: `Điểm dừng "${values.name}" đã được tạo.`,
                });
            }
            
            // Reset form và state
            setCurrentBusStop(null);
            setIsEditing(false);
            setIsCreatingBusStop(false);
            form.resetFields();
            
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: `Không thể ${isEditing ? 'cập nhật' : 'tạo'} điểm dừng. Vui lòng thử lại.`,
            });
            console.error('Error saving bus stop:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentBusStop, isEditing, form]);

    // Xử lý xóa điểm dừng
    const handleDeleteBusStop = useCallback(async (busStop: BusStopData) => {
        if (!busStop._id) return;
        
        try {
            setIsLoading(true);
            await busStopService.deleteBusStop(busStop._id);
            
            setBusStops(prev => prev.filter(stop => stop._id !== busStop._id));
            
            if (selectedBusStop && selectedBusStop._id === busStop._id) {
                setSelectedBusStop(null);
            }
            
            notification.success({
                message: 'Xóa thành công',
                description: `Điểm dừng "${busStop.name}" đã được xóa.`,
            });
            
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể xóa điểm dừng. Vui lòng thử lại.',
            });
            console.error('Error deleting bus stop:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusStop]);

    // Xử lý xác nhận trước khi lưu
    const handleConfirmSave = useCallback((values: any) => {
        Modal.confirm({
            title: isEditing ? 'Xác nhận cập nhật' : 'Xác nhận tạo điểm dừng',
            content: isEditing 
                ? `Bạn có chắc chắn muốn cập nhật điểm dừng "${values.name}" không?`
                : `Bạn có chắc chắn muốn tạo điểm dừng "${values.name}" không?`,
            onOk: () => handleSaveBusStop(values),
            okText: 'Xác nhận',
            cancelText: 'Hủy',
        });
    }, [handleSaveBusStop, isEditing]);

    // Xử lý đổi chế độ xem
    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'all' ? 'selected' : 'all');
    }, []);

    return (
        <div className="h-screen flex">
            <Sidebar />
            <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">
                        {isCreatingBusStop ? 'Tạo điểm dừng mới' : 'Quản lý điểm dừng xe bus'}
                    </h2>
                    <Button
                        type={isCreatingBusStop ? "default" : "primary"}
                        onClick={() => {
                            setIsCreatingBusStop(!isCreatingBusStop);
                            setCurrentBusStop(null);
                            setSelectedBusStop(null);
                            setIsEditing(false);
                            setViewMode('all');
                            form.resetFields();
                        }}
                        icon={isCreatingBusStop ? <ArrowLeftOutlined /> : <PlusOutlined />}
                    >
                        {isCreatingBusStop ? 'Quay lại danh sách' : 'Tạo điểm dừng'}
                    </Button>
                </div>

                {/* Thêm nút chuyển đổi chế độ xem */}
                {!isCreatingBusStop && !isEditing && selectedBusStop && (
                    <div className="mb-4">
                        <Button 
                            type="default" 
                            block 
                            onClick={toggleViewMode}
                        >
                            {viewMode === 'selected' 
                                ? 'Hiển thị tất cả điểm dừng' 
                                : 'Chỉ hiển thị điểm dừng đã chọn'}
                        </Button>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center my-4">
                        <Spin tip="Đang xử lý..." />
                    </div>
                )}

                {/* Form hoặc Danh sách */}
                {isCreatingBusStop || isEditing ? (
                    <BusStopForm
                        form={form}
                        isEditing={isEditing}
                        isLoading={isLoading}
                        onFinish={handleConfirmSave}
                        currentBusStop={currentBusStop}
                    />
                ) : (
                    <BusStopList
                        busStops={busStops}
                        selectedBusStop={selectedBusStop}
                        isLoading={isLoading}
                        onSelectBusStop={handleSelectBusStop}
                        onEditBusStop={handleEditBusStop}
                        onDeleteBusStop={(busStop) => {
                            Modal.confirm({
                                title: 'Xác nhận xóa',
                                content: `Bạn có chắc chắn muốn xóa điểm dừng "${busStop.name}" không?`,
                                okText: 'Xóa',
                                okType: 'danger',
                                cancelText: 'Hủy',
                                onOk: () => handleDeleteBusStop(busStop)
                            });
                        }}
                    />
                )}
            </div>
            
            <div className="flex-grow">
                <MapView
                    mapCenter={mapCenter}
                    busStops={busStops}
                    selectedBusStop={selectedBusStop}
                    currentBusStop={currentBusStop}
                    isCreatingBusStop={isCreatingBusStop}
                    createBusStopIcon={createBusStopIcon}
                    onMapClick={handleMapClick}
                    onSelectBusStop={handleSelectBusStop}
                    viewMode={viewMode}
                />
            </div>
        </div>
    );
}