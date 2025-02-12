'use client';

import React, { useState } from "react";
import { Container, Stepper, Step, StepLabel, Paper, Grid, Typography, Button, Box, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Card, CardContent } from "@mui/material";
import { styled } from "@mui/system";
import { FaCreditCard, FaPaypal, FaGooglePay } from "react-icons/fa";

const StyledPaper = styled(Paper)(({ }) => ({
    padding: "40px",
    marginTop: "40px",
    marginBottom: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
}));

const StyledButton = styled(Button)({
    margin: "16px 8px",
    padding: "12px 32px",
    fontSize: "1.1rem"
});

const StyledRadioGroup = styled(RadioGroup)({
    '& .MuiFormControlLabel-root': {
        margin: '16px 0',
        '& .MuiRadio-root': {
            padding: '12px'
        },
        '& .MuiTypography-root': {
            fontSize: '1.1rem'
        }
    }
});

const IconWrapper = styled(Box)({
    display: "flex",
    alignItems: "center",
    '& svg': {
        fontSize: '24px',
        marginRight: '12px'
    }
});

const steps = ["Payment Method", "Order Review"];

const CheckoutPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
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
                    <Box sx={{ p: 3 }}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend" sx={{ fontSize: '1.2rem', mb: 3 }}>
                                Select Payment Method
                            </FormLabel>
                            <StyledRadioGroup name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <FormControlLabel
                                        value="credit"
                                        control={<Radio />}
                                        label={<IconWrapper><FaCreditCard /> Credit Card</IconWrapper>}
                                    />
                                </Paper>
                                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <FormControlLabel
                                        value="paypal"
                                        control={<Radio />}
                                        label={<IconWrapper><FaPaypal /> PayPal</IconWrapper>}
                                    />
                                </Paper>
                                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <FormControlLabel
                                        value="gpay"
                                        control={<Radio />}
                                        label={<IconWrapper><FaGooglePay /> Google Pay</IconWrapper>}
                                    />
                                </Paper>
                            </StyledRadioGroup>
                        </FormControl>
                        {formData.paymentMethod === "credit" && (
                            <Grid container spacing={3} sx={{ mt: 4 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Card Number"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            sx: { fontSize: '1.1rem', padding: '8px' }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Card sx={{ p: 3 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                                Order Summary
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.1rem',
                                        mb: 2
                                    }}>
                                        <Typography>Subtotal:</Typography>
                                        <Typography>$99.99</Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.1rem',
                                        mb: 3
                                    }}>
                                        <Typography>Tax:</Typography>
                                        <Typography>$10.00</Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        borderTop: '2px solid #eee',
                                        pt: 3
                                    }}>
                                        <Typography>Total:</Typography>
                                        <Typography>$109.99</Typography>
                                    </Box>
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
        <Container maxWidth="lg">
            <StyledPaper>
                <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
                    Checkout
                </Typography>
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{
                        mb: 8,
                        '& .MuiStepLabel-label': {
                            fontSize: '1.1rem'
                        }
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 4, maxWidth: '800px', margin: '0 auto' }}>
                    {activeStep === steps.length ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h4" gutterBottom>
                                Thank you for your order!
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Your order has been placed successfully.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {getStepContent()}
                            <Box sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 4,
                                borderTop: '1px solid #eee',
                                pt: 4
                            }}>
                                {activeStep !== 0 && (
                                    <StyledButton
                                        onClick={handleBack}
                                        size="large"
                                    >
                                        Back
                                    </StyledButton>
                                )}
                                <StyledButton
                                    variant="contained"
                                    onClick={handleNext}
                                    size="large"
                                >
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
