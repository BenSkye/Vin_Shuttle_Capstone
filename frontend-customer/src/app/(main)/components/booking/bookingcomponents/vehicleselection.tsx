import { AvailableVehicle } from "@/interface/booking";
import { formatVndPrice } from "@/utils/price.until";
import React from "react";
import { FaCar } from "react-icons/fa";
import { BookingHourRequest } from "@/interface/booking";
import { Card, Typography } from "antd";

const { Title } = Typography;

interface VehicleSelectionProps {
    availableVehicles: AvailableVehicle[];
    selectedVehicles: BookingHourRequest['vehicleCategories'];
    onSelectionChange: (categoryId: string, quantity: number) => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
    availableVehicles ,
    selectedVehicles,
    onSelectionChange
}) => {
    const getSelectedQuantity = (categoryId: string) => {
        return selectedVehicles.find(v => v.categoryVehicleId === categoryId)?.quantity || 0;
    };

    const handleQuantityChange = (categoryId: string, value: string) => {
        const quantity = Math.max(0, Math.min(Number(value),
            availableVehicles.find(v => v.vehicleCategory._id === categoryId)?.availableCount || 0
        ));
        onSelectionChange(categoryId, quantity);
    };

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
                        const selectedQuantity = getSelectedQuantity(vehicle.vehicleCategory._id);
                        const isSelected = selectedQuantity > 0;

                        return (
                            <Card
                                key={vehicle.vehicleCategory._id}
                                className={`transform transition-all duration-200 hover:shadow-lg ${isSelected
                                    ? "border-2 border-blue-500 bg-blue-50"
                                    : "border border-gray-200"
                                    }`}
                                bodyStyle={{ padding: '1.5rem' }}
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

                                <div className="flex items-center justify-between gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(
                                                vehicle.vehicleCategory._id,
                                                (Math.max(0, selectedQuantity - 1)).toString()
                                            )}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={selectedQuantity}
                                            min={0}
                                            max={vehicle.availableCount}
                                            onChange={(e) => handleQuantityChange(
                                                vehicle.vehicleCategory._id,
                                                e.target.value
                                            )}
                                            className="w-16 h-10 text-center border rounded-md"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(
                                                vehicle.vehicleCategory._id,
                                                Math.min(vehicle.availableCount, selectedQuantity + 1).toString()
                                            )}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Tối đa: {vehicle.availableCount}
                                    </span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VehicleSelection;
