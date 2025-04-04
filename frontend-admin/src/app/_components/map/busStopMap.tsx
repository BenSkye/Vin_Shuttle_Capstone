"use client";
import { useState, useCallback, useEffect } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Button, Form, Spin, notification, Modal } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Sidebar from "../common/Sidebar";
import {
  busStopService,
  BusStop,
  busRouteService,
  BusRouteWithStops,
} from "../../services/busServices";
import { categoryService, VehicleCategory } from "../../services/categoryServices";
import {
  priceManagementServices,
  UpdateServiceConfigRequest,
} from "../../services/priceConfigServices";
import MapView from "./components/BusStop/MapView";
import BusStopList from "./components/BusStop/BusStopList";
import BusStopForm from "./components/BusStop/BusStopForm";
import BusRouteList from "./components/BusRoute/BusRouteList";
import BusRouteForm from "./components/BusRoute/BusRouteForm";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";


export interface BusStopWithColor extends BusStop {
  color: string;
  position: L.LatLng;
}

export interface BusStopFormValues {
  name: string;
  description?: string;
  status: "active" | "inactive" | "maintenance";
  address?: string;
}

const COLORS = [
  "#2ecc71",
  "#e74c3c",
  "#f1c40f",
  "#9b59b6",
  "#3498db",
  "#e67e22",
  "#1abc9c",
  "#34495e",
];

export const createBusStopIcon = ({ color }: { color: string }) => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
            <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
        </svg>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
  { value: "maintenance", label: "Đang bảo trì" },
];

export const getAddressFromCoordinates = async (
  latlng: L.LatLng
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    const data = await response.json();
    const addressParts = data.display_name ? data.display_name.split(",") : [];
    return addressParts.slice(0, 3).join(", ") || "Không xác định";
  } catch (error) {
    console.error("Error getting address:", error);
    return "Không xác định";
  }
};

export default function BusMap() {
  const [busStops, setBusStops] = useState<BusStopWithColor[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRouteWithStops[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  const [busRoutePricingConfig, setBusRoutePricingConfig] = useState<UpdateServiceConfigRequest | null>(null);
  const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusStop, setSelectedBusStop] = useState<BusStopWithColor | null>(null);
  const [selectedBusRoute, setSelectedBusRoute] = useState<BusRouteWithStops | null>(null);
  const [isCreatingBusStop, setIsCreatingBusStop] = useState(false);
  const [currentBusStop, setCurrentBusStop] = useState<BusStopWithColor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "selected" | "route">("all");
  const [isCreatingBusRoute, setIsCreatingBusRoute] = useState(false);
  const [busStopForm] = Form.useForm();
  const [busRouteForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const stops = await busStopService.getAllBusStops();
        const stopsWithColor = stops.map((stop, index) => ({
          ...stop,
          position: L.latLng(stop.position.lat, stop.position.lng),
          color: COLORS[index % COLORS.length],
          status: stop.status || "active",
        }));
        setBusStops(stopsWithColor);

        const routes = await busRouteService.getAllBusRoutes();
        setBusRoutes(routes);

        const categories = await categoryService.getCategories();
        setVehicleCategories(categories);

        const pricingConfig = await priceManagementServices.getServiceConfig("booking_bus_route");
        setBusRoutePricingConfig(pricingConfig);
      } catch (error) {
        notification.error({
          message: "Không thể tải dữ liệu",
          description: "Đã xảy ra lỗi khi tải dữ liệu.",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMapClick = useCallback(
    async (latlng: L.LatLng) => {
      if (!isCreatingBusStop) return;

      try {
        setIsLoading(true);
        const address = await getAddressFromCoordinates(latlng);

        const newBusStop: BusStopWithColor = {
          _id: `temp-${Date.now()}`,
          name: `Điểm dừng mới`,
          description: "",
          address,
          position: latlng,
          status: "active",
          color: COLORS[busStops.length % COLORS.length],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setCurrentBusStop(newBusStop);
        busStopForm.setFieldsValue({
          name: newBusStop.name,
          description: "",
          status: "active",
          address,
        });
      } catch (error) {
        console.error("Error creating new bus stop:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [busStops.length, busStopForm, isCreatingBusStop]
  );

  const handleSelectBusStop = useCallback((busStop: BusStopWithColor) => {
    setSelectedBusStop(busStop);
    setSelectedBusRoute(null);
    setIsCreatingBusStop(false);
    setViewMode("selected");
  }, []);

  const handleEditBusStop = useCallback(
    (busStop: BusStopWithColor) => {
      setIsEditing(true);
      setCurrentBusStop(busStop);
      busStopForm.setFieldsValue({
        name: busStop.name,
        description: busStop.description,
        status: busStop.status,
        address: busStop.address,
      });
    },
    [busStopForm]
  );

  const handleSaveBusStop = useCallback(
    async (values: BusStopFormValues) => {
      if (!currentBusStop) return;

      try {
        setIsLoading(true);

        const busStopData = {
          name: values.name,
          description: values.description,
          status: values.status,
          address: values.address,
          position: {
            lat: currentBusStop.position.lat,
            lng: currentBusStop.position.lng,
          },
        };

        if (isEditing && currentBusStop._id && !currentBusStop._id.startsWith("temp-")) {
          const updatedBusStop = await busStopService.updateBusStop(
            currentBusStop._id,
            busStopData
          );
          setBusStops((prev) =>
            prev.map((stop) =>
              stop._id === currentBusStop._id
                ? {
                    ...updatedBusStop,
                    color: currentBusStop.color,
                    position: L.latLng(updatedBusStop.position.lat, updatedBusStop.position.lng),
                  }
                : stop
            )
          );
          notification.success({
            message: "Cập nhật thành công",
            description: `Điểm dừng "${values.name}" đã được cập nhật.`,
          });
        } else {
          const newBusStop = await busStopService.createBusStop(busStopData as BusStop);
          const newBusStopWithColor: BusStopWithColor = {
            ...newBusStop,
            color: currentBusStop.color,
            position: L.latLng(newBusStop.position.lat, newBusStop.position.lng),
          };
          setBusStops((prev) => [...prev, newBusStopWithColor]);
          notification.success({
            message: "Tạo thành công",
            description: `Điểm dừng "${values.name}" đã được tạo.`,
          });
        }

        setCurrentBusStop(null);
        setIsEditing(false);
        setIsCreatingBusStop(false);
        busStopForm.resetFields();
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: `Không thể ${isEditing ? "cập nhật" : "tạo"} điểm dừng. Vui lòng thử lại.`,
        });
        console.error("Error saving bus stop:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentBusStop, isEditing, busStopForm]
  );

// Thêm import L nếu chưa có


// Trong component BusMap
const handleSaveBusRoute = useCallback(
  async (values: {
    name: string;
    description?: string;
    stopIds: string[];
    vehicleCategory: string;
  }) => {
    if (!busRoutePricingConfig) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy cấu hình giá cho tuyến xe bus.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Lấy các điểm dừng được chọn theo thứ tự
      const selectedStops = values.stopIds.map((stopId) =>
        busStops.find((stop) => stop._id === stopId)
      ).filter((stop): stop is BusStopWithColor => !!stop);

      if (selectedStops.length !== values.stopIds.length) {
        notification.error({
          message: "Lỗi",
          description: "Không tìm thấy một số điểm dừng được chọn.",
        });
        return;
      }

      // Tạo một bản đồ tạm thời để tính toán tuyến đường bằng OSRM
      const tempMap = L.map(document.createElement("div")); // Tạo map ẩn
      let routeCoordinates: { lat: number; lng: number }[] = [];
      let totalDistance = 0;
      let estimatedDuration = 0;

      if (selectedStops.length >= 2) {
        const waypoints = selectedStops.map((stop) => stop.position);

        // Sử dụng Promise để chờ kết quả từ OSRM
        const routeData = await new Promise<{
          coordinates: L.LatLng[];
          distance: number;
          duration: number;
        }>((resolve, reject) => {
          const routingControl = L.Routing.control({
            waypoints,
            router: L.Routing.osrmv1({
              serviceUrl: "https://router.project-osrm.org/route/v1",
            }),
            lineOptions: {
              styles: [{ color: "#3498db", weight: 6, opacity: 0.9 }],
              extendToWaypoints: false,
              missingRouteTolerance: 0
            },
            show: false,
            addWaypoints: false,
            fitSelectedRoutes: false,
            // createMarker: () => null,
          }).addTo(tempMap);

          routingControl.on("routesfound", (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
              resolve({
                coordinates: routes[0].coordinates,
                distance: Number((routes[0].summary.totalDistance / 1000).toFixed(3)), // km
                duration: Number((routes[0].summary.totalTime / 60).toFixed(3)), // phút
              });
            }
          });

          routingControl.on("routingerror", (err) => {
            reject(new Error("Không thể tính toán tuyến đường: " + JSON.stringify(err)));
          });
        });

        // Gán dữ liệu từ OSRM
        routeCoordinates = routeData.coordinates.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));
        totalDistance = routeData.distance;
        estimatedDuration = routeData.duration;
      }

      // Tính toán stopsWithDetails dựa trên dữ liệu từ OSRM
      const stopsWithDetails = selectedStops.map((stop, index) => {
        let distanceFromStart = 0;
        let estimatedTime = 0;

        if (index > 0 && routeCoordinates.length > 0) {
          // Tính khoảng cách từ điểm đầu dựa trên routeCoordinates
          const segment = routeCoordinates.slice(
            0,
            routeCoordinates.findIndex((coord) =>
              coord.lat === stop.position.lat && coord.lng === stop.position.lng
            ) + 1
          );
          distanceFromStart = segment.reduce((acc, coord, i) => {
            if (i === 0) return acc;
            const prev = segment[i - 1];
            return acc + L.latLng(prev.lat, prev.lng).distanceTo(L.latLng(coord.lat, coord.lng)) / 1000;
          }, 0);
          distanceFromStart = Number(distanceFromStart.toFixed(3));
          estimatedTime = Number(((distanceFromStart * 60) / 40).toFixed(3)); // Giả định tốc độ 40 km/h
        }

        return {
          stopId: stop._id,
          orderIndex: index,
          distanceFromStart,
          estimatedTime,
        };
      });

      // Dữ liệu tuyến mới
      const newRouteData = {
        name: values.name,
        description: values.description,
        stops: stopsWithDetails,
        routeCoordinates,
        totalDistance,
        estimatedDuration,
        vehicleCategory: values.vehicleCategory,
        status: "active",
        pricingConfig: "booking_bus_route",
      };

      const newRoute = await busRouteService.createBusRoute(newRouteData);
      setBusRoutes((prev) => [...prev, newRoute]);
      notification.success({
        message: "Tạo thành công",
        description: `Tuyến xe bus "${values.name}" đã được tạo. Tổng khoảng cách: ${totalDistance} km, Thời gian dự kiến: ${estimatedDuration} phút.`,
      });

      setIsCreatingBusRoute(false);
      busRouteForm.resetFields();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tạo tuyến xe bus. Vui lòng thử lại.",
      });
      console.error("Error creating bus route:", error);
    } finally {
      setIsLoading(false);
    }
  },
  [busStops, busRouteForm, busRoutePricingConfig]
);

  const handleDeleteBusStop = useCallback(
    async (busStop: BusStopWithColor) => {
      if (!busStop._id || busStop._id.startsWith("temp-")) return;

      try {
        setIsLoading(true);
        await busStopService.deleteBusStop(busStop._id);
        setBusStops((prev) => prev.filter((stop) => stop._id !== busStop._id));

        if (selectedBusStop && selectedBusStop._id === busStop._id) {
          setSelectedBusStop(null);
        }

        notification.success({
          message: "Xóa thành công",
          description: `Điểm dừng "${busStop.name}" đã được xóa.`,
        });
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể xóa điểm dừng. Vui lòng thử lại.",
        });
        console.error("Error deleting bus stop:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBusStop]
  );

  const handleSelectBusRoute = useCallback((route: BusRouteWithStops) => {
    setSelectedBusRoute(route);
    setSelectedBusStop(null);
    setViewMode("route");
  }, []);

  const handleConfirmSaveBusStop = useCallback(
    (values: BusStopFormValues) => {
      Modal.confirm({
        title: isEditing ? "Xác nhận cập nhật" : "Xác nhận tạo điểm dừng",
        content: isEditing
          ? `Bạn có chắc chắn muốn cập nhật điểm dừng "${values.name}" không?`
          : `Bạn có chắc chắn muốn tạo điểm dừng "${values.name}" không?`,
        onOk: () => handleSaveBusStop(values),
        okText: "Xác nhận",
        cancelText: "Hủy",
      });
    },
    [handleSaveBusStop, isEditing]
  );

  const handleConfirmSaveBusRoute = useCallback(
    (values: {
      name: string;
      description?: string;
      stopIds: string[];
      vehicleCategory: string;
    }) => {
      Modal.confirm({
        title: "Xác nhận tạo tuyến",
        content: `Bạn có chắc chắn muốn tạo tuyến "${values.name}" không?`,
        onOk: () => handleSaveBusRoute(values),
        okText: "Xác nhận",
        cancelText: "Hủy",
      });
    },
    [handleSaveBusRoute]
  );

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "all" ? "selected" : "all"));
    setSelectedBusRoute(null);
  }, []);

  return (
    <div className="h-screen flex" style={{ fontFamily: "Arial, sans-serif" }}>
      <Sidebar />
      <div className="w-80 bg-white shadow-md p-4 overflow-y-auto" style={{ borderRadius: "8px" }}>
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{
              color: selectedBusRoute ? "#2980b9" : isCreatingBusRoute || isCreatingBusStop ? "#e67e22" : "#333",
            }}
          >
            {isCreatingBusRoute
              ? "Tạo tuyến xe bus mới"
              : isCreatingBusStop
              ? "Tạo điểm dừng mới"
              : selectedBusRoute
              ? `Tuyến: ${selectedBusRoute.name}`
              : "Quản lý xe bus"}
          </h2>
          <div className="space-x-2">
            {!isCreatingBusRoute && (
              <Button
                type={isCreatingBusStop ? "default" : "primary"}
                onClick={() => {
                  setIsCreatingBusStop(!isCreatingBusStop);
                  setCurrentBusStop(null);
                  setSelectedBusStop(null);
                  setIsEditing(false);
                  setViewMode("all");
                  busStopForm.resetFields();
                }}
                icon={isCreatingBusStop ? <ArrowLeftOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {isCreatingBusStop ? "Quay lại" : "Thêm điểm dừng"}
              </Button>
            )}
            {!isCreatingBusStop && (
              <Button
                type={isCreatingBusRoute ? "default" : "primary"}
                onClick={() => {
                  setIsCreatingBusRoute(!isCreatingBusRoute);
                  busRouteForm.resetFields();
                }}
                icon={isCreatingBusRoute ? <ArrowLeftOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px", marginLeft: "0px", marginTop: "10px" }}
              >
                {isCreatingBusRoute ? "Quay lại" : "Thêm tuyến"}
              </Button>
            )}
          </div>
        </div>

        {!isCreatingBusStop && !isCreatingBusRoute && (
          <div className="mb-6">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "#2980b9", borderBottom: "2px solid #2980b9", paddingBottom: "4px" }}
            >
              Danh sách tuyến xe bus
            </h3>
            <BusRouteList busRoutes={busRoutes} isLoading={isLoading} onSelectBusRoute={handleSelectBusRoute} />
          </div>
        )}

        {isCreatingBusRoute ? (
          <BusRouteForm
            form={busRouteForm}
            isLoading={isLoading}
            busStops={busStops}
            vehicleCategories={vehicleCategories}
            busRoutePricingConfig={busRoutePricingConfig}
            onFinish={handleConfirmSaveBusRoute}
          />
        ) : (
          <>
            {selectedBusRoute ? (
              <div className="mb-4">
                <Button
                  type="default"
                  block
                  onClick={() => {
                    setSelectedBusRoute(null);
                    setViewMode("all");
                  }}
                  style={{ borderRadius: "6px", backgroundColor: "#ecf0f1", borderColor: "#bdc3c7" }}
                >
                  Quay lại danh sách tuyến
                </Button>
              </div>
            ) : !isCreatingBusStop && selectedBusStop ? (
              <div className="mb-4">
                <Button
                  type="default"
                  block
                  onClick={toggleViewMode}
                  style={{ borderRadius: "6px", backgroundColor: "#ecf0f1", borderColor: "#bdc3c7" }}
                >
                  {viewMode === "selected" ? "Xem tất cả điểm dừng" : "Chỉ xem điểm dừng đã chọn"}
                </Button>
              </div>
            ) : null}

            {isLoading && (
              <div className="flex justify-center my-4">
                <Spin tip="Đang xử lý..." />
              </div>
            )}

            {isCreatingBusStop || isEditing ? (
              <BusStopForm
                form={busStopForm}
                isEditing={isEditing}
                isLoading={isLoading}
                onFinish={handleConfirmSaveBusStop}
                currentBusStop={currentBusStop}
              />
            ) : (
              <>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#e67e22", borderBottom: "2px solid #e67e22", paddingBottom: "4px" }}
                >
                  Danh sách điểm dừng
                </h3>
                <BusStopList
                  busStops={busStops}
                  selectedBusStop={selectedBusStop}
                  isLoading={isLoading}
                  onSelectBusStop={handleSelectBusStop}
                  onEditBusStop={handleEditBusStop}
                  onDeleteBusStop={(busStop) => {
                    Modal.confirm({
                      title: "Xác nhận xóa",
                      content: `Bạn có chắc chắn muốn xóa điểm dừng "${busStop.name}" không?`,
                      okText: "Xóa",
                      okType: "danger",
                      cancelText: "Hủy",
                      onOk: () => handleDeleteBusStop(busStop),
                    });
                  }}
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="flex-grow">
        <MapView
          mapCenter={mapCenter}
          busStops={busStops}
          selectedBusStop={selectedBusStop}
          selectedBusRoute={selectedBusRoute}
          currentBusStop={currentBusStop}
          isCreatingBusStop={isCreatingBusStop}
          createBusStopIcon={createBusStopIcon}
          onMapClick={handleMapClick}
          onSelectBusStop={handleSelectBusStop}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}