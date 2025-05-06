"use client";
import { useState, useCallback, useEffect } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Button, Form, Spin, notification, Modal, Tabs } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Sidebar from "../common/Sidebar";
import {
  busStopService,
  BusStop,
  busRouteService,
  BusRouteWithStops,
} from "../../services/busServices";
import {
  categoryService,
  VehicleCategory,
} from "../../services/categoryServices";
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

const { TabPane } = Tabs;

export interface BusStopWithColor extends BusStop {
  color: string;
  position: L.LatLng;
}

interface RouteCoordinate {
  lat: number;
  lng: number;
}

interface BusStopFormValues {
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
const MAP_CENTER: L.LatLngTuple = [10.840405, 106.843424];

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

export const createBusStopIcon = ({ color }: { color: string }) =>
  L.divIcon({
    html: `
        <div class="relative inline-block">
            <div class="relative">
                <div class="absolute -inset-2 animate-ping rounded-full bg-primary-400 opacity-20"></div>
                <div class="relative rounded-full bg-white p-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-7">
                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                        <circle cx="12" cy="12" r="8" fill="white" />
                        <path d="M8 8h8v6H8z" fill="#22c55e"/>
                        <path d="M9 14h1.5v1.5H9zM13.5 14H15v1.5h-1.5z" fill="#22c55e"/>
                        <path d="M9 9h6v3H9z" fill="white"/>
                    </svg>
                </div>
            </div>
        </div>`,
    className: "bus-stop-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

export const getAddressFromCoordinates = async (
  latlng: L.LatLng
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    const data = await response.json();
    return (
      data.display_name?.split(",").slice(0, 3).join(", ") || "Không xác định"
    );
  } catch (error) {
    console.error("Error getting address:", error);
    return "Không xác định";
  }
};

export default function BusMap() {
  const [busStops, setBusStops] = useState<BusStopWithColor[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRouteWithStops[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(
    []
  );
  const [busRoutePricingConfig, setBusRoutePricingConfig] =
    useState<UpdateServiceConfigRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusStop, setSelectedBusStop] =
    useState<BusStopWithColor | null>(null);
  const [selectedBusRoute, setSelectedBusRoute] =
    useState<BusRouteWithStops | null>(null);
  const [isCreatingBusStop, setIsCreatingBusStop] = useState(false);
  const [currentBusStop, setCurrentBusStop] = useState<BusStopWithColor | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "selected" | "route">("all");
  const [isCreatingBusRoute, setIsCreatingBusRoute] = useState(false);
  const [activeTab, setActiveTab] = useState<"busStop" | "busRoute">("busStop");
  const [busStopForm] = Form.useForm();
  const [busRouteForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [stops, routes, categories, pricingConfig] = await Promise.all([
          busStopService.getAllBusStops(),
          busRouteService.getAllBusRoutes(),
          categoryService.getCategories(),
          priceManagementServices.getServiceConfig("booking_bus_route"),
        ]);

        setBusStops(
          stops.map((stop, i) => ({
            ...stop,
            position: L.latLng(stop.position.lat, stop.position.lng),
            color: COLORS[i % COLORS.length],
            status: stop.status || "active",
          }))
        );
        setBusRoutes(routes);
        setVehicleCategories(categories);
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
      setIsLoading(true);
      try {
        const address = await getAddressFromCoordinates(latlng);
        const newBusStop: BusStopWithColor = {
          _id: `temp-${Date.now()}`,
          name: "Điểm dừng mới",
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

  const saveBusStop = useCallback(
    async (values: BusStopFormValues) => {
      if (!currentBusStop) return;
      setIsLoading(true);
      try {
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

        if (
          isEditing &&
          currentBusStop._id &&
          !currentBusStop._id.startsWith("temp-")
        ) {
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
                    position: L.latLng(
                      updatedBusStop.position.lat,
                      updatedBusStop.position.lng
                    ),
                  }
                : stop
            )
          );
          notification.success({
            message: "Cập nhật thành công",
            description: `Điểm dừng "${values.name}" đã được cập nhật.`,
          });
        } else {
          const newBusStop = await busStopService.createBusStop(
            busStopData as BusStop
          );
          setBusStops((prev) => [
            ...prev,
            {
              ...newBusStop,
              color: currentBusStop.color,
              position: L.latLng(
                newBusStop.position.lat,
                newBusStop.position.lng
              ),
            },
          ]);
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
          description: `Không thể ${isEditing ? "cập nhật" : "tạo"} điểm dừng.`,
        });
        console.error("Error saving bus stop:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentBusStop, isEditing, busStopForm]
  );

  const calculateRouteData = async (stops: BusStopWithColor[]) => {
    if (stops.length < 2) return { coordinates: [], distance: 0, duration: 0 };
    const tempMap = L.map(document.createElement("div"));
    const waypoints = stops.map((stop) => stop.position);

    return new Promise<{
      coordinates: { lat: number; lng: number }[];
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
          missingRouteTolerance: 0,
        },
        show: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
      }).addTo(tempMap);

      // Sau đó, sửa đoạn code trong hàm calculateRouteData
      routingControl.on("routesfound", (e) => {
        const route = e.routes[0];
        resolve({
          coordinates: route.coordinates.map((coord: RouteCoordinate) => ({
            lat: coord.lat,
            lng: coord.lng,
          })),
          distance: Number((route.summary.totalDistance / 1000).toFixed(3)),
          duration: Number((route.summary.totalTime / 60).toFixed(3)),
        });
      });

      routingControl.on("routingerror", (err) =>
        reject(
          new Error("Không thể tính toán tuyến đường: " + JSON.stringify(err))
        )
      );
    });
  };

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
          description: "Không thể lấy cấu hình giá.",
        });
        return;
      }

      setIsLoading(true);
      try {
        const selectedStops = values.stopIds
          .map((id) => busStops.find((stop) => stop._id === id))
          .filter((stop): stop is BusStopWithColor => !!stop);

        if (selectedStops.length !== values.stopIds.length) {
          notification.error({
            message: "Lỗi",
            description: "Không tìm thấy một số điểm dừng.",
          });
          return;
        }

        const { coordinates, distance, duration } = await calculateRouteData(
          selectedStops
        );
        const stopsWithDetails = selectedStops.map((stop, index) => {
          let distanceFromStart = 0;
          if (index > 0 && coordinates.length) {
            const segment = coordinates.slice(
              0,
              coordinates.findIndex(
                (c) =>
                  c.lat === stop.position.lat && c.lng === stop.position.lng
              ) + 1
            );
            distanceFromStart = Number(
              segment
                .reduce((acc, coord, i) => {
                  if (i === 0) return acc;
                  const prev = segment[i - 1];
                  return (
                    acc +
                    L.latLng(prev.lat, prev.lng).distanceTo(
                      L.latLng(coord.lat, coord.lng)
                    ) /
                      1000
                  );
                }, 0)
                .toFixed(3)
            );
          }
          return {
            stopId: stop._id,
            orderIndex: index,
            distanceFromStart,
            estimatedTime: Number(((distanceFromStart * 60) / 40).toFixed(3)),
          };
        });

        const newRoute = await busRouteService.createBusRoute({
          name: values.name,
          description: values.description,
          stops: stopsWithDetails,
          routeCoordinates: coordinates,
          totalDistance: distance,
          estimatedDuration: duration,
          vehicleCategory: values.vehicleCategory,
          status: "active",
          pricingConfig: "booking_bus_route",
        });

        setBusRoutes((prev) => [...prev, newRoute]);
        notification.success({
          message: "Tạo thành công",
          description: `Tuyến "${values.name}" đã được tạo. Tổng khoảng cách: ${distance} km, Thời gian: ${duration} phút.`,
        });

        setIsCreatingBusRoute(false);
        busRouteForm.resetFields();
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tạo tuyến xe bus.",
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
      setIsLoading(true);
      try {
        await busStopService.deleteBusStop(busStop._id);
        setBusStops((prev) => prev.filter((stop) => stop._id !== busStop._id));
        if (selectedBusStop?._id === busStop._id) setSelectedBusStop(null);
        notification.success({
          message: "Xóa thành công",
          description: `Điểm dừng "${busStop.name}" đã được xóa.`,
        });
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể xóa điểm dừng.",
        });
        console.error("Error deleting bus stop:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBusStop]
  );

  const handleDeleteBusRoute = useCallback(
    async (busRoute: BusRouteWithStops) => {
      if (!busRoute._id) return;
      setIsLoading(true);
      try {
        await busRouteService.deleteBusRoute(busRoute._id);
        setBusRoutes((prev) =>
          prev.filter((route) => route._id !== busRoute._id)
        );
        if (selectedBusRoute?._id === busRoute._id) setSelectedBusRoute(null);
        notification.success({
          message: "Xóa thành công",
          description: `Tuyến "${busRoute.name}" đã được xóa.`,
        });
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể xóa tuyến xe bus.",
        });
        console.error("Error deleting bus route:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBusRoute]
  );

  const handleSelectBusRoute = useCallback((route: BusRouteWithStops) => {
    setSelectedBusRoute(route);
    setSelectedBusStop(null);
    setViewMode("route");
  }, []);

  const confirmAction = useCallback(
    (
      title: string,
      content: string,
      onOk: () => void,
      okText = "Xác nhận",
      okType?: "danger"
    ) =>
      Modal.confirm({
        title,
        content,
        onOk,
        okText,
        okType,
        cancelText: "Hủy",
      }),
    []
  );

  const handleConfirmSaveBusStop = useCallback(
    (values: BusStopFormValues) =>
      confirmAction(
        isEditing ? "Xác nhận cập nhật" : "Xác nhận tạo điểm dừng",
        `Bạn có chắc chắn muốn ${isEditing ? "cập nhật" : "tạo"} điểm dừng "${
          values.name
        }" không?`,
        () => saveBusStop(values)
      ),
    [isEditing, saveBusStop]
  );

  const handleConfirmSaveBusRoute = useCallback(
    (values: {
      name: string;
      description?: string;
      stopIds: string[];
      vehicleCategory: string;
    }) =>
      confirmAction(
        "Xác nhận tạo tuyến",
        `Bạn có chắc chắn muốn tạo tuyến "${values.name}" không?`,
        () => handleSaveBusRoute(values)
      ),
    [handleSaveBusRoute]
  );

  const toggleViewMode = useCallback(
    () => setViewMode((prev) => (prev === "all" ? "selected" : "all")),
    []
  );

  const renderBusStopContent = () => {
    if (isCreatingBusStop || isEditing) {
      return (
        <BusStopForm
          form={busStopForm}
          isEditing={isEditing}
          isLoading={isLoading}
          onFinish={handleConfirmSaveBusStop}
          currentBusStop={currentBusStop}
        />
      );
    }

    return (
      <>
        {selectedBusStop && (
          <Button
            type="default"
            block
            onClick={toggleViewMode}
            style={{
              borderRadius: "6px",
              backgroundColor: "#ecf0f1",
              borderColor: "#bdc3c7",
              marginBottom: "16px",
            }}
          >
            {viewMode === "selected"
              ? "Xem tất cả điểm dừng"
              : "Chỉ xem điểm dừng đã chọn"}
          </Button>
        )}
        <h3
          className="text-lg font-semibold mb-2"
          style={{
            color: "#e67e22",
            borderBottom: "2px solid #e67e22",
            paddingBottom: "4px",
          }}
        >
          Danh sách điểm dừng
        </h3>
        <BusStopList
          busStops={busStops}
          selectedBusStop={selectedBusStop}
          isLoading={isLoading}
          onSelectBusStop={handleSelectBusStop}
          onEditBusStop={handleEditBusStop}
          onDeleteBusStop={(busStop) =>
            confirmAction(
              "Xác nhận xóa",
              `Bạn có chắc chắn muốn xóa điểm dừng "${busStop.name}" không?`,
              () => handleDeleteBusStop(busStop),
              "Xóa",
              "danger"
            )
          }
        />
      </>
    );
  };

  const renderBusRouteContent = () => {
    if (isCreatingBusRoute) {
      return (
        <BusRouteForm
          form={busRouteForm}
          isLoading={isLoading}
          busStops={busStops}
          vehicleCategories={vehicleCategories}
          busRoutePricingConfig={busRoutePricingConfig}
          onFinish={handleConfirmSaveBusRoute}
        />
      );
    }

    return (
      <>
        {selectedBusRoute ? (
          <Button
            type="default"
            block
            onClick={() => {
              setSelectedBusRoute(null);
              setViewMode("all");
            }}
            style={{
              borderRadius: "6px",
              backgroundColor: "#ecf0f1",
              borderColor: "#bdc3c7",
              marginBottom: "16px",
            }}
          >
            Quay lại danh sách tuyến
          </Button>
        ) : (
          <>
            <h3
              className="text-lg font-semibold mb-2"
              style={{
                color: "#2980b9",
                borderBottom: "2px solid #2980b9",
                paddingBottom: "4px",
              }}
            >
              Danh sách tuyến xe bus
            </h3>
            <BusRouteList
              busRoutes={busRoutes}
              isLoading={isLoading}
              onSelectBusRoute={handleSelectBusRoute}
              onDeleteBusRoute={(busRoute) =>
                confirmAction(
                  "Xác nhận xóa",
                  `Bạn có chắc chắn muốn xóa tuyến "${busRoute.name}" không?`,
                  () => handleDeleteBusRoute(busRoute),
                  "Xóa",
                  "danger"
                )
              }
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="h-screen flex" style={{ fontFamily: "Arial, sans-serif" }}>
      <Sidebar />
      <div
        className="w-80 bg-white shadow-md p-4 overflow-y-auto"
        style={{ borderRadius: "8px" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{
              color: selectedBusRoute
                ? "#2980b9"
                : isCreatingBusRoute || isCreatingBusStop
                ? "#e67e22"
                : "#333",
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
        </div>
        {isLoading && (
          <div className="flex justify-center my-4">
            <Spin tip="Đang xử lý..." />
          </div>
        )}

        <div className="space-y-2 mb-4">
          {activeTab === "busStop" && !isCreatingBusRoute && (
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
              icon={
                isCreatingBusStop ? <ArrowLeftOutlined /> : <PlusOutlined />
              }
              style={{ borderRadius: "6px", width: "100%" }}
            >
              {isCreatingBusStop ? "Quay lại" : "Thêm điểm dừng"}
            </Button>
          )}
          {activeTab === "busRoute" && !isCreatingBusStop && (
            <Button
              type={isCreatingBusRoute ? "default" : "primary"}
              onClick={() => {
                setIsCreatingBusRoute(!isCreatingBusRoute);
                busRouteForm.resetFields();
              }}
              icon={
                isCreatingBusRoute ? <ArrowLeftOutlined /> : <PlusOutlined />
              }
              style={{ borderRadius: "6px", width: "100%" }}
            >
              {isCreatingBusRoute ? "Quay lại" : "Thêm tuyến"}
            </Button>
          )}
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "busStop" | "busRoute")}
          tabBarStyle={{ marginBottom: 16 }}
        >
          <TabPane
            key="busStop"
            tab={
              <span style={{ padding: "8px 16px", borderRadius: "16px" }}>
                Trạm Bus
              </span>
            }
          >
            {renderBusStopContent()}
          </TabPane>
          <TabPane
            key="busRoute"
            tab={
              <span style={{ padding: "8px 16px", borderRadius: "16px" }}>
                Tuyến Bus
              </span>
            }
          >
            {renderBusRouteContent()}
          </TabPane>
        </Tabs>
      </div>
      <div className="flex-grow">
        <MapView
          mapCenter={MAP_CENTER}
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
