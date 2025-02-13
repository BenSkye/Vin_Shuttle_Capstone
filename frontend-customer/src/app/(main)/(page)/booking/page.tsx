"use client"

import { useState } from "react"
import { Tabs, Card } from "antd"
import { FaHotel, FaPlane, FaCar } from "react-icons/fa"
import dynamic from "next/dynamic"

// Dynamic imports with ssr: false
const HourlyBooking = dynamic(() => import("../../components/booking/hourbooking"), { ssr: false })
const RouteBooking = dynamic(() => import("../../components/booking/routebooking"), { ssr: false })
const SharedBooking = dynamic(() => import("../../components/booking/sharedbooking"), { ssr: false })

export default function BookingTabs() {
    const [activeKey, setActiveKey] = useState("1")

    const items = [
        {
            key: "1",
            label: (
                <span className="text-lg">
                    <FaHotel className="mr-2 inline-block" /> Book theo giờ
                </span>
            ),
            children: (
                <Card className="p-6">
                    <HourlyBooking />
                </Card>
            ),
        },
        {
            key: "2",
            label: (
                <span className="text-lg">
                    <FaPlane className="mr-2 inline-block" /> Book xe theo điểm đến
                </span>
            ),
            children: (
                <Card className="p-6">
                    <SharedBooking />
                </Card>
            ),
        },
        {
            key: "3",
            label: (
                <span className="text-lg">
                    <FaCar className="mr-2 inline-block" /> Book xe theo lộ trình
                </span>
            ),
            children: (
                <Card className="p-6">
                    <RouteBooking onTabChange={() => { }} setPickup={() => { }} setDestination={() => { }} />
                </Card>
            ),
        },
    ]

    return (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4">
            <Tabs
                activeKey={activeKey}
                onChange={setActiveKey}
                type="card"
                items={items}
                className="flex justify-center [&_.ant-tabs-nav]:w-auto [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:justify-center [&_.ant-tabs-tab]:px-6 [&_.ant-tabs-tab]:py-3"
            />
        </div>
    )
}

