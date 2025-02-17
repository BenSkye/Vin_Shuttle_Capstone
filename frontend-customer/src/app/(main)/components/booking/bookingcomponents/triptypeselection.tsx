import React from "react";

interface TripTypeSelectionProps {
    tripType: "alone" | "shared";
    onTripTypeChange: (value: "alone" | "shared") => void;
    passengerCount: number;
    onPassengerCountChange: (value: number) => void;
}

const TripTypeSelection: React.FC<TripTypeSelectionProps> = ({
    tripType,
    onTripTypeChange,
    passengerCount,
    onPassengerCountChange,
}) => {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        value="alone"
                        checked={tripType === "alone"}
                        onChange={() => onTripTypeChange("alone")}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    Đi một mình
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        value="shared"
                        checked={tripType === "shared"}
                        onChange={() => onTripTypeChange("shared")}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    Đi chung
                </label>
            </div>

            {tripType === "shared" && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-gray-700">Số người đi cùng:</span>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={passengerCount}
                        onChange={(e) => onPassengerCountChange(Number(e.target.value))}
                        className="w-16 p-2 border border-gray-300 rounded-md text-center"
                    />
                </div>
            )}
        </div>
    );
};

export default TripTypeSelection;
