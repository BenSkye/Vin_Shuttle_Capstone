'use client'

import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    IconButton,
    useTheme,
    useMediaQuery,
    Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCar, FaShieldAlt, FaClock, FaUserFriends } from "react-icons/fa";

const HeroSection = styled(Box)({
    position: "relative",
    height: "80vh",
    display: "flex",
    alignItems: "center",
    backgroundImage: `url(https://camnangvinhomes.com/uploads/post/659e4968c5550.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});

const Feature = styled(Paper)({
    padding: "24px",
    textAlign: "center",
    height: "100%",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
        transform: "translateY(-10px)",
    },
});

const HomePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const features = [
        {
            icon: <FaCar size={40} />,
            title: "Premium Vehicles",
            description: "Choose from our wide range of luxury and comfort vehicles"
        },
        {
            icon: <FaShieldAlt size={40} />,
            title: "Safe & Secure",
            description: "All vehicles thoroughly sanitized and safety-checked"
        },
        {
            icon: <FaClock size={40} />,
            title: "24/7 Service",
            description: "Round-the-clock support and booking assistance"
        },
        {
            icon: <FaUserFriends size={40} />,
            title: "Expert Drivers",
            description: "Professional, experienced and vetted chauffeurs"
        }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <HeroSection>
                <Container >
                    <Box position="relative" color="white" textAlign={isMobile ? "center" : "left"}>
                        <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, fontWeight: "bold", mb: 2 }}>
                            VinShuttle
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 4, maxWidth: "600px" }}>
                            VinShuttle cung cấp dịch vụ đặt xe tiện lợi trong khu đô thị Vinhomes, giúp cư dân di chuyển nhanh chóng, an toàn và tiết kiệm thời gian
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: "#1976d2",
                                color: "white",
                                padding: "12px 32px",
                                fontSize: "1.2rem",
                                "&:hover": {
                                    backgroundColor: "#1565c0"
                                }
                            }}
                        >
                            Book Now
                        </Button>
                    </Box>
                </Container>
            </HeroSection>

            <Container sx={{ my: 8 }}>
                <Typography variant="h2" textAlign="center" sx={{ mb: 6, fontSize: { xs: "2rem", md: "3rem" } }}>
                    Why Choose Us?
                </Typography>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Feature elevation={3}>
                                <IconButton
                                    sx={{
                                        backgroundColor: "#1976d2",
                                        color: "white",
                                        mb: 2,
                                        "&:hover": { backgroundColor: "#1976d2" }
                                    }}
                                >
                                    {feature.icon}
                                </IconButton>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    {feature.title}
                                </Typography>
                                <Typography color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Feature>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HomePage;