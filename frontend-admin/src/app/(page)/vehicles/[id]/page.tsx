'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout, Descriptions, Image, Spin, App, Card } from 'antd';
import Sidebar from '../../../_components/common/Sidebar';
import { vehiclesService } from '../../../services/vehiclesServices';
import { categoryService } from '../../../services/categoryServices';
import placehoderImg from '../../../assets/place.jpeg';

const { Header, Content } = Layout;

// Map cho trạng thái xe
const statusMap: { [key: string]: string } = {
  'available': 'Sẵn sàng',
  'busy': 'Đang bận',
  'maintenance': 'Bảo trì'
};

interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  numberOfSeat: number;
}

export default function VehicleDetail() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vehicleId = params.id as string;
        const vehicleData = await vehiclesService.getVehicleById(vehicleId);
        setVehicle(vehicleData);

        // Fetch category data
        const categoryData = await categoryService.getCategoryById(vehicleData.categoryId);
        setCategory(categoryData);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        message.error('Không thể tải thông tin phương tiện');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, message]);

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

  if (!vehicle) {
    return (
      <Layout>
        <Sidebar />
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <p>Không tìm thấy thông tin phương tiện</p>
          </div>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4">
          <h2 className="text-xl font-semibold ml-7">Chi tiết phương tiện</h2>
        </Header>
        <Content className="m-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Images */}
            <Card title="Hình ảnh phương tiện" className="bg-white">
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(vehicle.image) ? (
                  vehicle.image.map((img, index) => (
                    <div key={index} className="aspect-square">
                      <Image
                        src={img || placehoderImg.src}
                        alt={`${vehicle.name} - ${index + 1}`}
                        className="object-cover rounded"
                        fallback={placehoderImg.src}
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square">
                    <Image
                      src={vehicle.image || placehoderImg.src}
                      alt={vehicle.name}
                      className="object-cover rounded"
                      fallback={placehoderImg.src}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Vehicle Information */}
            <Card title="Thông tin chi tiết" className="bg-white">
              <Descriptions layout="vertical" column={1}>
                <Descriptions.Item label="Tên phương tiện">
                  {vehicle.name}
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  {category?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Số ghế">
                  {category?.numberOfSeat || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Biển số xe">
                  {vehicle.licensePlate}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {statusMap[vehicle.status] || vehicle.status}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hoạt động">
                  {vehicle.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  {new Date(vehicle.updatedAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                {category && (
                  <Descriptions.Item label="Mô tả danh mục">
                    {category.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
