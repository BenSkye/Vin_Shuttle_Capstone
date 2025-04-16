'use client'

import { FiClock, FiDollarSign, FiInfo, FiSearch } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { BusRoute, BusSchedule, getAllBusRoutes, getBusScheduleByRoute } from '@/service/bus.service'
import { format } from 'date-fns'
import BusRouteMap from '@/components/map/BusRouteMap'
import BusSchedulePanel from '@/components/BusSchedulePanel'

const ViewBusPage = () => {
    const [busRoutes, setBusRoutes] = useState<BusRoute[]>([])
    const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)
    const [schedules, setSchedules] = useState<BusSchedule[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch bus routes
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true)
                const routes = await getAllBusRoutes()
                setBusRoutes(routes)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách tuyến xe')
            } finally {
                setLoading(false)
            }
        }

        fetchRoutes()
    }, [])

    // Fetch schedules when a route is selected
    useEffect(() => {
        const fetchSchedules = async () => {
            if (!selectedRoute) return

            try {
                setLoading(true)
                const today = format(new Date(), 'yyyy-MM-dd')
                console.log('Fetching schedules for route:', selectedRoute._id)
                console.log('Using date:', today)
                console.log('Selected route details:', selectedRoute)

                const routeSchedules = await getBusScheduleByRoute(selectedRoute._id, today)
                console.log('Received schedules:', routeSchedules)
                setSchedules(routeSchedules)
            } catch (err) {
                console.error('Error fetching schedules:', err)
                setError(err instanceof Error ? err.message : 'Lỗi khi tải lịch trình')
            } finally {
                setLoading(false)
            }
        }

        fetchSchedules()
    }, [selectedRoute])

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
                    {loading && !selectedRoute ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-content-secondary">Đang tải...</span>
                        </div>
                    ) : error && !selectedRoute ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-red-500">{error}</span>
                        </div>
                    ) : (
                        filteredRoutes.map((route) => (
                            <div
                                key={route._id}
                                className={`group cursor-pointer border-b border-divider p-4 transition-colors hover:bg-surface-hover ${selectedRoute?._id === route._id ? 'bg-surface-hover' : ''
                                    }`}
                                onClick={() => setSelectedRoute(route)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-content-primary">{route.name}</span>
                                            <FiInfo className="h-4 w-4 text-content-secondary" />
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
                            </div>
                        ))
                    )}
                </div>

                {/* Schedule Panel */}
                {selectedRoute && (
                    <BusSchedulePanel
                        schedules={schedules}
                        isLoading={loading}
                        error={error}
                    />
                )}
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