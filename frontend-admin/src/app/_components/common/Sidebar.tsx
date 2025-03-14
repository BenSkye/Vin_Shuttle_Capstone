import { Layout, Menu, App, notification } from "antd";
import {
  UserOutlined,
  CarOutlined,
  UserSwitchOutlined,
  CompassOutlined,
  DollarOutlined,
  CalculatorOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  BookOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const { Sider } = Layout;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
      if (!token) {
        router.push("/login");
      }
    };

    checkAuth();
    // Thêm event listener để kiểm tra token khi storage thay đổi
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    notification.success({
      message: "Đăng xuất thành công",
      description: "Hẹn gặp lại!",
      duration: 5,
    });

    setIsLoggedIn(false);
    router.push("/login");
  };

  const menuItems = [
    ...(isLoggedIn
      ? [
          {
            key: "/",
            icon: <UserOutlined />,
            label: <Link href="/">Quản lý người dùng</Link>,
          },
          {
            key: "/category",
            icon: <UnorderedListOutlined />,
            label: <Link href="/category">Quản lý danh mục xe</Link>,
          },
          {
            key: "/vehicles",
            icon: <CarOutlined />,
            label: <Link href="/vehicles">Quản lý phương tiện</Link>,
          },
          {
            key: "/profile",
            icon: <UserSwitchOutlined />,
            label: <Link href="/profile">Trang cá nhân</Link>,
          },
          {
            key: "/router",
            icon: <CompassOutlined />,
            label: <Link href="/router">Quản lý tuyến đường</Link>,
          },
          {
            key: "/money",
            icon: <DollarOutlined />,
            label: <Link href="/money">Quản lý tiền</Link>,
          },
          {
            key: "/cal",
            icon: <CalculatorOutlined />,
            label: <Link href="/cal">Tính tiền</Link>,
          },
          {
            key: "/bookingHistory",
            icon: <BookOutlined />,
            label: <Link href="/trip">Lịch sử đặt xe</Link>,
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
          },
        ]
      : []),
  ];

  return (
    <App>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className="h-screen fixed left-0"
        style={{
          overflow: "auto",
          position: "sticky",
          top: 0,
          bottom: 0,
        }}
      >
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ height: "calc(100vh - 64px)" }}
        />
      </Sider>
    </App>
  );
}
