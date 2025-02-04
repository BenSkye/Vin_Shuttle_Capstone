'use client'
import React, { useState } from "react";
import { Box, Typography } from "@mui/material"
import Sidebar from "../Sidebar"
import Map from "../Map"
import LookUp from "../LookUp"


export default function RouteBooking() {
    const [activeTab, setActiveTab] = useState("search");
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <LookUp onTabChange={setActiveTab} />
            <div style={{ display: "flex", flex: 1 }}>
                {activeTab === "search" && <Sidebar />}
                <Map />
            </div>
        </div>
    )
}