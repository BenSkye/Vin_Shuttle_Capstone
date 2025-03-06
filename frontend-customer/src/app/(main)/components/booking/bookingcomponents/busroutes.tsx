import { Search } from "lucide-react"
import { Bus, Train, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import type React from "react"
import { useState, useEffect } from "react"
import { getSenicRoute } from "@/service/senics"
import dynamic from "next/dynamic"
import 'leaflet/dist/leaflet.css'

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

export default function BusRoutes() {
    const [showRoutes, setShowRoutes] = useState(false)
    const position: [number, number] = [10.7769, 106.7009] // Ho Chi Minh City coordinates

    useEffect(() => {
        // Fix for default marker icons in Leaflet with Next.js
        if (typeof window !== 'undefined') {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl
            // @ts-ignore
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            })
        }
    }, [])

    return (
        <div className="flex flex-col h-screen">
            {/* Search Header */}
            <div className="flex items-center gap-4 p-4 border-b">
                {/* Hiển thị menu trên mobile */}
                <button
                    className="lg:hidden p-2"
                    onClick={() => setShowRoutes(!showRoutes)}
                >
                    <Menu className="h-5 w-5 text-gray-600" />
                </button>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input className="pl-9" placeholder="Tìm địa điểm..." type="search" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden lg:flex-row flex-col">
                {/* Routes List */}
                <div
                    className={`w-80 border-r overflow-y-auto p-2 bg-white transition-transform duration-300
                    ${showRoutes ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:block fixed inset-0 z-10 lg:relative`}
                >
                    <button
                        className="lg:hidden absolute top-4 right-4 p-2 bg-gray-200 rounded-full"
                        onClick={() => setShowRoutes(false)}
                    >
                        ✕
                    </button>
                    <div className="space-y-1">
                        <RouteItem
                            icon={<Train className="h-5 w-5" />}
                            number="Metro 1"
                            from="Bến Thành"
                            to="Suối Tiên"
                            time="05:00 - 22:00"
                            price="20.000 VND"
                            color="text-emerald-600"
                        />
                        <RouteItem
                            icon={<Bus className="h-5 w-5" />}
                            number="D4"
                            from="Vinhomes Grand Park"
                            to="Bến xe buýt Sài Gòn"
                            time="05:00 - 22:00"
                            price="7.000 VND"
                            color="text-emerald-600"
                        />
                        <RouteItem
                            icon={<Bus className="h-5 w-5" />}
                            number="01"
                            from="Bến Thành"
                            to="Bến Xe buýt Chợ Lớn"
                            time="05:00 - 20:15"
                            price="5.000 VND"
                            color="text-emerald-600"
                        />
                        <RouteItem
                            icon={<Bus className="h-5 w-5" />}
                            number="03"
                            from="Bến Thành"
                            to="Thanh Xuân"
                            time="04:00 - 20:45"
                            price="6.000 VND"
                            color="text-emerald-600"
                        />
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative">
                    {typeof window !== 'undefined' && (
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={position}>
                                <Popup>
                                    Thành phố Hồ Chí Minh
                                </Popup>
                            </Marker>
                        </MapContainer>
                    )}
                </div>
            </div>
        </div>
    )
}

interface RouteItemProps {
    icon: React.ReactNode
    number: string
    from: string
    to: string
    time: string
    price: string
    color: string
}

function RouteItem({ icon, number, from, to, time, price, color }: RouteItemProps) {
    return (
        <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer">
            <div className={`mt-1 ${color}`}>{icon}</div>
            <div className="flex-1 space-y-1">
                <div className="font-medium">Tuyến số {number}</div>
                <div className="text-sm text-muted-foreground">
                    {from} - {to}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span>{time}</span>
                    </div>
                    <div>{price}</div>
                </div>
            </div>
        </div>
    )
}
