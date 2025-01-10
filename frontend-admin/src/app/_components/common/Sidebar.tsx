import { Layout, Menu } from 'antd';
import { UserOutlined, CarOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: '/vehicles',
      icon: <CarOutlined />,
      label: 'Quản lý phương tiện',
    },
    {
      key: '/profile',
      icon: <UserSwitchOutlined />,
      label: 'Trang cá nhân',
    },
  ];

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      className="min-h-screen"
    >
      <div className="h-16 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
}
