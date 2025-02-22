import Link from 'next/link'
import Image from 'next/image'

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: 'icons/house-solid.svg',
                label: "Home",
                href: '/',
            },
            {
                icon: "icons/car-solid.svg",
                label: "Drivers",
                href: "Drivers"
            },
            {
                icon: "/route.png",
                label: "Route",
                href: "/route"
            },
            {
                icon: "/vehicles.png",
                label: "Vehicles",
                href: "/vehicles"
            }, {
                icon: "/customers.png",
                label: "Customers",
                href: "/customers"
            }

        ]
    },
    {
        title: "OTHERS",
        items: [
            {
                icon: '/profile.png',
                label: 'Profile',
                href: '/profile'
            }
        ]
    }
]



const Menu = () => {
    return (
        <div className="mt-4 text-sm">
            {menuItems.map(i => (
                <div className="flex flex-col gap-2" key={i.title}>
                    <span className="hidden lg:block text-gray-400 font-light my-4">{i.title}</span>
                    {i.items.map(item => (
                        <Link href={item.href} key={item.label}
                            className='flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2'>
                            <Image src={item.icon} alt="" width={20} height={20} />
                            <span className='hidden lg:block'>{item.label}</span>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Menu;