'use client';

import { Layout, Table, Button, Input, Space, Card } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../../_components/common/Sidebar';

const { Header, Content } = Layout;

// Định nghĩa interface cho dữ liệu tuyến đường
interface RouteData {
  key: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  distance: string;
  status: string;
}

export default function RouteManagement() {
  // Mock data mẫu cho tuyến đường
  const dataSource: RouteData[] = [
    {
      key: '1',
      routeName: 'Tuyến số 1',
      startPoint: 'Điểm đầu A',
      endPoint: 'Điểm cuối B',
      distance: '10 km',
      status: 'Đang hoạt động',
    },
  ];

  const columns = [
    {
      title: 'Tên tuyến',
      dataIndex: 'routeName',
      key: 'routeName',
    },
    {
      title: 'Điểm đầu',
      dataIndex: 'startPoint',
      key: 'startPoint',
    },
    {
      title: 'Điểm cuối',
      dataIndex: 'endPoint',
      key: 'endPoint',
    },
    {
      title: 'Khoảng cách',
      dataIndex: 'distance',
      key: 'distance',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">Chi tiết</Button>
          <Button type="link">Sửa</Button>
          <Button type="link" danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold ml-7">Quản lý tuyến đường</h2>
          <Space>
            <Input
              placeholder="Tìm kiếm tuyến đường"
              prefix={<SearchOutlined />}
              className="w-64"
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm tuyến đường
            </Button>
          </Space>
        </Header>
        <Content className="m-6">
          <Card>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}