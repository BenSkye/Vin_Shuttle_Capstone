import { AvailableVehicle } from "@/interface/booking";
import { formatVndPrice } from "@/utils/price.until";
import React from "react";
import { FaCar } from "react-icons/fa";
import { Card, Typography } from "antd";

const { Title } = Typography;

interface VehicleSelectionProps {
    availableVehicles: AvailableVehicle[];
    selectedVehicle: { categoryVehicleId: string; name: string } | null;
    onSelectionChange: (categoryId: string, name: string, selected: boolean) => void;
}

const DesVehicleSelection: React.FC<VehicleSelectionProps> = ({
    availableVehicles,
    selectedVehicle,
    onSelectionChange
}) => {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-4">
            <Title level={3} className="text-center mb-8 text-2xl font-bold text-gray-800">
                Chọn loại xe phù hợp
            </Title>

            {availableVehicles.length === 0 ? (
                <div className="text-center py-12">
                    <FaCar className="text-gray-400 text-5xl mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có xe khả dụng cho khoảng thời gian này</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {availableVehicles.map((vehicle) => {
                        const isSelected = selectedVehicle?.categoryVehicleId === vehicle.vehicleCategory._id;

                        return (
                            <Card
                                key={vehicle.vehicleCategory._id}
                                className={`transform transition-all duration-200 hover:shadow-lg ${isSelected ? "bg-blue-100" : "border border-gray-200"
                                    }`}
                                bodyStyle={{ padding: "1.5rem" }}
                                onClick={() =>
                                    onSelectionChange(
                                        vehicle.vehicleCategory._id,
                                        vehicle.vehicleCategory.name,
                                        !isSelected // Toggle selection
                                    )
                                }
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <FaCar className="text-blue-500 text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {vehicle.vehicleCategory.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            {vehicle.vehicleCategory.numberOfSeat} chỗ ngồi
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <p className="text-gray-600">{vehicle.vehicleCategory.description}</p>
                                    <p className="text-red-500 font-medium">
                                        Còn trống: {vehicle.availableCount} xe
                                    </p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        {formatVndPrice(vehicle.price)}/Xe
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DesVehicleSelection;