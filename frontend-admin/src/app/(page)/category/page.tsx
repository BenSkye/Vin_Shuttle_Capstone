'use client'
import { Layout, Table, Button, Input, Space, App, notification, Modal, Form } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../../_components/common/Sidebar';
import { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryServices';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;

interface VehicleCategory {
  _id: string;
  name: string;
  description: string;
  numberOfSeat: number;
}

interface CategoryFormValues {
  name: string;
  description: string;
  numberOfSeat: number;
}


interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function Category() {
  const router = useRouter();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      const formattedCategories = response.map((category) => ({
        ...category,
        key: category._id
      }));
      setCategories(formattedCategories);
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      notification.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể tải danh sách danh mục xe',
        duration: 5,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số ghế',
      dataIndex: 'numberOfSeat',
      key: 'numberOfSeat',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: VehicleCategory) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: VehicleCategory) => {
    router.push(`/category/${record._id}`);
  };

  const handleDelete = (record: VehicleCategory) => {
    console.log('Delete category:', record);
  };

  const handleAddCategory = async (values: CategoryFormValues) => {
    try {
      await categoryService.addCategory(values);
      notification.success({
        message: 'Thành công',
        description: 'Thêm danh mục xe mới thành công',
        duration: 5,
        placement: 'topRight'
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchCategories();
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      notification.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể thêm danh mục xe',
        duration: 5,
        placement: 'topRight'
      });
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <App>
      <Layout>
        <Sidebar />
        <Layout>
          <Header className="bg-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold ml-7">Quản lý danh mục xe</h2>
            <Space>
              <Input
                placeholder="Tìm kiếm danh mục"
                prefix={<SearchOutlined />}
                className="w-64"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Thêm danh mục
              </Button>
            </Space>
          </Header>
          <Content className="m-6 p-6 bg-white">
            <Table
              dataSource={filteredCategories}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} danh mục`
              }}
              loading={loading}
            />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Thêm danh mục xe mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCategory}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="numberOfSeat"
            label="Số ghế"
            rules={[
              { required: true, message: 'Vui lòng nhập số ghế!' },
              {
                validator: async (_, value) => {
                  const numValue = Number(value);
                  if (isNaN(numValue)) {
                    throw new Error('Vui lòng nhập số hợp lệ!');
                  }
                  if (numValue < 1) {
                    throw new Error('Số ghế phải lớn hơn 0!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
            getValueFromEvent={(event) => {
              const value = parseInt(event.target.value);
              return isNaN(value) ? '' : value;
            }}
          >
            <Input 
              type="number" 
              min={1}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                form.setFieldValue('numberOfSeat', value);
              }}
            />
          </Form.Item>

          <Form.Item className="flex justify-end mb-0">
            <Space>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </App>
  );
}