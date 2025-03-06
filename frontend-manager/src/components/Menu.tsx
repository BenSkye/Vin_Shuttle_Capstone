import Link from 'next/link'
import Image from 'next/image'
import { role } from '../libs/data'

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/icons/home.png",
                label: "Trang chủ",
                href: "/",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: '/icons/car-solid.svg',
                label: "Tài xế",
                href: "/drivers",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/icons/driver.png",
                label: "Khách hàng",
                href: "/customers",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/icons/calendar-solid.svg",
                label: "Lịch trình",
                href: "/schedule",
                visible: ["admin", "teacher"],
            },




        ]
    },
]

const Menu = () => {
    return (
        <div className="mt-4 text-sm">
            {menuItems.map((i) => (
                <div className="flex flex-col gap-2" key={i.title}>
                    <span className="hidden lg:block text-gray-400 font-light my-4">
                        {i.title}
                    </span>
                    {i.items.map((item) => {
                        if (item.visible.includes(role)) {
                            return (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                                >
                                    <Image src={item.icon} alt="" width={20} height={20} />
                                    <span className="hidden lg:block">{item.label}</span>
                                </Link>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    )
}

export default Menu;