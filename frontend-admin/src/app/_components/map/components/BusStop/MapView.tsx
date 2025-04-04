import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Spin } from "antd";
import { BusStopWithColor, createBusStopIcon } from "../../busStopMap";
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

const createStartEndIcon = ({ color, label }: { color: string; label: string }) => {
  return L.divIcon({
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
};

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
      });

      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapCenter, onMapClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    let stopsToDisplay: BusStopWithColor[] = [];

    if (viewMode === "all") {
      stopsToDisplay = busStops;
    } else if (viewMode === "selected" && selectedBusStop) {
      stopsToDisplay = [selectedBusStop];
    } else if (viewMode === "route" && selectedBusRoute) {
      console.log("selectedBusRoute.stops:", selectedBusRoute.stops);
      console.log("busStops:", busStops);

      stopsToDisplay = selectedBusRoute.stops
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((stop) => {
          // Explicitly define the type of stopId
          const stopId: string | undefined =
            typeof stop.stopId === "string" ? stop.stopId : (stop.stopId as { _id: string })?._id;
          const matchedStop = busStops.find((bs) => bs._id === stopId);
          if (!matchedStop) {
            console.error(`Không tìm thấy điểm dừng với stopId: ${stopId}`);
          }
          return matchedStop;
        })
        .filter((stop): stop is BusStopWithColor => !!stop);

      if (stopsToDisplay.length === 0) {
        console.error("Không có điểm dừng nào được ánh xạ:", { selectedBusRoute, busStops });
      }

      if (selectedBusRoute.routeCoordinates.length > 1) {
        const latlngs = selectedBusRoute.routeCoordinates.map((coord) =>
          L.latLng(coord.lat, coord.lng)
        );
        routeLayerRef.current = L.polyline(latlngs, {
          color: "#2980b9",
          weight: 5,
          opacity: 0.9,
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
      } else if (stopsToDisplay.length >= 2) {
        setIsRoutingLoading(true);
        const waypoints = stopsToDisplay.map((stop) => stop.position);
        routingControlRef.current = L.Routing.control({
          waypoints,
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
          }),
          lineOptions: {
            styles: [{ color: "#2980b9", weight: 5, opacity: 0.9 }],
            extendToWaypoints: true,
            missingRouteTolerance: 5,
          },
          show: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          // createMarker: () => null,
        }).addTo(mapRef.current);

        routingControlRef.current.on("routesfound", () => {
          setIsRoutingLoading(false);
        });
        routingControlRef.current.on("routingerror", (err) => {
          setIsRoutingLoading(false);
          console.error("Lỗi khi tải tuyến đường:", err);
        });
      }
    }

    stopsToDisplay.forEach((stop, index) => {
      let marker: L.Marker;

      if (viewMode === "route" && stopsToDisplay.length > 1) {
        if (index === 0) {
          marker = L.marker(stop.position, {
            icon: createStartEndIcon({ color: "#27ae60", label: "Bắt đầu" }),
          });
        } else if (index === stopsToDisplay.length - 1) {
          marker = L.marker(stop.position, {
            icon: createStartEndIcon({ color: "#e74c3c", label: "Kết thúc" }),
          });
        } else {
          marker = L.marker(stop.position, {
            icon: createBusStopIcon({ color: "#2980b9" }),
          });
        }

        marker
          .addTo(mapRef.current!)
          .bindPopup(
            `<b>${stop.name}</b><br>${stop.address || "Không có địa chỉ"}<br>` +
              (index === 0
                ? "Điểm bắt đầu"
                : index === stopsToDisplay.length - 1
                ? "Điểm kết thúc"
                : `Điểm dừng thứ ${index + 1}`)
          )
          .on("click", () => onSelectBusStop(stop));
      } else {
        marker = L.marker(stop.position, {
          icon: createBusStopIcon({ color: stop.color }),
        })
          .addTo(mapRef.current!)
          .bindPopup(`<b>${stop.name}</b><br>${stop.address || "Không có địa chỉ"}`)
          .on("click", () => onSelectBusStop(stop));
      }

      markersRef.current.push(marker);
    });

    if (isCreatingBusStop && currentBusStop) {
      const marker = L.marker(currentBusStop.position, {
        icon: createBusStopIcon({ color: "#e67e22" }),
      })
        .addTo(mapRef.current!)
        .bindPopup(`<b>${currentBusStop.name}</b><br>${currentBusStop.address}`);
      markersRef.current.push(marker);
    }

    if (
      stopsToDisplay.length > 0 &&
      (!selectedBusRoute || selectedBusRoute.routeCoordinates.length <= 1)
    ) {
      const bounds = L.latLngBounds(stopsToDisplay.map((stop) => stop.position));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [
    busStops,
    selectedBusStop,
    selectedBusRoute,
    currentBusStop,
    isCreatingBusStop,
    viewMode,
    onSelectBusStop,
  ]);

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