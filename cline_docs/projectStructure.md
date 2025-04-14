# Project Structure - VinShuttle

## Root Directory Organization
```
VinShuttle/
├── backend/               # NestJS Backend API
├── frontend-customer/     # Customer Web Application
├── frontend-manager/      # Manager Web Application  
├── frontend-admin/       # Admin Web Application
├── frontend-driver/        # Driver Mobile Application
└── cline_docs/           # Project Documentation
```

## Backend Structure
```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication & authorization
│   │   ├── bus-route/    # Bus route management
│   │   ├── bus-schedule/ # Schedule management
│   │   ├── bus-stop/     # Bus stop management
│   │   ├── bus-tracking/ # Real-time tracking
│   │   ├── driver/       # Driver management
│   │   ├── pricing/      # Pricing system
│   │   ├── ticket/       # Ticket management
│   │   └── vehicle/      # Vehicle management
│   ├── share/            # Shared resources
│   │   ├── enums/        # Enumerations
│   │   ├── interfaces/   # Common interfaces
│   │   └── utils/        # Utility functions
│   └── config/           # Configuration files
└── test/                 # Test files
```

## Frontend Customer Structure
```
frontend-customer/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── booking/     # Booking process
│   │   ├── profile/     # User profile
│   │   └── tracking/    # Trip tracking
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
└── public/              # Static assets
```

## Frontend Manager Structure
```
frontend-manager/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication
│   │   ├── drivers/    # Driver management
│   │   ├── schedules/  # Schedule management
│   │   ├── bookings/   # Booking management
│   │   └── reports/    # Analytics & reports
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   └── styles/         # Global styles
└── public/             # Static assets
```

## Frontend Admin Structure
```
frontend-admin/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   │   ├── auth/      # Authentication
│   │   ├── users/     # User management
│   │   ├── routes/    # Route management
│   │   ├── pricing/   # Pricing management
│   │   └── settings/  # System settings
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   └── styles/        # Global styles
└── public/            # Static assets
```

## Mobile Driver Structure
```
mobile-driver/
├── src/
│   ├── components/    # Reusable components
│   ├── screens/      # App screens
│   │   ├── auth/     # Authentication
│   │   ├── trips/    # Trip management
│   │   ├── tracking/ # Location tracking
│   │   └── profile/  # Driver profile
│   ├── services/     # API services
│   ├── hooks/        # Custom hooks
│   └── styles/       # Global styles
├── assets/           # App assets
└── android/         # Android specific
└── ios/            # iOS specific
```

## API Modification Guidelines

### Backend Changes
1. Locate the relevant module in `backend/src/modules/`
2. Update the following files as needed:
   - `*.controller.ts` for endpoint modifications
   - `*.service.ts` for business logic
   - `*.dto.ts` for data transfer objects
   - `*.schema.ts` for database schema changes

### Frontend Changes
1. Customer Web App (`frontend-customer/`)
   - Update components in `src/components/`
   - Modify pages in `src/pages/`
   - Update API calls in `src/services/`

2. Manager Web App (`frontend-manager/`)
   - Update management interfaces
   - Modify reporting components
   - Update driver management features

3. Admin Web App (`frontend-admin/`)
   - Update system configuration
   - Modify route management
   - Update pricing settings

### Mobile Changes
1. Driver App (`mobile-driver/`)
   - Update tracking features
   - Modify trip management
   - Update real-time features

## Version Control Guidelines
- Create feature branches from `develop`
- Use meaningful commit messages
- Create pull requests for review
- Merge only after approval 