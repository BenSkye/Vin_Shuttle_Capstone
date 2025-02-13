'use client';

import React, { useState } from "react";
import { Steps, Card, Typography, Button, Radio, Input, Form, Row, Col, Grid } from "antd";
import { FaCreditCard, FaPaypal, FaGooglePay } from "react-icons/fa";

const { Title, Text } = Typography;
const { Step } = Steps;
const { useBreakpoint } = Grid;

const steps = ["Payment Method", "Order Review"];

const CheckoutPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const screens = useBreakpoint(); // Lấy thông tin kích thước màn hình

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Form form={form} layout="vertical" size="large">
                        <Form.Item label="Payment Method">
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                            >
                                <Card>
                                    <Radio value="credit">
                                        <FaCreditCard style={{ marginRight: 8 }} /> Credit Card
                                    </Radio>
                                </Card>
                                <Card>
                                    <Radio value="paypal">
                                        <FaPaypal style={{ marginRight: 8 }} /> PayPal
                                    </Radio>
                                </Card>
                                <Card>
                                    <Radio value="gpay">
                                        <FaGooglePay style={{ marginRight: 8 }} /> Google Pay
                                    </Radio>
                                </Card>
                            </Radio.Group>
                        </Form.Item>
                        {paymentMethod === "credit" && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item label="Card Number" name="cardNumber" rules={[{ required: true }]}>
                                        <Input placeholder="1234 5678 9012 3456" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Form>
                );

            case 1:
                return (
                    <Card>
                        <Title level={2}>Order Summary</Title>
                        <Row justify="space-between">
                            <Col><Text>Subtotal:</Text></Col>
                            <Col><Text>$99.99</Text></Col>
                        </Row>
                        <Row justify="space-between">
                            <Col><Text>Tax:</Text></Col>
                            <Col><Text>$10.00</Text></Col>
                        </Row>
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }}>
                            <Row justify="space-between">
                                <Col><Title level={3}>Total:</Title></Col>
                                <Col><Title level={3}>$109.99</Title></Col>
                            </Row>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            maxWidth: screens.xs ? '100%' : '600px', // Co giãn theo màn hình
            margin: "auto",
            padding: screens.xs ? "24px 16px" : "60px 32px"
        }}>
            <Card style={{ padding: screens.xs ? '20px' : '40px' }}>
                <Title level={1} style={{ textAlign: "center" }}>Checkout</Title>
                <Steps current={activeStep} direction={screens.xs ? "vertical" : "horizontal"}>
                    {steps.map((label) => (
                        <Step key={label} title={label} />
                    ))}
                </Steps>
                <div style={{ margin: '24px 0' }}>{getStepContent()}</div>
                <div style={{
                    display: "flex",
                    flexDirection: screens.xs ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    {activeStep !== 0 && (
                        <Button onClick={handleBack} size="large" style={{ marginBottom: screens.xs ? '16px' : '0' }}>
                            Back
                        </Button>
                    )}
                    <Button type="primary" onClick={handleNext} size="large">
                        {activeStep === steps.length - 1 ? "Place Order" : "Next"}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default CheckoutPage;
