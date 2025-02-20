'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Descriptions, App, Image, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Sidebar from '../../../_components/common/Sidebar';
import { vehiclesService } from '../../../services/vehiclesServices';
import { categoryService } from '../../../services/categoryServices';
import placehoderImg from '../../../assets/place.jpeg';

const { Header, Content } = Layout;

interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string[] | string;
  createdAt: string;
  updatedAt: string;
}

// Map trạng thái xe
const statusMap: { [key: string]: string } = {
  available: 'Sẵn sàng',
  busy: 'Đang bận',
  maintenance: 'Bảo trì',
};

export default function VehicleDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [category, setCategory] = useState<string>('N/A');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { message } = App.useApp();

  // Sử dụng useCallback để tránh re-create hàm
  const fetchVehicleDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vehiclesService.getVehicleById(id);
      setVehicle(data);

      // Fetch danh mục nếu có
      if (data.categoryId) {
        const categories = await categoryService.getCategories();
        const vehicleCategory = categories.find((cat) => cat._id === data.categoryId);
        setCategory(vehicleCategory?.name || 'N/A');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      message.error('Không thể tải thông tin phương tiện');
    } finally {
      setLoading(false);
    }
  }, [id, message]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleBack = () => {
    router.push('/vehicles');
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <Spin size="large" />
          </div>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4 flex items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4">
            Quay lại
          </Button>
          <h2 className="text-xl font-semibold">Chi tiết phương tiện</h2>
        </Header>
        <Content className="m-6 p-6 bg-white">
          {vehicle && (
            <div className="space-y-6">
              <div className="mb-6">
                {Array.isArray(vehicle.image) ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Image.PreviewGroup>
                      {vehicle.image.map((imageUrl, index) => (
                        <div key={index} className="aspect-square">
                          <Image
                            src={imageUrl}
                            alt={`${vehicle.name} - Image ${index + 1}`}
                            className="object-cover rounded"
                            fallback={placehoderImg.src}
                            style={{ width: '100%', height: '200px' }}
                          />
                        </div>
                      ))}
                    </Image.PreviewGroup>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Image
                      src={vehicle.image || placehoderImg.src}
                      alt={vehicle.name}
                      width={300}
                      height={300}
                      className="object-cover rounded"
                      fallback={placehoderImg.src}
                    />
                  </div>
                )}
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Tên phương tiện">{vehicle.name}</Descriptions.Item>
                <Descriptions.Item label="Danh mục">{category}</Descriptions.Item>
                <Descriptions.Item label="Biển số xe">{vehicle.licensePlate}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{statusMap[vehicle.status] || vehicle.status}</Descriptions.Item>
                <Descriptions.Item label="Tình trạng hoạt động">{vehicle.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">{new Date(vehicle.updatedAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
