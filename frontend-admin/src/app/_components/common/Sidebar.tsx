import { Layout, Menu, App, notification } from "antd";
import {
  AiOutlineUser,
  AiOutlineCar,
  AiOutlineUserSwitch,
  AiOutlineCompass,
  AiOutlineDollar,
  AiOutlineCalculator,
  AiOutlineUnorderedList,
  AiOutlineLogout,
  AiOutlineBook,
} from "react-icons/ai";
import { FaBus } from "react-icons/fa";

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
            icon: <AiOutlineUser />,
            label: <Link href="/">Quản lý người dùng</Link>,
          },
          {
            key: "/category",
            icon: <AiOutlineUnorderedList />,
            label: <Link href="/category">Quản lý danh mục xe</Link>,
          },
          {
            key: "/vehicles",
            icon: <AiOutlineCar />,
            label: <Link href="/vehicles">Quản lý phương tiện</Link>,
          },
          {
            key: "/profile",
            icon: <AiOutlineUserSwitch />,
            label: <Link href="/profile">Trang cá nhân</Link>,
          },
          {
            key: "/router",
            icon: <AiOutlineCompass />,
            label: <Link href="/router">Quản lý tuyến đường</Link>,
          },
          {
            key: "/busstop",
            icon: <FaBus />,
            label: <Link href="/busstop">Quản lý tuyến xe bus</Link>,
          },
          {
            key: "/money",
            icon: <AiOutlineDollar />,
            label: <Link href="/money">Quản lý tiền</Link>,
          },
          {
            key: "/cal",
            icon: <AiOutlineCalculator />,
            label: <Link href="/cal">Tính tiền</Link>,
          },
          {
            key: "/trip",
            icon: <AiOutlineBook />,
            label: <Link href="/trip">Lịch sử cuốc xe</Link>,
          },
          {
            key: "logout",
            icon: <AiOutlineLogout />,
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