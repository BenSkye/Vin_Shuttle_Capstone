'use client'

import { useState } from "react"
import { Box, Card, Tab, Tabs } from "@mui/material"
import { styled } from "@mui/material/styles"
import { FaHotel, FaPlane, FaCar } from "react-icons/fa"
import HourlyBooking from "../../components/booking/hourbooking"
import RouteBooking from "../../components/booking/routebooking"
import LineBooking from "../../components/booking/linebooking"

const StyledTabs = styled(Tabs)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    '& .MuiTab-root': {
        minWidth: 120,
    },
    '& .MuiTab-wrapper': {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
}));

// ... keep existing styled components ...

export default function BookingTabs() {
    const [value, setValue] = useState(0)

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    const tabContent = [
        {
            label: "Book theo giờ",
            icon: <FaHotel size={20} />,
            component: <HourlyBooking />
        },
        {
            label: "Book xe theo lộ trình",
            icon: <FaPlane size={20} />,
            component: <LineBooking />
        },
        {
            label: "Book xe theo tuyến",
            icon: <FaCar size={20} />,
            component: <RouteBooking />
        }
    ]

    return (
        <Box sx={{
            width: "100%",
            maxWidth: "100%",
            mx: "auto",
            mt: 4,
            px: { xs: 1, sm: 2, md: 3 }
        }}>
            <StyledTabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="booking options tabs"
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    '& .MuiTabs-flexContainer': {
                        justifyContent: { xs: 'flex-start', md: 'center' }
                    }
                }}
            >
                {tabContent.map((tab, index) => (
                    <Tab
                        key={index}
                        icon={tab.icon}
                        iconPosition="start"
                        label={tab.label}
                        id={`booking-tab-${index}`}
                        aria-controls={`booking-tabpanel-${index}`}
                    />
                ))}
            </StyledTabs>

            <Card>
                {tabContent.map((tab, index) => (
                    <Box
                        key={index}
                        role="tabpanel"
                        hidden={value !== index}
                        id={`booking-tabpanel-${index}`}
                    >
                        {value === index && tab.component}
                    </Box>
                ))}
            </Card>
        </Box>
    )
}