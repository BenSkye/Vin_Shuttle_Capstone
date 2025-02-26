import { AvailableVehicle } from "@/interface/booking";
import { formatVndPrice } from "@/utils/price.until";
import React from "react";
import { FaCar } from "react-icons/fa";
import { BookingHourRequest } from "@/interface/booking";

interface VehicleSelectionProps {
    availableVehicles: AvailableVehicle[];
    selectedVehicles: BookingHourRequest['vehicleCategories'];
    onSelectionChange: (categoryId: string, quantity: number) => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
    availableVehicles,
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
        <div>
            <h2 className="text-xl font-semibold mb-4">Chọn loại xe</h2>
            {availableVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Không có xe khả dụng cho khoảng thời gian này
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableVehicles.map((vehicle) => {
                        const selectedQuantity = getSelectedQuantity(vehicle.vehicleCategory._id);
                        const isSelected = selectedQuantity > 0;

                        return (
                            <div
                                key={vehicle.vehicleCategory._id}
                                className={`p-4 rounded-lg shadow-md transition-all ${isSelected
                                    ? "border-2 border-blue-500 bg-blue-50"
                                    : "border border-gray-300 hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex items-center mb-2">
                                    <FaCar className="text-blue-500 text-2xl mr-2" />
                                    <h3 className="text-lg font-medium">{vehicle.vehicleCategory.name}</h3>
                                </div>
                                <p className="text-gray-500">{vehicle.vehicleCategory.description}</p>
                                <p className="text-gray-600">Số ghế: {vehicle.vehicleCategory.numberOfSeat}</p>
                                <p className="text-red-500">Còn lại: {vehicle.availableCount} xe</p>
                                <p className="text-gray-600">Giá: {formatVndPrice(vehicle.price)}/Xe</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(
                                            vehicle.vehicleCategory._id,
                                            (Math.max(0, selectedQuantity - 1)).toString()
                                        )}
                                        className="px-3 py-1 border rounded-md hover:bg-gray-100"
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
                                        className="w-20 text-center border rounded-md"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(
                                            vehicle.vehicleCategory._id,
                                            Math.min(vehicle.availableCount, selectedQuantity + 1).toString()
                                        )}
                                        className="px-3 py-1 border rounded-md hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                    <span className="ml-2 text-sm text-gray-600">
                                        (Tối đa: {vehicle.availableCount})
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VehicleSelection;
