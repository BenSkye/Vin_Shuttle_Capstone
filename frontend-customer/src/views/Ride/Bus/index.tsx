'use client'

import { FiChevronDown, FiChevronUp, FiClock, FiDollarSign, FiInfo, FiSearch } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { BusRoute, BusSchedule, getAllBusRoutes, getBusScheduleByRoute } from '@/service/bus.service'
import { format } from 'date-fns'
import BusRouteMap from '@/components/map/BusRouteMap'

interface RouteWithSchedule extends BusRoute {
    schedules?: BusSchedule[]
    isLoading?: boolean
    error?: string | null
    isExpanded?: boolean
}

const ViewBusPage = () => {
    const [busRoutes, setBusRoutes] = useState<RouteWithSchedule[]>([])
    const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch bus routes
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true)
                const routes = await getAllBusRoutes()
                setBusRoutes(routes.map(route => ({ ...route, isExpanded: false })))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách tuyến xe')
            } finally {
                setLoading(false)
            }
        }

        fetchRoutes()
    }, [])

    // Fetch schedules when a route is expanded
    const handleRouteClick = async (route: RouteWithSchedule) => {
        setSelectedRoute(route)

        // Toggle expansion state
        setBusRoutes(prevRoutes =>
            prevRoutes.map(r => ({
                ...r,
                isExpanded: r._id === route._id ? !r.isExpanded : false
            }))
        )

        // If already has schedules or is collapsing, don't fetch
        if (route.schedules || !route.isExpanded) return

        // Update loading state for this route
        setBusRoutes(prevRoutes =>
            prevRoutes.map(r => ({
                ...r,
                isLoading: r._id === route._id ? true : r.isLoading
            }))
        )

        try {
            const today = format(new Date(), 'yyyy-MM-dd')
            const response = await getBusScheduleByRoute(route._id, today)

            // Check if response contains error
            if ('error' in response) {
                const errorResponse = response as { error: string }
                setBusRoutes(prevRoutes =>
                    prevRoutes.map(r => ({
                        ...r,
                        isLoading: false,
                        error: r._id === route._id ? errorResponse.error : r.error
                    }))
                )
                return
            }

            // Update schedules for this route
            setBusRoutes(prevRoutes =>
                prevRoutes.map(r => ({
                    ...r,
                    schedules: r._id === route._id ? response : r.schedules,
                    isLoading: false,
                    error: null
                }))
            )
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải lịch trình'
            setBusRoutes(prevRoutes =>
                prevRoutes.map(r => ({
                    ...r,
                    isLoading: false,
                    error: r._id === route._id ? errorMessage : r.error
                }))
            )
        }
    }

    // Filter routes based on search query
    const filteredRoutes = busRoutes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-72px)] w-full">
            {/* Left Sidebar */}
            <div className="w-[400px] flex-shrink-0 border-r border-divider bg-white flex flex-col">
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bus Routes List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-content-secondary">Đang tải...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-red-500">{error}</span>
                        </div>
                    ) : (
                        filteredRoutes.map((route) => (
                            <div key={route._id} className="border-b border-divider">
                                <button
                                    className={`w-full group cursor-pointer p-4 transition-colors hover:bg-surface-hover ${selectedRoute?._id === route._id ? 'bg-surface-hover' : ''
                                        }`}
                                    onClick={() => handleRouteClick(route)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-content-primary">{route.name}</span>
                                                <FiInfo className="h-4 w-4 text-content-secondary" />
                                                {route.isExpanded ? (
                                                    <FiChevronUp className="h-4 w-4 text-content-secondary" />
                                                ) : (
                                                    <FiChevronDown className="h-4 w-4 text-content-secondary" />
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-content-secondary">
                                                {route.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-sm text-content-secondary">
                                                    <FiClock className="h-4 w-4" />
                                                    <span>{route.estimatedDuration} phút</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-content-secondary">
                                                    <FiDollarSign className="h-4 w-4" />
                                                    <span>{route.totalDistance} km</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Schedule Section */}
                                {route.isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 bg-gray-50">
                                        {route.isLoading ? (
                                            <div className="py-4 text-center text-content-secondary">
                                                Đang tải lịch trình...
                                            </div>
                                        ) : route.error ? (
                                            <div className="py-4 text-center text-red-500">
                                                {route.error}
                                            </div>
                                        ) : route.schedules && route.schedules.length > 0 ? (
                                            route.schedules.map((schedule) => (
                                                <div key={schedule._id} className="space-y-3">
                                                    {schedule.dailyTrips?.map((trip, tripIndex) => (
                                                        <div
                                                            key={tripIndex}
                                                            className="flex flex-col p-3 rounded-lg border border-divider bg-white"
                                                        >
                                                            <div className="flex items-center justify-between text-sm mb-2">
                                                                <span className="font-medium">Chuyến {tripIndex + 1}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${trip.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                    trip.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {trip.status === 'active' ? 'Hoạt động' :
                                                                        trip.status === 'in_progress' ? 'Đang chạy' :
                                                                            'Kết thúc'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm text-content-secondary">
                                                                <div className="flex items-center gap-2">
                                                                    <span>Khởi hành:</span>
                                                                    <span className="font-medium text-content-primary">
                                                                        {format(new Date(trip.startTime), 'HH:mm')}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>Kết thúc:</span>
                                                                    <span className="font-medium text-content-primary">
                                                                        {format(new Date(trip.endTime), 'HH:mm')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-content-secondary">
                                                Không có lịch trình nào
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
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
                <div className="h-full w-full">
                    <BusRouteMap selectedRoute={selectedRoute} />
                </div>
            </div>
        </div>
    )
}

export default ViewBusPage