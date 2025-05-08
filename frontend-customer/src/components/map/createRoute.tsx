'use client'

import React, { useCallback, useEffect, useState } from 'react'

import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import { ScenicRouteStatus } from '@/constants/scenic-routes.enum'
import { useScenicRouteQuery } from '@/hooks/queries/scenicRoute.query'

import '@/styles/map.css'

import { RouteResponse, routeService } from '../../service/mapScenic'

interface CreateRouteProps {
  onRouteSelect?: (route: RouteResponse) => void
  selectedRoute?: RouteResponse | null
}

const COLORS = [
  '#2ecc71', // xanh lá
  '#e74c3c', // đỏ
  '#f1c40f', // vàng
  '#9b59b6', // tím
  '#3498db', // xanh dương
  '#e67e22', // cam
  '#1abc9c', // ngọc
  '#34495e', // xám đen
]

const createCustomIcon = ({ color }: { color: string }) => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
            <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
        </svg>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

// Thiết lập icon mặc định cho Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

function SavedRouteDisplay({ coordinates }: { coordinates: L.LatLng[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const polyline = L.polyline(coordinates, {
      color: '#3498db',
      weight: 6,
      opacity: 0.9,
    }).addTo(map)

    map.fitBounds(polyline.getBounds())

    return () => {
      if (polyline) {
        map.removeLayer(polyline)
      }
    }
  }, [map, coordinates])

  return null
}

const renderStatusBadge = (status: 'draft' | 'active' | 'inactive') => {
  const statusConfig = {
    draft: { color: 'bg-gray-200 text-gray-800', text: 'Bản nháp' },
    active: { color: 'bg-green-200 text-green-800', text: 'Đang hoạt động' },
    inactive: { color: 'bg-red-200 text-red-800', text: 'Ngừng hoạt động' },
  }
  const config = statusConfig[status]
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-xs sm:px-2 sm:py-1 sm:text-sm ${config.color}`}
    >
      {config.text}
    </span>
  )
}

// Custom control component to display routes inside the map
function RouteListControl({
  savedRoutes,
  selectedRoute,
  setSelectedRoute,
  setSelectedRouteId,
  selectedRouteId,
  selectRoute,
  isPending,
}: {
  savedRoutes: RouteResponse[]
  selectedRoute: RouteResponse | null
  setSelectedRoute: (route: RouteResponse | null) => void
  setSelectedRouteId: (id: string | null) => void
  selectedRouteId: string | null
  selectRoute: (route: RouteResponse) => void
  isPending: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const map = useMap()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const getRouteItemClasses = (routeId: string) => {
    const baseClasses =
      'p-2 rounded-md cursor-pointer transition-all duration-200 border break-words'

    if (selectedRouteId === routeId) {
      return `${baseClasses} bg-blue-50 border-blue-400 transform scale-[1.01] shadow-sm`
    }

    return `${baseClasses} bg-gray-50 hover:bg-gray-100 border-gray-200`
  }

  // Add custom control on map mount
  useEffect(() => {
    if (!map || !containerRef.current) return

    // Create a Leaflet control
    const Control = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: function () {
        // Add margin to move control slightly to the right
        if (containerRef.current) {
          containerRef.current.style.marginRight = '8px'
          containerRef.current.style.marginTop = '8px'
        }
        return containerRef.current as HTMLElement
      },
    })

    const control = new Control()
    control.addTo(map)

    // Prevent map click events from propagating
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current)
      L.DomEvent.disableScrollPropagation(containerRef.current)
    }

    return () => {
      control.remove()
    }
  }, [map])

  // Container classes based on collapsed state
  const containerClasses = collapsed
    ? 'leaflet-control route-control-collapsed w-auto p-0'
    : 'leaflet-control route-control-expanded w-64 max-w-[250px]'

  return (
    <div
      ref={containerRef}
      className={`${containerClasses} absolute right-2 top-2 z-[1000] max-h-[60vh] overflow-y-auto rounded-md bg-white shadow-md transition-all duration-200`}
    >
      {collapsed ? (
        // Collapsed view - just a button to expand
        <button
          onClick={() => setCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white p-1 text-gray-600 hover:bg-gray-100"
          aria-label="Hiển thị danh sách lộ trình"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      ) : (
        // Expanded view
        <div className="">
          {/* Header with toggle button */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2">
            <h2 className="text-base font-bold text-black">
              {selectedRoute ? 'Chi tiết lộ trình' : 'Danh sách lộ trình'}
            </h2>
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Thu gọn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Body content */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {isPending ? (
              <></>
            ) : (
              <>
                {!selectedRoute ? (
                  // Danh sách routes với hiệu ứng chọn
                  <div className="space-y-1">
                    {savedRoutes.map((route, index) => (
                      <div
                        key={route._id || index}
                        className={getRouteItemClasses(route._id)}
                        onClick={() => selectRoute(route)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Chọn lộ trình ${route.name}`}
                        onKeyDown={(e) => e.key === 'Enter' && selectRoute(route)}
                      >
                        <div className="font-medium text-black">{route.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(route.createdAt).toLocaleDateString()}
                        </div>
                        <div className="mt-1">{renderStatusBadge(route.status)}</div>
                      </div>
                    ))}
                    {savedRoutes.length === 0 && (
                      <p className="text-center text-gray-500">Chưa có lộ trình nào được lưu</p>
                    )}
                  </div>
                ) : (
                  // Chi tiết route đã chọn
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedRoute(null)
                        setSelectedRouteId(null)
                      }}
                      className="mb-1 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
                      aria-label="Quay lại danh sách"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Quay lại danh sách
                    </button>
                    <div className="rounded-md border border-blue-400 bg-white p-2 shadow-sm">
                      <h3 className="mb-1 text-base font-bold text-black">{selectedRoute.name}</h3>
                      <p className="mb-2 text-xs text-gray-600">
                        {selectedRoute.description || 'Không có mô tả'}
                      </p>

                      <div className="mb-2">
                        <h4 className="mb-1 text-sm font-medium text-gray-700">Lộ trình đi qua:</h4>
                        <div className="space-y-1">
                          {selectedRoute.waypoints.map((waypoint, index) => (
                            <div
                              key={waypoint.id}
                              className="flex items-center gap-1 rounded-md bg-gray-50 p-1"
                              style={{ borderLeft: `3px solid ${COLORS[index % COLORS.length]}` }}
                            >
                              <span className="text-xs font-medium text-gray-700">
                                {index + 1}.
                              </span>
                              <span className="text-xs text-gray-600">{waypoint.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs">
                            {selectedRoute.waypoints.length} điểm dừng
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm sm:text-base">
                            Thời gian dự kiến: {selectedRoute.estimatedDuration} phút
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm sm:text-base">
                            Khoảng cách dự kiến: {selectedRoute.totalDistance} km
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 sm:gap-2">
                          <span className="text-sm font-medium sm:text-base">Trạng thái:</span>
                          {renderStatusBadge(selectedRoute.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateRoute({
  onRouteSelect,
  selectedRoute: propSelectedRoute,
}: CreateRouteProps) {
  const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424])
  // const [savedRoutes, setSavedRoutes] = useState<RouteResponse[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    propSelectedRoute || null
  )
  const [localSelectedRoute, setLocalSelectedRoute] = useState<RouteResponse | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const { data: savedRoutes, isPending } = useScenicRouteQuery({ status: ScenicRouteStatus.ACTIVE }) // Assuming this is a custom hook to fetch scenic routes
  // Load saved routes from API
  // useEffect(() => {
  //   const fetchRoutes = async () => {
  //     try {
  //       const routes = await routeService.getAllRoutes()
  //       console.log('Routes:', routes)
  //       // Filter to only include routes with 'active' status
  //       const activeRoutes = routes.filter(route => route.status === 'active')
  //       console.log('Active routes:', activeRoutes)

  //       setSavedRoutes(activeRoutes)
  //     } catch (error) {
  //       console.error('Failed to fetch routes:', error)
  //     }
  //   }
  //   fetchRoutes()
  // }, [])

  // Handle route selection
  const selectRoute = useCallback(
    (route: RouteResponse) => {
      console.log('Selected route data:', route)

      // Update selected route ID for highlighting
      setSelectedRouteId(route._id)

      // Update local state
      setLocalSelectedRoute(route)
      setSelectedRoute(route)

      // Notify parent component if callback exists
      if (onRouteSelect) {
        onRouteSelect(route)
      }
    },
    [onRouteSelect]
  )

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      // maxBounds={[
      //   [10.83, 106.83], // Tọa độ góc dưới bên trái
      //   [10.85, 106.86], // Tọa độ góc trên bên phải
      // ]}
      // maxBoundsViscosity={1.0}
      minZoom={13}
      maxZoom={19}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route list control inside map */}
      <RouteListControl
        savedRoutes={savedRoutes}
        selectedRoute={selectedRoute}
        setSelectedRoute={setSelectedRoute}
        setSelectedRouteId={setSelectedRouteId}
        selectedRouteId={selectedRouteId}
        selectRoute={selectRoute}
        isPending={isPending}
      />

      {selectedRoute && (
        <>
          <SavedRouteDisplay
            coordinates={selectedRoute.scenicRouteCoordinates.map((coord) =>
              L.latLng(coord.lat, coord.lng)
            )}
          />
          {selectedRoute.waypoints.map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              position={L.latLng(waypoint.position.lat, waypoint.position.lng)}
              icon={createCustomIcon({ color: COLORS[index % COLORS.length] })}
            >
              <Popup>{waypoint.name}</Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  )
}
