import React from "react";
import { Box, TextField, Typography, Paper, Grid } from "@mui/material";
import { FaCar } from "react-icons/fa";

const vehicleTypes = [
    { value: "sedan", label: "Sedan", seats: 4, pricePerHour: 150000, description: "Xe 4 chỗ tiêu chuẩn" },
    { value: "suv", label: "SUV", seats: 7, pricePerHour: 200000, description: "Xe 7 chỗ gầm cao" },
    { value: "luxury", label: "Luxury", seats: 4, pricePerHour: 300000, description: "Xe 4 chỗ cao cấp" },
    { value: "van", label: "Van", seats: 16, pricePerHour: 350000, description: "Xe 16 chỗ" }
];


interface VehicleSelectionProps {
    vehicleType: string;
    numberOfVehicles: number;
    onVehicleTypeChange: (type: string) => void;
    onNumberOfVehiclesChange: (count: number) => void;
}


const VehicleSelection: React.FC<VehicleSelectionProps> = ({ vehicleType, numberOfVehicles, onVehicleTypeChange, onNumberOfVehiclesChange }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Chọn loại xe
            </Typography>
            <Grid container spacing={2}>
                {vehicleTypes.map((vehicle) => (
                    <Grid item xs={12} sm={6} key={vehicle.value}>
                        <Paper
                            sx={{
                                p: 2,
                                cursor: "pointer",
                                border: vehicleType === vehicle.value ? "2px solid #1976d2" : "1px solid #ddd",
                                "&:hover": { borderColor: "#1976d2" }
                            }}
                            onClick={() => onVehicleTypeChange(vehicle.value)}
                        >
                            <Box display="flex" alignItems="center" mb={1}>
                                <FaCar size={24} style={{ marginRight: 8 }} />
                                <Typography variant="h6">{vehicle.label}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {vehicle.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Số ghế: {vehicle.seats}
                            </Typography>
                            <Typography variant="body2" color="primary">
                                {vehicle.pricePerHour.toLocaleString()}đ/giờ
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <TextField
                type="number"
                fullWidth
                label="Số lượng xe"
                value={numberOfVehicles}
                onChange={(e) => onNumberOfVehiclesChange(Math.max(1, parseInt(e.target.value) || 1))}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ mt: 2 }}
            />
        </Box>
    );
};

export default VehicleSelection;