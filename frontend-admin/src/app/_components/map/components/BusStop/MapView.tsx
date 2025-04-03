import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BusStopWithColor } from "../../busStopMap";
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

    let stopsToDisplay: BusStopWithColor[] = [];

    if (viewMode === "all") {
      stopsToDisplay = busStops;
    } else if (viewMode === "selected" && selectedBusStop) {
      stopsToDisplay = [selectedBusStop];
    } else if (viewMode === "route" && selectedBusRoute) {
      stopsToDisplay = selectedBusRoute.stops
        .map((stop) => busStops.find((bs) => bs._id === stop.stopId))
        .filter((stop): stop is BusStopWithColor => !!stop);

      if (selectedBusRoute.routeCoordinates.length > 1) {
        const latlngs = selectedBusRoute.routeCoordinates.map((coord) =>
          L.latLng(coord.lat, coord.lng)
        );
        routeLayerRef.current = L.polyline(latlngs, {
          color: "#2980b9",
          weight: 5,
          opacity: 0.8,
          dashArray: "10, 5",
        }).addTo(mapRef.current);
      }
    }

    stopsToDisplay.forEach((stop, index) => {
      const marker = L.marker(stop.position, {
        icon: createBusStopIcon({ color: viewMode === "route" ? "#2980b9" : stop.color }),
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<b>${stop.name}</b><br>${stop.address || "Không có địa chỉ"}<br>${
            viewMode === "route" ? `Điểm dừng thứ ${index + 1}` : ""
          }`
        )
        .on("click", () => onSelectBusStop(stop));
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

    if (stopsToDisplay.length > 0) {
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

  return <div id="map" style={{ height: "100%", width: "100%" }} />;
};

export default MapView;