'use client'
import { useEffect, useState } from 'react';
import { Layout, Button, Input, Space, Table, App } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '../../_components/common/Sidebar';
import { vehiclesService } from '../../services/vehiclesServices';
import { categoryService } from '../../services/categoryServices';
import AddVehicleModal from '../../_components/vehicles/addVehiclesModal';

const { Header, Content } = Layout;

interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleCategory {
  _id: string;
  name: string;
  description: string;
  numberOfSeat: number;
}

// Map cho trạng thái xe
const statusMap: { [key: string]: string } = {
  'available': 'Sẵn sàng',
  'busy': 'Đang bận',
  'maintenance': 'Bảo trì'
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const categoryMap = data.reduce((acc, category) => ({
        ...acc,
        [category._id]: category.name
      }), {});
      setCategories(categoryMap);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục xe');
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesService.getVehicles();
      setVehicles(data);
    } catch (error) {
      message.error('Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Tên phương tiện',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      key: 'categoryId',
      render: (record: Vehicle) => categories[record.categoryId] || 'N/A'
    },
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => statusMap[status] || status
    },
    {
      title: 'Hoạt động',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddSuccess = () => {
    setIsModalVisible(false);
    fetchVehicles(); // Refresh danh sách xe
  };

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold ml-7">Quản lý phương tiện</h2>
          <Space>
            <Input
              placeholder="Tìm kiếm phương tiện"
              prefix={<SearchOutlined />}
              className="w-64"
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Thêm phương tiện
            </Button>
          </Space>
        </Header>
        <Content className="m-6 p-6 bg-white">
          <Table
            columns={columns}
            dataSource={vehicles}
            loading={loading}
            rowKey="_id"
          />
        </Content>
      </Layout>

      <AddVehicleModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleAddSuccess}
      />
    </Layout>
  );
}