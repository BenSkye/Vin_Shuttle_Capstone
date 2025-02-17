"use client";

import React from "react";

const pickupInfo = {
    pickupLocation: "123 Đường ABC, Quận 1, TP.HCM",
    pickupDateTime: "2025-02-14 08:00",
    travelDuration: "2 giờ",
};

const vehicleData = [
    {
        key: "1",
        type: "Sedan",
        quantity: 2,
        price: 500000,
        details: [
            { plate: "51A-12345", seats: 4, driver: "Nguyễn Văn A" },
            { plate: "51A-67890", seats: 4, driver: "Trần Văn B" }
        ]
    },
    {
        key: "2",
        type: "SUV",
        quantity: 1,
        price: 700000,
        details: [
            { plate: "51B-11223", seats: 7, driver: "Lê Văn C" }
        ]
    }
];

const totalPrice = vehicleData.reduce((sum, v) => sum + v.price * v.quantity, 0);

const CheckoutPage = () => {
    return (
        <div className="flex justify-center p-4 max-w-full">
            <div className="w-full max-w-4xl bg-white shadow-md p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Chi tiết đơn hàng</h2>

                <div className="mb-6 border p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Thông tin đón</h4>
                    <p><strong>Điểm đón:</strong> {pickupInfo.pickupLocation}</p>
                    <p><strong>Ngày giờ đón:</strong> {pickupInfo.pickupDateTime}</p>
                    <p><strong>Thời gian di chuyển:</strong> {pickupInfo.travelDuration}</p>
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Loại xe</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Giá mỗi xe</th>
                                <th className="border p-2">Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleData.map((vehicle) => (
                                <tr key={vehicle.key} className="text-center border">
                                    <td className="border p-2">{vehicle.type}</td>
                                    <td className="border p-2">{vehicle.quantity}</td>
                                    <td className="border p-2">{vehicle.price.toLocaleString()} VND</td>
                                    <td className="border p-2">{(vehicle.price * vehicle.quantity).toLocaleString()} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Tổng tiền:</h4>
                    <h3 className="text-xl font-bold text-blue-500">{totalPrice.toLocaleString()} VND</h3>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
