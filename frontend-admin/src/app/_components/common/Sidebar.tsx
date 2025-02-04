import { Layout, Menu, App } from 'antd';
import { UserOutlined, CarOutlined, UserSwitchOutlined, CompassOutlined, DollarOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Sider } = Layout;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { notification } = App.useApp();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    const accessToken = localStorage.getItem('accessToken');
    setIsLoggedIn(!!accessToken);
  }, []);

  const handleLogout = () => {
    // Xóa localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    notification.success({
      message: 'Đăng xuất thành công',
      description: 'Hẹn gặp lại!',
      duration: 5,
    });
    
    setIsLoggedIn(false);
    router.push('/login');
  };

  const menuItems = [
    ...(isLoggedIn ? [
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
      {
        key: '/router',
        icon: <CompassOutlined />,
        label: 'Quản lý tuyến đường',
      },
      {
        key: '/money',
        icon: <DollarOutlined />,
        label: 'Quản lý tiền',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
      }
    ] : [])
  ];

  return (
    <App>
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
          onClick={(info) => {
            if (info.key !== 'logout') {
              router.push(info.key);
            }
          }}
        />
      </Sider>
    </App>
  );
}
