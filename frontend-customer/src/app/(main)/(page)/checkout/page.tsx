'use client'

import React, { useState } from "react";
import { Container, Stepper, Step, StepLabel, Paper, Grid, Typography, Button, Box, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Card, CardContent } from "@mui/material";
import { styled } from "@mui/system";
import { FaCreditCard, FaPaypal, FaGooglePay } from "react-icons/fa";

const StyledPaper = styled(Paper)({
    padding: "24px",
    marginTop: "24px",
    marginBottom: "24px"
});

const StyledButton = styled(Button)({
    margin: "16px 8px"
});

const steps = ["Shipping Information", "Shipping Method", "Payment Method", "Order Review"];

const CheckoutPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        shippingMethod: "standard",
        paymentMethod: "credit",
        cardNumber: "",
        cardHolder: "",
        expiry: "",
        cvv: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Shipping Method</FormLabel>
                        <RadioGroup name="shippingMethod" value={formData.shippingMethod} onChange={handleInputChange}>
                            <FormControlLabel value="standard" control={<Radio />} label="Standard Shipping ($5.99)" />
                            <FormControlLabel value="express" control={<Radio />} label="Express Shipping ($12.99)" />
                            <FormControlLabel value="priority" control={<Radio />} label="Priority Shipping ($19.99)" />
                        </RadioGroup>
                    </FormControl>
                );

            case 2:
                return (
                    <Box>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Payment Method</FormLabel>
                            <RadioGroup name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                                <FormControlLabel value="credit" control={<Radio />} label={<Box sx={{ display: "flex", alignItems: "center" }}><FaCreditCard style={{ marginRight: 8 }} /> Credit Card</Box>} />
                                <FormControlLabel value="paypal" control={<Radio />} label={<Box sx={{ display: "flex", alignItems: "center" }}><FaPaypal style={{ marginRight: 8 }} /> PayPal</Box>} />
                                <FormControlLabel value="gpay" control={<Radio />} label={<Box sx={{ display: "flex", alignItems: "center" }}><FaGooglePay style={{ marginRight: 8 }} /> Google Pay</Box>} />
                            </RadioGroup>
                        </FormControl>
                        {formData.paymentMethod === "credit" && (
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                <Grid item xs={12}>
                                    <TextField required fullWidth label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                );

            case 3:
                return (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Order Summary</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography>Subtotal: $99.99</Typography>
                                    <Typography>Shipping: ${formData.shippingMethod === "standard" ? "5.99" : formData.shippingMethod === "express" ? "12.99" : "19.99"}</Typography>
                                    <Typography>Tax: $10.00</Typography>
                                    <Typography variant="h6" sx={{ mt: 2 }}>Total: $115.98</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="md">
            <StyledPaper>
                <Typography variant="h4" align="center" gutterBottom>
                    Checkout
                </Typography>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 4 }}>
                    {activeStep === steps.length ? (
                        <Typography variant="h5" align="center">
                            Thank you for your order!
                        </Typography>
                    ) : (
                        <>
                            {getStepContent()}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                                {activeStep !== 0 && (
                                    <StyledButton onClick={handleBack}>Back</StyledButton>
                                )}
                                <StyledButton variant="contained" onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? "Place Order" : "Next"}
                                </StyledButton>
                            </Box>
                        </>
                    )}
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default CheckoutPage;
