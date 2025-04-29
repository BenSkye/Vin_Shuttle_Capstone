"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
} from "recharts";
import { getCustomer } from "@/services/api/user";

const CountChart = () => {
    const [customerCount, setCustomerCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                setLoading(true);
                const data = await getCustomer();
                setCustomerCount(data?.length || 0);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, []);

    // Create data for the chart
    const data = [
        {
            name: "Total",
            count: 100,
            fill: "white",
        },
        {
            name: "Customers",
            count: customerCount,
            fill: "#FAE27C",
        }
    ];

    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Khách hàng</h1>
                <Image src="/icons/ellipsis.svg" alt="" width={20} height={20} />
            </div>
            {/* CHART */}
            <div className="relative w-full h-[75%]">
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="100%"
                        barSize={32}
                        data={data}
                    >
                        <RadialBar background dataKey="count" />
                    </RadialBarChart>
                </ResponsiveContainer>
                <Image
                    src="/icons/user.png"
                    alt="Customer icon"
                    width={50}
                    height={50}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
            {/* BOTTOM */}
            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-lamaYellow rounded-full" />
                    <h1 className="font-bold">{loading ? "Loading..." : customerCount.toLocaleString()}</h1>
                    <h2 className="text-xs text-gray-300">Tổng số khách hàng</h2>
                </div>
            </div>
        </div>
    );
};

export default CountChart;