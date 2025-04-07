'use client';

import { Layout, Table, Button, Input, Space, App, notification, Modal, Form, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../app/_components/common/Sidebar';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { usersService } from './services/usersServices';
import { useRouter } from 'next/navigation';

// Interfaces
interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  key?: string;
}

interface ApiError extends Error {
  message: string;
}

interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'driver';
  password: string;
}

const { Header, Content } = Layout;

// Cache để lưu trữ dữ liệu users
let usersCache: UserData[] = [];

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>(usersCache);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async (forceRefresh = false) => {
    if (usersCache.length > 0 && !forceRefresh) {
      setUsers(usersCache);
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.getUsers();
      const formattedUsers = response.map((user: UserData) => ({
        ...user,
        key: user._id
      }));
      
      usersCache = formattedUsers;
      setUsers(formattedUsers);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      notification.error({
        message: 'Lỗi',
        description: apiError.message || 'Không thể tải danh sách người dùng',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      await fetchUsers();
    };

    initializeData();
  }, [router, fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.includes(searchText)
    );
  }, [users, searchText]);

  const columns = useMemo(() => [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
  ], []);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  const handleAddUser = useCallback(async (values: UserFormValues) => {
    try {
      setLoading(true);
      await usersService.addUser(values);
      notification.success({
        message: 'Thành công',
        description: 'Thêm người dùng mới thành công',
      });
      setIsModalOpen(false);
      form.resetFields();
      await fetchUsers(true); // Force refresh sau khi thêm
    } catch (error: unknown) {
      const apiError = error as ApiError;
      notification.error({
        message: 'Lỗi',
        description: apiError.message || 'Không thể thêm người dùng',
      });
    } finally {
      setLoading(false);
    }
  }, [form, fetchUsers]);

  const validateEmail = useCallback((_: unknown, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return Promise.reject('Vui lòng nhập email!');
    if (!emailRegex.test(value)) return Promise.reject('Email không hợp lệ!');
    return Promise.resolve();
  }, []);

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
          disabled={loading}
        >
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ validator: validateEmail }]}>
            <Input />
          </Form.Item>
          <Form.Item 
            name="phone" 
            label="Số điện thoại" 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,12}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="driver">Driver</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="password" 
            label="Mật khẩu" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item className="flex justify-end mb-0">
            <Space>
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </App>
  );
}