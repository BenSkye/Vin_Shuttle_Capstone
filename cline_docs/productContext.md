# Product Context - Backend

## Why This Project Exists
- VinShuttle is an internal transportation service system for VinHome Grand Park using electric vehicles
- Project aims to provide efficient, eco-friendly transportation solutions within urban residential areas
- Addresses the growing need for convenient mobility within large residential complexes
- Fills the gap in intra-area transportation services that existing ride-hailing platforms don't adequately address

## Problems It Solves
- Lack of centralized system for booking electric shuttles within VHGP
- Inefficient intra-area transportation in large residential complexes
- Environmental concerns with traditional transportation methods
- Difficulty in accessing amenities spread across the VHGP area
- Need for streamlined, sustainable transportation solutions

## How It Works
The system comprises multiple components:

### Admin Web Application Features:
- Login/Logout management
- Personal profile management
- User management for managers
- Service pricing management
- Vehicle category and information management
- Route management with stop stations
- Cash flow management

### Manager Web Application Features:
- Driver management (CRUD operations)
- Customer management and viewing
- Booking management
- Driver schedule management
- Feedback management and response system

### Driver Mobile Application Features:
- Booking management (view, accept, route viewing)
- Personal schedule management
- Check-in/check-out functionality
- Chat system

### Customer Web Application Features:
- Service booking (multiple options: rent by hour/route/share)
- Real-time ride tracking
- Rating and feedback system
- Alerts and notifications
- Profile management
- Chat functionality

### Technical Implementation:
- Built using NestJS framework
- MongoDB for data persistence
- Modular architecture design
- RESTful API implementation
- Real-time tracking capabilities
- Secure authentication system
- Integrated payment processing

### Limitations:
- Geographic scope limited to VHGP area
- Service availability depends on operational hours
- Limited vehicle capacity
- Requires stable internet for real-time features
- Restricted to VHGP residents
- Support limited to in-app interactions
