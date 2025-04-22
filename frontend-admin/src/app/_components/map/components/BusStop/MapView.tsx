"use client";
import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Spin } from "antd";
import type { BusStopWithColor } from "../../busStopMap";
import { BusRouteWithStops } from "../../../../services/busServices";

interface MapViewProps {
  mapCenter: L.LatLngTuple;
  busStops: BusStopWithColor[];
  selectedBusStop: BusStopWithColor | null;
  selectedBusRoute: BusRouteWithStops | null;
  currentBusStop: BusStopWithColor | null;
  isCreatingBusStop: boolean;
  createBusStopIcon: (options: { color: string }) => L.DivIcon;
  onMapClick: (latlng: L.LatLng) => void;
  onSelectBusStop: (busStop: BusStopWithColor) => void;
  viewMode: "all" | "selected" | "route";
}

const createStartEndIcon = ({ color, label }: { color: string; label: string }) =>
  L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40px" height="40px">
        <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
      </svg>
      <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: ${color}; color: white; padding: 2px 6px; borderRadius: 4px; font-size: 12px; font-weight: bold;">${label}</div>
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

const MapView = ({
  mapCenter,
  busStops,
  selectedBusStop,
  selectedBusRoute,
  currentBusStop,
  isCreatingBusStop,
  createBusStopIcon,
  onMapClick,
  onSelectBusStop,
  viewMode,
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: mapCenter,
        zoom: 13,
        layers: [
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }),
        ],
      }).on("click", (e: L.LeafletMouseEvent) => onMapClick(e.latlng));
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapCenter, onMapClick]);

  // Xóa các layer cũ
  const clearLayers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    if (routingControlRef.current) {
      mapRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  };

  // Tạo marker cho điểm dừng
  const createMarker = (stop: BusStopWithColor, index: number, stopsToDisplay: BusStopWithColor[]) => {
    const isRouteMode = viewMode === "route" && stopsToDisplay.length > 1;
    const icon = isRouteMode
      ? index === 0
        ? createStartEndIcon({ color: "#27ae60", label: "Bắt đầu" })
        : index === stopsToDisplay.length - 1
        ? createStartEndIcon({ color: "#e74c3c", label: "Kết thúc" })
        : createBusStopIcon({ color: "#2980b9" })
      : createBusStopIcon({ color: stop.color });

    const popupContent = isRouteMode
      ? `<b>${stop.name}</b><br>${stop.address || "Không có địa chỉ"}<br>${
          index === 0 ? "Điểm bắt đầu" : index === stopsToDisplay.length - 1 ? "Điểm kết thúc" : `Điểm dừng thứ ${index + 1}`
        }`
      : `<b>${stop.name}</b><br>${stop.address || "Không có địa chỉ"}`;

    const marker = L.marker(stop.position, { icon })
      .addTo(mapRef.current!)
      .bindPopup(popupContent)
      .on("click", () => onSelectBusStop(stop));

    markersRef.current.push(marker);
  };

  // Cập nhật bản đồ
  useEffect(() => {
    if (!mapRef.current) return;

    clearLayers();

    // Xác định danh sách điểm dừng cần hiển thị
    let stopsToDisplay: BusStopWithColor[] = [];
    if (viewMode === "all") {
      stopsToDisplay = busStops;
    } else if (viewMode === "selected" && selectedBusStop) {
      stopsToDisplay = [selectedBusStop];
    } else if (viewMode === "route" && selectedBusRoute) {
      stopsToDisplay = selectedBusRoute.stops
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((stop) => {
          const stopId = typeof stop.stopId === "string" ? stop.stopId : (stop.stopId as { _id: string })?._id;
          return busStops.find((bs) => bs._id === stopId);
        })
        .filter((stop): stop is BusStopWithColor => !!stop);
    }

    // Thêm marker cho các điểm dừng
    stopsToDisplay.forEach((stop, index) => createMarker(stop, index, stopsToDisplay));

    // Thêm marker cho điểm dừng đang tạo
    if (isCreatingBusStop && currentBusStop) {
      const marker = L.marker(currentBusStop.position, { icon: createBusStopIcon({ color: "#e67e22" }) })
        .addTo(mapRef.current!)
        .bindPopup(`<b>${currentBusStop.name}</b><br>${currentBusStop.address}`);
      markersRef.current.push(marker);
    }

    // Hiển thị tuyến đường
    if (viewMode === "route" && selectedBusRoute) {
      if (selectedBusRoute.routeCoordinates.length > 1) {
        const latlngs = selectedBusRoute.routeCoordinates.map((coord) => L.latLng(coord.lat, coord.lng));
        routeLayerRef.current = L.polyline(latlngs, { color: "#2980b9", weight: 5, opacity: 0.9 }).addTo(mapRef.current);
        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
      } else if (stopsToDisplay.length >= 2) {
        setIsRoutingLoading(true);
        routingControlRef.current = L.Routing.control({
          waypoints: stopsToDisplay.map((stop) => stop.position),
          router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
          lineOptions: { styles: [{ color: "#2980b9", weight: 5, opacity: 0.9 }], extendToWaypoints: true, missingRouteTolerance: 5 },
          show: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
        })
          .addTo(mapRef.current)
          .on("routesfound", () => setIsRoutingLoading(false))
          .on("routingerror", (err) => {
            setIsRoutingLoading(false);
            console.error("Lỗi khi tải tuyến đường:", err);
          });
      }
    }

    // Điều chỉnh khung nhìn bản đồ
    if (stopsToDisplay.length > 0 && (!selectedBusRoute || selectedBusRoute?.routeCoordinates.length <= 1)) {
      const bounds = L.latLngBounds(stopsToDisplay.map((stop) => stop.position));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [busStops, selectedBusStop, selectedBusRoute, currentBusStop, isCreatingBusStop, viewMode, onSelectBusStop]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />
      {isRoutingLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.8)",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <Spin tip="Đang tải tuyến đường..." />
        </div>
      )}
    </div>
  );
};

export default MapView;