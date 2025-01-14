'use client';

import { Layout, Table, Button, Input, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../app/_components/common/Sidebar';

const { Header, Content } = Layout;

// Định nghĩa interface cho user data
interface UserData {
  key: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function Home() {
  // Mock data với kiểu đã định nghĩa
  const dataSource: UserData[] = [
    {
      key: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      role: 'User',
    },
  ];

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
    {
      title: 'Hành động',
      key: 'action',
      render: (record: UserData) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: UserData) => {
    console.log('Edit user:', record);
  };

  const handleDelete = (record: UserData) => {
    console.log('Delete user:', record);
  };

  return (
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
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm người dùng
            </Button>
          </Space>
        </Header>
        <Content className="m-6 p-6 bg-white">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
