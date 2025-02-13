'use client';

import React, { useState } from "react";
import { Steps, Card, Typography, Button, Row, Col, Descriptions, Table } from "antd";

const { Title } = Typography;
const { Step } = Steps;

const steps = ["Thông tin đón", "Xác nhận đơn hàng"];

const CheckoutPage = () => {
    const [activeStep, setActiveStep] = useState(0);
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

    const columns = [
        { title: "Loại xe", dataIndex: "type", key: "type" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Giá mỗi xe", dataIndex: "price", key: "price", render: (price: number) => `${price.toLocaleString()} VND` },
        { title: "Tổng", key: "total", render: (_: unknown, record: { price: number; quantity: number }) => `${(record.price * record.quantity).toLocaleString()} VND` }
    ];

    const expandedRowRender = (record: { details: { plate: string; seats: number; driver: string }[] }) => (
        <Table
            columns={[
                { title: "Biển số", dataIndex: "plate", key: "plate" },
                { title: "Số chỗ ngồi", dataIndex: "seats", key: "seats" },
                { title: "Tài xế", dataIndex: "driver", key: "driver" }
            ]}
            dataSource={record.details}
            pagination={false}
        />
    );

    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "24px" }}>
            <Card bordered={false} style={{ padding: "24px" }}>
                <Title level={1} style={{ textAlign: "center" }}>Thanh toán</Title>
                <Steps current={activeStep}>
                    {steps.map((label) => (<Step key={label} title={label} />))}
                </Steps>

                <div style={{ margin: '24px 0' }}>
                    {activeStep === 0 && (
                        <Descriptions title="Thông tin đón" bordered column={1}>
                            <Descriptions.Item label="Điểm đón">{pickupInfo.pickupLocation}</Descriptions.Item>
                            <Descriptions.Item label="Ngày giờ đón">{pickupInfo.pickupDateTime}</Descriptions.Item>
                            <Descriptions.Item label="Thời gian di chuyển">{pickupInfo.travelDuration}</Descriptions.Item>
                        </Descriptions>
                    )}

                    {activeStep === 1 && (
                        <>
                            <Table
                                columns={columns}
                                dataSource={vehicleData}
                                expandable={{ expandedRowRender }}
                                pagination={false}
                            />
                            <Title level={3} style={{ textAlign: "right", marginTop: "16px" }}>
                                Tổng tiền: {totalPrice.toLocaleString()} VND
                            </Title>
                        </>
                    )}
                </div>

                <Row justify="space-between">
                    {activeStep !== 0 && (
                        <Col>
                            <Button onClick={() => setActiveStep(activeStep - 1)} size="large">Quay lại</Button>
                        </Col>
                    )}
                    <Col>
                        <Button type="primary" onClick={() => setActiveStep(activeStep + 1)} size="large">
                            {activeStep === steps.length - 1 ? "Xác nhận thanh toán" : "Tiếp tục"}
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default CheckoutPage;
