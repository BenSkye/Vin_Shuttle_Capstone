import React from "react";
import { Card, Typography, Row, Col, InputNumber } from "antd";
import { FaCar } from "react-icons/fa";

const vehicleTypes = [
    { value: "sedan", label: "Sedan", seats: 4, pricePerHour: 150000, description: "Xe 4 chỗ tiêu chuẩn", available: 5 },
    { value: "suv", label: "SUV", seats: 7, pricePerHour: 200000, description: "Xe 7 chỗ gầm cao", available: 3 },
    { value: "luxury", label: "Luxury", seats: 4, pricePerHour: 300000, description: "Xe 4 chỗ cao cấp", available: 2 },
    { value: "van", label: "Van", seats: 16, pricePerHour: 350000, description: "Xe 16 chỗ", available: 4 }
];

interface VehicleSelectionProps {
    vehicleType: string;
    numberOfVehicles: number;
    onVehicleTypeChange: (type: string) => void;
    onNumberOfVehiclesChange: (count: number) => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
    vehicleType,
    numberOfVehicles,
    onVehicleTypeChange,
    onNumberOfVehiclesChange
}) => {
    const selectedVehicle = vehicleTypes.find((v) => v.value === vehicleType);

    return (
        <div>
            <Typography.Title level={4}>Chọn loại xe</Typography.Title>
            <Row gutter={[16, 16]}>
                {vehicleTypes.map((vehicle) => (
                    <Col xs={24} sm={12} key={vehicle.value}>
                        <Card
                            hoverable
                            bordered={vehicleType === vehicle.value}
                            onClick={() => onVehicleTypeChange(vehicle.value)}
                            style={{
                                borderColor: vehicleType === vehicle.value ? "#1890ff" : "#ddd",
                                cursor: "pointer"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                <FaCar size={24} style={{ marginRight: 8, color: "#1890ff" }} />
                                <Typography.Title level={5} style={{ margin: 0 }}>{vehicle.label}</Typography.Title>
                            </div>
                            <Typography.Text type="secondary">{vehicle.description}</Typography.Text>
                            <br />
                            <Typography.Text type="secondary">Số ghế: {vehicle.seats}</Typography.Text>
                            <br />
                            <Typography.Text strong style={{ color: "#1890ff" }}>
                                {vehicle.pricePerHour.toLocaleString()}đ/giờ
                            </Typography.Text>
                            <br />
                            <Typography.Text type="danger">Còn lại: {vehicle.available} xe</Typography.Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Số lượng xe */}
            {selectedVehicle && (
                <>
                    <Typography.Title level={5} style={{ marginTop: 16 }}>Số lượng xe</Typography.Title>
                    <InputNumber
                        min={1}
                        max={selectedVehicle.available}
                        value={numberOfVehicles}
                        onChange={(value) => onNumberOfVehiclesChange(value || 1)}
                        style={{ width: "100%" }}
                    />
                    <Typography.Text type="secondary">
                        {`Bạn có thể chọn tối đa ${selectedVehicle.available} xe`}
                    </Typography.Text>
                </>
            )}
        </div>
    );
};

export default VehicleSelection;
