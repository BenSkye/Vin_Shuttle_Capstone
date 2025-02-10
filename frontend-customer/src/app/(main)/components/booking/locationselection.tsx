import React from "react";
import { Box, TextField, Grid, Paper, Button, CircularProgress } from "@mui/material";
import { FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";

// Dynamic import for Map component to prevent SSR issues
const MapWithNoSSR = dynamic(() => import("../Map"), {
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
        <Box sx={{ width: "100%" }}>
            {/* Search Fields */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={5}>
                    <TextField
                        fullWidth
                        label="Điểm đón"
                        value={pickup}
                        onChange={(e) => onPickupChange(e.target.value)}
                        InputProps={{
                            startAdornment: <FaMapMarkerAlt style={{ marginRight: 8, color: "#4CAF50" }} />,
                            placeholder: "Nhập địa điểm đón",
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <TextField
                        fullWidth
                        label="Điểm đến"
                        value={destination}
                        onChange={(e) => onDestinationChange(e.target.value)}
                        InputProps={{
                            startAdornment: <FaMapMarkerAlt style={{ marginRight: 8, color: "#FF5722" }} />,
                            placeholder: "Nhập địa điểm đến",
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={2} display="flex" alignItems="center">
                    <Button variant="contained" color="primary" fullWidth onClick={detectUserLocation}>
                        Sử dụng vị trí của tôi
                    </Button>
                </Grid>
            </Grid>

            {/* Loading Indicator */}
            {loading && (
                <Box display="flex" justifyContent="center" sx={{ my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Map Container */}
            <Paper
                elevation={2}
                sx={{
                    height: "500px",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: 2,
                }}
            >
                <MapWithNoSSR pickup={pickup} destination={destination} />
            </Paper>
        </Box>
    );
};

export default LocationSelection;