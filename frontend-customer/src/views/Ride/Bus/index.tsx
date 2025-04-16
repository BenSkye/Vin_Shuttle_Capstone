'use client'

import { FiChevronDown, FiChevronUp, FiClock, FiDollarSign, FiInfo, FiSearch } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { BusRoute, BusSchedule, BusStop, getAllBusRoutes, getAllBusStops, getBusScheduleByRoute } from '@/service/bus.service'
import { format } from 'date-fns'
import BusRouteMap from '@/components/map/BusRouteMap'
import BusSchedulePanel from '../components/BusSchedulePanel'
import BusStopPanel from '../components/BusStopPanel'

interface RouteWithSchedule extends BusRoute {
    schedules?: BusSchedule[]
    isLoading?: boolean
    error?: string | null
    isExpanded?: boolean
}

type DisplayMode = 'stops' | 'routes'

const ViewBusPage = () => {
    const [busRoutes, setBusRoutes] = useState<RouteWithSchedule[]>([])
    const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [allBusStops, setAllBusStops] = useState<BusStop[]>([])
    const [displayMode, setDisplayMode] = useState<DisplayMode>('stops')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [routes, stops] = await Promise.all([
                    getAllBusRoutes(),
                    getAllBusStops()
                ])
                setBusRoutes(routes.map(route => ({ ...route, isExpanded: false })))
                setAllBusStops(stops)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleRouteClick = async (route: RouteWithSchedule) => {
        if (displayMode !== 'routes') return

        setSelectedRoute(route)

        setBusRoutes(prevRoutes =>
            prevRoutes.map(r => ({
                ...r,
                isExpanded: r._id === route._id ? !r.isExpanded : false
            }))
        )

        if (route.schedules || !route.isExpanded) return

        setBusRoutes(prevRoutes =>
            prevRoutes.map(r => ({
                ...r,
                isLoading: r._id === route._id ? true : r.isLoading
            }))
        )

        try {
            const today = format(new Date(), 'yyyy-MM-dd')
            const response = await getBusScheduleByRoute(route._id, today)

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

    const handleDisplayModeChange = (mode: DisplayMode) => {
        setDisplayMode(mode)
        if (mode === 'stops') {
            setSelectedRoute(null)
        }
    }

    const filteredRoutes = busRoutes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredBusStops = allBusStops.filter(stop =>
        stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-72px)] w-full">
            {/* Left Sidebar */}
            <div className="w-[400px] flex-shrink-0 border-r border-divider bg-white flex flex-col">
                {/* Search Section */}
                <div className="border-b border-divider p-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleDisplayModeChange('stops')}
                            className={`flex h-10 items-center gap-2 rounded-lg px-4 ${displayMode === 'stops'
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-content-secondary hover:bg-surface-secondary'
                                }`}
                        >
                            <span>Trạm Bus</span>
                        </button>
                        <button
                            onClick={() => handleDisplayModeChange('routes')}
                            className={`flex h-10 items-center gap-2 rounded-lg px-4 ${displayMode === 'routes'
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-content-secondary hover:bg-surface-secondary'
                                }`}
                        >
                            <span>Tuyến Bus</span>
                        </button>
                    </div>
                    <div className="mt-4 relative">
                        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" />
                        <Input
                            label=""
                            error=""
                            placeholder={displayMode === 'routes' ? "Tìm tuyến xe" : "Tìm trạm dừng"}
                            className="h-11 pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-content-secondary">Đang tải...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center p-4">
                            <span className="text-red-500">{error}</span>
                        </div>
                    ) : displayMode === 'routes' ? (
                        // Routes List
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
                                    <BusSchedulePanel
                                        schedules={route.schedules || []}
                                        isLoading={route.isLoading || false}
                                        error={route.error || null}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        // Bus Stops List
                        <BusStopPanel busStops={filteredBusStops} />
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
                    <BusRouteMap
                        selectedRoute={selectedRoute}
                        allBusStops={allBusStops}
                        showAllStops={displayMode === 'stops'}
                    />
                </div>
            </div>
        </div>
    )
}

export default ViewBusPage