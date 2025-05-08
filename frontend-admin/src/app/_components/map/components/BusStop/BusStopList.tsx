import { List, Spin, Button, Tag } from "antd";
import { BusStopWithColor } from "../../busStopMap";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface BusStopListProps {
  busStops: BusStopWithColor[];
  selectedBusStop: BusStopWithColor | null;
  isLoading: boolean;
  onSelectBusStop: (busStop: BusStopWithColor) => void;
  onEditBusStop: (busStop: BusStopWithColor) => void;
  onDeleteBusStop: (busStop: BusStopWithColor) => void;
}

const BusStopList = ({
  busStops,
  selectedBusStop,
  isLoading,
  onSelectBusStop,
  onEditBusStop,
  onDeleteBusStop,
}: BusStopListProps) => {
  // Hàm xác định màu sắc tag dựa trên trạng thái
  const getStatusTagColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "draft":
        return "orange";
      default:
        return "default";
    }
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "draft":
        return "Bản nháp";
      default:
        return status || "Chưa xác định";
    }
  };

  return (
    <Spin spinning={isLoading}>
      <List
        dataSource={busStops}
        renderItem={(stop) => (
          <List.Item
            style={{
              cursor: "pointer",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "6px",
              backgroundColor:
                selectedBusStop?._id === stop._id ? "#fef5e7" : "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            onClick={() => onSelectBusStop(stop)}
            actions={[
              <Button
                key={"edit"}
                type="link"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBusStop(stop);
                }}
                style={{ color: "#e67e22" }}
              />,
              <Button
                key={"delete"}
                type="link"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBusStop(stop);
                }}
                style={{ color: "#e74c3c" }}
              />,
            ]}
          >
            <List.Item.Meta
              title={
                <div className="flex items-center justify-between">
                  <span style={{ color: "#e67e22" }}>{stop.name}</span>
                  <br />
                </div>
              }
              description={
                <div>
                  <span style={{ color: "#7f8c8d" }}>
                    {stop.address || "Không có địa chỉ"}
                  </span>
                  <Tag color={getStatusTagColor(stop.status)}>
                    {getStatusText(stop.status)}
                  </Tag>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default BusStopList;
