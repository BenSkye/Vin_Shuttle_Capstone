# Bus Tracking System - VinShuttle

## Core Components

### Location Tracking
```typescript
interface BusLocation {
  busId: ObjectId;        // Reference to bus/vehicle
  tripId: ObjectId;       // Current trip reference
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  }
  speed: number;         // Current speed (km/h)
  heading: number;       // Direction in degrees
  timestamp: Date;       // Update timestamp
  status: VehicleStatus; // Operating status
}
```

### Route Progress
```typescript
interface RouteProgress {
  tripId: ObjectId;      // Trip reference
  currentStop: ObjectId; // Current/Last stop
  nextStop: ObjectId;    // Next scheduled stop
  distanceToNext: number; // Distance to next stop (km)
  estimatedArrival: Date; // ETA at next stop
  delayMinutes: number;  // Delay from schedule
  completedStops: ObjectId[]; // Completed stops in sequence
}
```

## Real-time Features

### WebSocket Events
1. Location Updates
   - Position changes
   - Speed updates
   - Heading changes
   - Status changes

2. Stop Events
   - Arrival notifications
   - Departure updates
   - Delay broadcasts
   - Schedule adherence

3. Passenger Updates
   - Boarding counts
   - Available seats
   - Stop-wise occupancy
   - Capacity alerts

### Monitoring System
1. Vehicle Monitoring
   - Real-time location
   - Speed tracking
   - Route adherence
   - Schedule compliance

2. Stop Monitoring
   - Arrival predictions
   - Passenger counts
   - Delay tracking
   - Service disruptions

## Business Logic

### Location Processing
1. Position Updates
   - Validate coordinates
   - Calculate speed
   - Determine heading
   - Update frequency: 10s

2. Route Matching
   - Match to planned route
   - Detect deviations
   - Calculate progress
   - Update ETAs

### Stop Management
1. Arrival Detection
   - Geofence triggers
   - Dwell time tracking
   - Schedule comparison
   - Status updates

2. Departure Processing
   - Confirm departure
   - Update next stop
   - Recalculate ETAs
   - Notify subscribers

## Integration Points

### Schedule Integration
- Trip validation
- Schedule updates
- Driver assignments
- Vehicle assignments

### Passenger Integration
- Boarding validation
- Seat availability
- Stop notifications
- Delay alerts

### Driver Integration
- Status updates
- Route guidance
- Schedule alerts
- Passenger counts

## Repository Layer

### Location Repository
```typescript
interface ILocationRepository {
  updateLocation(busId: string, data: Partial<BusLocation>): Promise<void>;
  getLastLocation(busId: string): Promise<BusLocation>;
  getLocationHistory(busId: string, start: Date, end: Date): Promise<BusLocation[]>;
  getActiveVehicles(): Promise<BusLocation[]>;
}
```

### Progress Repository
```typescript
interface IProgressRepository {
  updateProgress(tripId: string, data: Partial<RouteProgress>): Promise<void>;
  getTripProgress(tripId: string): Promise<RouteProgress>;
  getDelayedTrips(): Promise<RouteProgress[]>;
  getCompletedStops(tripId: string): Promise<ObjectId[]>;
}
```

## Service Layer

### Tracking Service
1. Location Services
   - Process updates
   - Calculate metrics
   - Detect events
   - Manage history

2. Progress Services
   - Update progress
   - Calculate delays
   - Manage stops
   - Handle events

### Notification Service
1. Event Broadcasting
   - Location updates
   - Stop arrivals
   - Delay alerts
   - Status changes

2. Subscription Management
   - User subscriptions
   - Route monitoring
   - Stop notifications
   - Delay alerts

## Validation Rules

### Location Validation
- Coordinate bounds
- Speed limits
- Update frequency
- Position accuracy

### Progress Validation
- Stop sequence
- Time windows
- Distance checks
- Status transitions 