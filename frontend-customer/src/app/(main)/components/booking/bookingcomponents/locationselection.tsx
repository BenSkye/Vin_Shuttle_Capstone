import React from "react";
import { Input, Row, Col, Button, Spin, Card } from "antd";
import { FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";

// Dynamic import for Map component to prevent SSR issues
const MapWithNoSSR = dynamic(() => import("../../Map"), {
    ssr: false,
    loading: () => <p>Loading Map...</p>,
});

interface LocationSelectionProps {
    pickup: string;
    destination: string;
    onPickupChange: (value: string) => void;
    onDestinationChange: (value: string) => void;
    detectUserLocation: () => void;
    loading: boolean;
}

const LocationSelection = ({
    pickup,
    destination,
    onPickupChange,
    onDestinationChange,
    detectUserLocation,
    loading,
}: LocationSelectionProps) => {
    return (
        <div style={{ width: "100%" }}>
            {/* Search Fields */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={10}>
                    <Input
                        prefix={<FaMapMarkerAlt style={{ color: "#4CAF50" }} />}
                        placeholder="Nhập địa điểm đón"
                        value={pickup}
                        onChange={(e) => onPickupChange(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={10}>
                    <Input
                        prefix={<FaMapMarkerAlt style={{ color: "#FF5722" }} />}
                        placeholder="Nhập địa điểm đến"
                        value={destination}
                        onChange={(e) => onDestinationChange(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={4} style={{ display: "flex", alignItems: "center" }}>
                    <Button type="primary" block onClick={detectUserLocation}>
                        Sử dụng vị trí của tôi
                    </Button>
                </Col>
            </Row>

            {/* Loading Indicator */}
            {loading && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <Spin size="large" />
                </div>
            )}

            {/* Map Container */}
            <Card style={{ height: "500px", borderRadius: 8, overflow: "hidden" }}>
                <MapWithNoSSR pickup={pickup} destination={destination} />
            </Card>
        </div>
    );
};

export default LocationSelection;
