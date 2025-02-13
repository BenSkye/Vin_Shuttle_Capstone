import React from "react";
import { Card, Radio, InputNumber, Typography } from "antd";

const { Text } = Typography;

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
        <Card>
            <Radio.Group value={tripType} onChange={(e) => onTripTypeChange(e.target.value)}>
                <Radio value="alone">Đi một mình</Radio>
                <Radio value="shared">Đi chung</Radio>
            </Radio.Group>

            {tripType === "shared" && (
                <div style={{ marginTop: 20 }}>
                    <Text>Số người đi cùng:</Text>
                    <InputNumber
                        min={1}
                        max={10}
                        value={passengerCount}
                        onChange={(value) => onPassengerCountChange(value ?? 1)}
                        style={{ marginLeft: 10 }}
                    />
                </div>
            )}
        </Card>
    );
};

export default TripTypeSelection;
