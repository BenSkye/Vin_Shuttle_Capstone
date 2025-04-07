'use client';

import { Layout, Table, Button, Input, Space, App, notification, Modal, Form, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../app/_components/common/Sidebar';
import { useEffect, useState } from 'react';
import { usersService } from './services/usersServices';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;

// Cập nhật interface theo API
interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ApiError extends Error {
  message: string;
}

// Thêm interface cho form values
interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'driver';
  password: string;
}

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Hàm fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers();
      
      // Chuyển đổi dữ liệu cho Table
      const formattedUsers = response.map((user: UserData) => ({
        ...user,
        key: user._id
      }));
      
      setUsers(formattedUsers);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      notification.error({
        message: 'Lỗi',
        description: apiError.message || 'Không thể tải danh sách người dùng',
        duration: 5, // Tự động đóng sau 5 giây
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
        await fetchUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  // Lọc dữ liệu theo searchText
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone.includes(searchText)
  );

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    // {
    //   title: 'Hành động',
    //   key: 'action',
    //   render: (_: unknown, record: UserData) => (
    //     <Space size="middle">
    //       <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
    //       <Button type="link" danger onClick={() => handleDelete(record)}>Xóa</Button>
    //     </Space>
    //   ),
    // },
  ];

  // const handleEdit = (record: UserData) => {
  //   console.log('Edit user:', record);
  // };

  // const handleDelete = (record: UserData) => {
  //   console.log('Delete user:', record);
  // };

  // Xử lý search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Cập nhật kiểu dữ liệu cho handleAddUser
  const handleAddUser = async (values: UserFormValues) => {
    try {
      await usersService.addUser(values);
      notification.success({
        message: 'Thành công',
        description: 'Thêm người dùng mới thành công',
        duration: 5,
        placement: 'topRight'
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      notification.error({
        message: 'Lỗi',
        description: apiError.message || 'Không thể thêm người dùng',
        duration: 5,
        placement: 'topRight'
      });
    }
  };

  // Cập nhật kiểu dữ liệu cho validateEmail
  const validateEmail = (_: unknown, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return Promise.reject('Vui lòng nhập email!');
    }
    if (!emailRegex.test(value)) {
      return Promise.reject('Email không hợp lệ!');
    }
    return Promise.resolve();
  };

  return (
    <App>
      <Layout>
        <Sidebar />
        <Layout>
          <Header className="bg-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold ml-7">Quản lý người dùng</h2>
            <Space>
              <Input
                placeholder="Tìm kiếm người dùng"
                prefix={<SearchOutlined />}
                className="w-64"
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Thêm người dùng
              </Button>
            </Space>
          </Header>
          <Content className="m-6 p-6 bg-white">
            <Table
              dataSource={filteredUsers}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} người dùng`
              }}
              loading={loading}
            />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Thêm người dùng mới"
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
          onFinish={handleAddUser}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ validator: validateEmail }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="driver">Driver</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
            ]}
          >
            <Input.Password />
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
