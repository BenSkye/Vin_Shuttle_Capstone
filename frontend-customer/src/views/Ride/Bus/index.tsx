import { FiClock, FiDollarSign, FiInfo, FiSearch } from 'react-icons/fi'
import { Input } from '@/components/ui/input'

interface BusRoute {
    id: string
    name: string
    description: string
    operatingHours: string
    fare: string | 'Miễn phí'
    hasInfo?: boolean
}

const mockBusRoutes: BusRoute[] = [
    {
        id: 'D4',
        name: 'Tuyến số D4',
        description: 'Điểm đầu cuối Grand Park - Bến xe buýt Sài Gòn',
        operatingHours: '05:00 - 20:50',
        fare: '7,000 VND',
        hasInfo: true
    },
    {
        id: 'GRP1',
        name: 'Tuyến số GRP1',
        description: 'Công viên 36 hecta - Công viên ánh sáng (Trạm cuối)',
        operatingHours: '05:00 - 23:10',
        fare: 'Miễn phí'
    },
    {
        id: 'GRP03',
        name: 'Tuyến số GRP03',
        description: 'Grand Park 03',
        operatingHours: '05:00 - 21:00',
        fare: 'Miễn phí',
        hasInfo: true
    }
]

const ViewBusPage = () => {
    return (
        <div className="flex h-[calc(100vh-72px)] w-full">
            {/* Left Sidebar */}
            <div className="w-[400px] flex-shrink-0 border-r border-divider bg-white">
                {/* Search Section */}
                <div className="border-b border-divider p-4">
                    <div className="flex items-center gap-2">
                        <button className="flex h-10 items-center gap-2 rounded-lg bg-primary-50 px-4 text-primary-600">
                            <span>Buýt điện VinBus</span>
                        </button>
                        <button className="flex h-10 items-center gap-2 rounded-lg px-4 text-content-secondary hover:bg-surface-secondary">
                            <span>Buýt thành phố</span>
                        </button>
                    </div>
                    <div className="mt-4 relative">
                        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" />
                        <Input
                            label=""
                            error=""
                            placeholder="Tìm tuyến xe"
                            className="h-11 pl-10"
                        />
                    </div>
                </div>

                {/* Bus Routes List */}
                <div className="h-[calc(100%-137px)] overflow-y-auto">
                    {mockBusRoutes.map((route) => (
                        <div
                            key={route.id}
                            className="group cursor-pointer border-b border-divider p-4 transition-colors hover:bg-surface-hover"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-content-primary">{route.name}</span>
                                        {route.hasInfo && (
                                            <FiInfo className="h-4 w-4 text-content-secondary" />
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-content-secondary">
                                        {route.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-sm text-content-secondary">
                                            <FiClock className="h-4 w-4" />
                                            <span>{route.operatingHours}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-content-secondary">
                                            <FiDollarSign className="h-4 w-4" />
                                            <span>{route.fare}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div className="relative flex-1">
                <div className="absolute left-4 right-4 top-4 z-10">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" />
                        <Input
                            label=""
                            error=""
                            placeholder="Tìm địa điểm..."
                            className="h-11 pl-10"
                        />
                    </div>
                </div>
                <div className="h-full w-full bg-surface-secondary">
                    {/* Map will be integrated here */}
                </div>
            </div>
        </div>
    )
}

export default ViewBusPage