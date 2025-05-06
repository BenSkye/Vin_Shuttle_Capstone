import { List, Spin, Tag, Button } from "antd";
import { BusRouteWithStops } from "../../../../services/busServices";
import { CarOutlined, DeleteOutlined } from "@ant-design/icons";

interface BusRouteListProps {
  busRoutes: BusRouteWithStops[];
  isLoading: boolean;
  onSelectBusRoute?: (route: BusRouteWithStops) => void;
  onDeleteBusRoute?: (route: BusRouteWithStops) => void;
}

const BusRouteList = ({ busRoutes, isLoading, onSelectBusRoute, onDeleteBusRoute }: BusRouteListProps) => {
  // Hàm xác định màu sắc tag dựa trên trạng thái
  const getStatusTagColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'draft':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'draft':
        return 'Bản nháp';
      default:
        return status || 'Chưa xác định';
    }
  };

  return (
    <Spin spinning={isLoading}>
      <List
        dataSource={busRoutes}
        renderItem={(route) => (
          <List.Item
            style={{
              cursor: "pointer",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            onClick={() => onSelectBusRoute?.(route)}
            actions={[
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan lên List.Item
                  onDeleteBusRoute?.(route);
                }}
              >
                Xóa
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<CarOutlined style={{ color: "#2980b9", fontSize: "20px" }} />}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: "#2980b9", fontWeight: "bold" }}>{route.name}</span>
                  <Tag color={getStatusTagColor(route.status)}>{getStatusText(route.status)}</Tag>
                </div>
              }
              description={
                <span style={{ color: "#7f8c8d" }}>
                  {route.description || "Không có mô tả"} - {route.stops.length} điểm dừng
                </span>
              }
            />
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default BusRouteList;