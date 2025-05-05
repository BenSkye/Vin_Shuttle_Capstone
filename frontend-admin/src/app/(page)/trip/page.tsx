"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Table,
  Input,
  DatePicker,
  Select,
  Button,
  App,
  Spin,
  Tag,
  
  Card,
  Statistic,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { getTripList, getTotalAmount } from "../../services/tripServices";
import { Trip } from "../../services/interface";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Sidebar from "../../_components/common/Sidebar";

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TripHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loadingTotal, setLoadingTotal] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Memoize applyFilters to prevent infinite loop
  const applyFilters = useCallback(() => {
    let result = [...trips];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((trip) => {
        const customerName = trip.customerId?.name?.toLowerCase() || "";
        const customerPhone = trip.customerId?.phone?.toLowerCase() || "";
        const driverName = trip.driverId?.name?.toLowerCase() || "";
        const driverPhone = trip.driverId?.phone?.toLowerCase() || "";

        return (
          customerName.includes(query) ||
          customerPhone.includes(query) ||
          driverName.includes(query) ||
          driverPhone.includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((trip) => trip.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      result = result.filter((trip) => {
        const tripDate = trip.timeStart
          ? dayjs(trip.timeStart)
          : dayjs(trip.timeStartEstimate);

        return tripDate.isAfter(startDate) && tripDate.isBefore(endDate);
      });
    }

    setFilteredTrips(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [trips, searchQuery, statusFilter, dateRange]);

  useEffect(() => {
    fetchTrips();
    fetchTotalAmount();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getTripList();
      setTrips(data);
      setFilteredTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalAmount = async () => {
    setLoadingTotal(true);
    try {
      const amount = await getTotalAmount();
      setTotalAmount(amount);
    } catch (error) {
      console.error("Failed to fetch total amount:", error);
    } finally {
      setLoadingTotal(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    setDateRange(dates || [null, null]);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(undefined);
    setDateRange([null, null]);
    setFilteredTrips(trips);
  };

  // Render the status tag with appropriate color
  const renderStatus = (status: string) => {
    let color = "";
    let text = status;

    switch (status) {
      case "booking":
        color = "blue";
        text = "Đặt xe";
        break;
      case "confirmed":
        color = "purple";
        text = "Đã xác  nhận";
        break;
      case "pickup":
        color = "orange";
        text = "Đón khách";
        break;
      case "in_progress":
        color = "gold";
        text = "Đang di chuyển";
        break;
      case "completed":
        color = "green";
        text = "Hoàn thành";
        break;
      case "cancelled":
        color = "red";
        text = "Đã hủy chuyến";
        break;
      case "dropped_off":
        color = "red";
        text = "Hủy bỏ";
        break;
      default:
        color = "default";
    }

    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<Trip> = [
    {
      title: "Mã chuyến xe",
      dataIndex: "code",
      key: "code",
      width: 100,
      ellipsis: true,
      render: (code) => <span className="text-xs">{code}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: ["customerId", "name"],
      key: "customer",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {record.customerId?.phone || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Tài xế",
      dataIndex: ["driverId", "name"],
      key: "driver",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name || "Chưa phân công"}</div>
          {record.driverId?.phone && (
            <div className="text-xs text-gray-500">{record.driverId.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: "Tên phương tiện",
      dataIndex: ["vehicleId", "name"],
      key: "vehicle",
      render: (name) => name || "N/A",
    },
    {
      title: "Biển số xe",
      dataIndex: ["vehicleId", "licensePlate"],
      key: "licensePlate",
      render: (licensePlate) => licensePlate || "N/A",
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (serviceType) => {
        return serviceType === "booking_hour"
          ? "Đặt theo giờ"
          : serviceType === "booking_destination"
          ? "Đặt xe theo điểm đến"
          : serviceType === "booking_share"
          ? "Đặt xe chia sẻ"
          : serviceType === "booking_scenic_route"
          ? "Đặt xe lộ trình tham quan"
          : serviceType === "booking_bus_route"
          ? "Đặt xe theo tuyến xe buýt"
          : "N/A";
      },
    },
    {
      title: "Thời gian bắt đầu",
      key: "startTime",
      render: (_, record) => {
        const time = record.timeStart || record.timeStartEstimate;
        return time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "N/A";
      },
      sorter: (a, b) => {
        const timeA = a.timeStart || a.timeStartEstimate;
        const timeB = b.timeStart || b.timeStartEstimate;
        return dayjs(timeA).unix() - dayjs(timeB).unix();
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
      filters: [
        { text: "Đặt xe", value: "booking" },
        { text: "Đã xác  nhận", value: "confirmed" },
        { text: "Đón khách", value: "pickup" },
        { text: "Đang di chuyển", value: "in_progress" },
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
        { text: "Hủy bỏ", value: "dropped_off" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-medium">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hoàn tiền",
      key: "refundAmount",
      render: (_, record) => {
        const refundAmount = record.refundAmount || 0;
        return (
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(refundAmount)}
          </span>
        );
      },
      sorter: (a, b) => {
        const refundA = a.refundAmount || 0;
        const refundB = b.refundAmount || 0;
        return refundA - refundB;
      },
    },
  ];

  return (
    <App>
      <Layout>
        <Sidebar />
        <Layout>
          <Header className="bg-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold ml-7">
              Quản lý lịch sử đặt xe
            </h2>
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              className="w-64"
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
            />
          </Header>
          <Content className="m-6">
            {/* Card hiển thị tổng doanh thu */}
            <Card className="mb-6 bg-white shadow-sm">
              <Statistic
                title="Tổng doanh thu"
                value={totalAmount}
                loading={loadingTotal}
                precision={0}
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(value))
                }
                valueStyle={{
                  color: "#3f8600",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              />
            </Card>

            <div className="bg-white p-6 rounded-md shadow-sm mb-6">
              <div className="flex flex-wrap gap-4 mb-4">
                <RangePicker
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={handleDateRangeChange}
                  value={[dateRange[0], dateRange[1]]}
                  className="w-full md:w-auto"
                />
                <Select
                  placeholder="Lọc theo trạng thái"
                  className="w-full md:w-64"
                  allowClear
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <Option value="booking">Đặt xe</Option>
                  <Option value="confirmed">Đã xác nhận</Option>
                  <Option value="pickup">Đón khách</Option>
                  <Option value="in_progress">Đang di chuyển</Option>
                  <Option value="completed">Hoàn thành</Option>
                </Select>
                <Button onClick={resetFilters}>Xóa bộ lọc</Button>
              </div>

              {loading ? (
                <div className="flex flex-col justify-center items-center p-16">
                  <Spin size="large" />
                  <div className="mt-2">Đang tải dữ liệu...</div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredTrips}
                  rowKey="_id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredTrips.length,
                    onChange: setCurrentPage,
                    onShowSizeChange: (current, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total) => `Tổng ${total} cuốc xe`,
                  }}
                  scroll={{ x: "max-content" }}
                />
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </App>
  );
}
