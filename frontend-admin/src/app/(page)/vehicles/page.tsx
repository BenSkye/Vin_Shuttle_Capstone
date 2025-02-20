'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout, Button, Input, Space, Table, App, Image } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Sidebar from '../../_components/common/Sidebar';
import { vehiclesService } from '../../services/vehiclesServices';
import { categoryService } from '../../services/categoryServices';
import AddVehicleModal from '../../_components/vehicles/addVehiclesModal';
import placehoderImg from '../../assets/place.jpeg';
const { Header, Content } = Layout;
import type { TablePaginationConfig } from 'antd/es/table';
interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string;
  createdAt: string;
  updatedAt: string;
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
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchVehicles(pagination.current, pagination.pageSize, searchText);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const categoryMap = data.reduce((acc, category) => ({
        ...acc,
        [category._id]: category.name
      }), {});
      setCategories(categoryMap);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục xe');
    }
  };

  const fetchVehicles = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const data = await vehiclesService.getVehicles();
  
      // Filter vehicles based on search text
      let filteredData = data;
      if (search) {
        filteredData = data.filter((vehicle: Vehicle) => 
          vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
          categories[vehicle.categoryId]?.toLowerCase().includes(search.toLowerCase())
        );
      }
  
      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
  
      setVehicles(paginatedData);
      
      setPagination({
        current: page,
        pageSize: pageSize,
        total: filteredData.length // Set total to the length of filtered data
      });
    } catch (error: unknown) {
      console.error('Error fetching vehicles:', error);
      message.error('Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };
  

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page when searching
    fetchVehicles(1, pagination.pageSize, value);
  };

  // Handle pagination change
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    const paginationWithDefaultValues = {
      ...newPagination,
      current: newPagination.current ?? 1,
      pageSize: newPagination.pageSize ?? 10,
      total: pagination.total, // Ensure total is always a number
    };
    setPagination(paginationWithDefaultValues);
    fetchVehicles(paginationWithDefaultValues.current, paginationWithDefaultValues.pageSize, searchText);
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Hình ảnh',
      key: 'image',
      width: 100,
      render: (record: Vehicle) => (
        <Image
          src={record.image || placehoderImg.src}
          alt={record.name}
          width={80}
          height={80}
          className="object-cover rounded"
          fallback={placehoderImg.src}
        />
      )
    },
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
    {
      title: 'Hành động',
      key: 'action',
      render: (record: Vehicle) => (
        <Button type='primary'><Link href={`/vehicles/${record._id}`}>
          Xem chi tiết
        </Link>
        </Button>
      )
    }
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
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
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
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} phương tiện`,
              pageSizeOptions: ['10', '20', '50'],
              showQuickJumper: true,
            }}
            onChange={handleTableChange}
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