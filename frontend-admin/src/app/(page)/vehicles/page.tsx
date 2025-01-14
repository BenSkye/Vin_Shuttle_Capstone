'use client'
import { Layout, Button, Input, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Sidebar from '../../_components/common/Sidebar';

const { Header, Content } = Layout;

export default function Vehicles() {
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
                        <Button type="primary" icon={<PlusOutlined />}>
                            Thêm phương tiện
                        </Button>
                    </Space>
                </Header>
                <Content className="m-6 p-6 bg-white">
                    {/* Nội dung trang quản lý phương tiện */}
                </Content>
            </Layout>
        </Layout>
    )
}