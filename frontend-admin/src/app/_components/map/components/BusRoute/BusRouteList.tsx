import { List, Spin } from "antd";
import { BusRouteWithStops } from "../../../../services/busServices";
import { CarOutlined } from "@ant-design/icons";

interface BusRouteListProps {
  busRoutes: BusRouteWithStops[];
  isLoading: boolean;
  onSelectBusRoute?: (route: BusRouteWithStops) => void;
}

const BusRouteList = ({ busRoutes, isLoading, onSelectBusRoute }: BusRouteListProps) => {
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
            onClick={() => onSelectBusRoute && onSelectBusRoute(route)}
          >
            <List.Item.Meta
              avatar={<CarOutlined style={{ color: "#2980b9", fontSize: "20px" }} />}
              title={<span style={{ color: "#2980b9", fontWeight: "bold" }}>{route.name}</span>}
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