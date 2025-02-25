'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout, Descriptions, Image, Spin, App, Card, Button } from 'antd';
import Sidebar from '../../../_components/common/Sidebar';
import { vehiclesService } from '../../../services/vehiclesServices';
import { categoryService } from '../../../services/categoryServices';
import placehoderImg from '../../../assets/place.jpeg';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import EditVehicleModal from '../../../_components/vehicles/editVehiclesModal';

const { Header, Content } = Layout;
// Map cho trạng thái xe
const vehicleConditionMap: { [key: string]: string } = {
  'available': 'Sẵn sàng sử dụng',
  'in-use': 'Đang sử dụng',
  'maintenance': 'Đang bảo trì'
};

const operationStatusMap: { [key: string]: string } = {
  'pending': 'Chờ hoạt động',
  'running': 'Đang chạy',
  'charging': 'Đang sạc'
};

interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  vehicleCondition: 'available' | 'in-use' | 'maintenance';
  operationStatus: 'pending' | 'running' | 'charging';
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
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vehicleId = params.id as string;
        const vehicleData = await vehiclesService.getVehicleById(vehicleId);
        setVehicle(vehicleData);

        if (vehicleData.categoryId) {
          const categoryData = await categoryService.getCategoryById(vehicleData.categoryId);
          setCategory(categoryData);
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        message.error('Không thể tải thông tin phương tiện');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, message]);

  const handleBack = () => {
    router.push('/vehicles');
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalVisible(false);
    // Refresh vehicle data
    const vehicleId = params.id as string;
    const vehicleData = await vehiclesService.getVehicleById(vehicleId);
    setVehicle(vehicleData);
    message.success('Cập nhật xe thành công');
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
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
        <Header className="bg-white p-4 flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="flex items-center"
          >
            Quay lại
          </Button>
          <h2 className="text-xl font-semibold">Chi tiết phương tiện</h2>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            className="ml-auto"
          >
            Chỉnh sửa
          </Button>
        </Header>
        <Content className="m-6">
          <div className="flex flex-col gap-6">
            {/* Vehicle Images */}
            <Card title="Hình ảnh phương tiện" className="bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle.image && vehicle.image.length > 0 ? (
                  vehicle.image.map((img, index) => (
                    <div key={index} className="aspect-square w-full">
                      <Image
                        src={img || placehoderImg.src}
                        alt={`${vehicle.name} - ${index + 1}`}
                        className="object-cover rounded w-full h-full"
                        fallback={placehoderImg.src}
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square w-full">
                    <Image
                      src={placehoderImg.src}
                      alt="Placeholder"
                      className="object-cover rounded w-full h-full"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Vehicle Information */}
            <Card title="Thông tin chi tiết" className="bg-white">
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
                <Descriptions.Item label="Tên phương tiện" span={1}>
                  {vehicle.name}
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục" span={1}>
                  {category?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Số ghế" span={1}>
                  {category?.numberOfSeat || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Biển số xe" span={1}>
                  {vehicle.licensePlate}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng xe" span={1}>
                  {vehicleConditionMap[vehicle.vehicleCondition]}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hoạt động" span={1}>
                  {operationStatusMap[vehicle.operationStatus]}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo" span={1}>
                  {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối" span={1}>
                  {new Date(vehicle.updatedAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                {category?.description && (
                  <Descriptions.Item label="Mô tả danh mục" span={1}>
                    {category.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        </Content>

        {vehicle && (
          <EditVehicleModal
            visible={isEditModalVisible}
            onCancel={handleCancel}
            onSuccess={handleEditSuccess}
            vehicleId={vehicle._id}
            initialData={{
              name: vehicle.name,
              categoryId: vehicle.categoryId,
              licensePlate: vehicle.licensePlate,
              vehicleCondition: vehicle.vehicleCondition,
              operationStatus: vehicle.operationStatus,
              image: vehicle.image
            }}
          />
        )}
      </Layout>
    </Layout>
  );
}
