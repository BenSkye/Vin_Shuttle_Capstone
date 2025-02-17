import React from "react";
import { FaCar } from "react-icons/fa";

const vehicleTypes = [
    { value: "sedan", label: "Sedan", seats: 4, pricePerHour: 150000, description: "Xe 4 chỗ tiêu chuẩn", available: 5 },
    { value: "suv", label: "SUV", seats: 7, pricePerHour: 200000, description: "Xe 7 chỗ gầm cao", available: 3 },
    { value: "luxury", label: "Luxury", seats: 4, pricePerHour: 300000, description: "Xe 4 chỗ cao cấp", available: 2 },
    { value: "van", label: "Van", seats: 16, pricePerHour: 350000, description: "Xe 16 chỗ", available: 4 }
];

interface VehicleSelectionProps {
    vehicleType: string;
    numberOfVehicles: { [key: string]: number };
    onVehicleTypeChange: (type: string) => void;
    onNumberOfVehiclesChange: (type: string, count: number) => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
    vehicleType,
    numberOfVehicles,
    onVehicleTypeChange,
    onNumberOfVehiclesChange
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Chọn loại xe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicleTypes.map((vehicle) => (
                    <div
                        key={vehicle.value}
                        onClick={() => onVehicleTypeChange(vehicle.value)}
                        className={`p-4 rounded-lg shadow-md cursor-pointer transition-all ${vehicleType === vehicle.value ? "border-2 border-blue-500" : "border border-gray-300"
                            }`}
                    >
                        <div className="flex items-center mb-2">
                            <FaCar className="text-blue-500 text-2xl mr-2" />
                            <h3 className="text-lg font-medium">{vehicle.label}</h3>
                        </div>
                        <p className="text-gray-500">{vehicle.description}</p>
                        <p className="text-gray-600">Số ghế: {vehicle.seats}</p>
                        <p className="text-blue-500 font-semibold">{vehicle.pricePerHour.toLocaleString()}đ/giờ</p>
                        <p className="text-red-500">Còn lại: {vehicle.available} xe</p>
                        <input
                            type="number"
                            min={1}
                            max={vehicle.available}
                            onChange={(e) => onNumberOfVehiclesChange(vehicle.value, Number(e.target.value) || 1)}
                            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                            placeholder="Chọn số lượng"
                        />
                        {/* Display the selected quantity */}
                        <p className="mt-2 text-gray-600">Số lượng đã chọn: {numberOfVehicles[vehicle.value] || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VehicleSelection;
