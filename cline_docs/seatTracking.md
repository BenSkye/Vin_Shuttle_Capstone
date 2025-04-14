# Seat Tracking System - VinShuttle

## Core Components

### Seat Occupancy
```typescript
interface SeatOccupancy {
  tripId: ObjectId;      // Reference to trip
  fromStop: ObjectId;    // Boarding stop
  toStop: ObjectId;      // Alighting stop
  occupiedSeats: number; // Number of occupied seats
  timestamp: Date;       // Last update time
  status: OccupancyStatus; // Current/Historical
}
```

### Seat Reservation
```typescript
interface SeatReservation {
  ticketId: ObjectId;    // Reference to ticket
  tripId: ObjectId;      // Reference to trip
  seatCount: number;     // Number of seats
  fromStop: ObjectId;    // Boarding stop
  toStop: ObjectId;      // Alighting stop
  status: ReservationStatus; // Active/Completed/Cancelled
  expiryTime: Date;      // Reservation expiry time
}
```

## Business Logic

### Occupancy Management
1. Seat Tracking
   - Current occupancy
   - Stop-wise tracking
   - Capacity monitoring
   - Real-time updates

2. Availability Checking
   - Segment availability
   - Overlap checking
   - Capacity validation
   - Time-based checks

### Reservation Management
1. Seat Reservation
   - Availability check
   - Temporary hold
   - Expiry handling
   - Confirmation process

2. Status Updates
   - Boarding confirmation
   - Completion tracking
   - Cancellation handling
   - Expiry processing

## Real-time Features

### WebSocket Events
1. Occupancy Updates
   - Seat changes
   - Stop updates
   - Capacity alerts
   - Status changes

2. Reservation Events
   - New reservations
   - Confirmations
   - Cancellations
   - Expiry notifications

### Monitoring System
1. Capacity Monitoring
   - Real-time occupancy
   - Stop-wise tracking
   - Trend analysis
   - Alert thresholds

2. Reservation Tracking
   - Active holds
   - Expiry monitoring
   - Confirmation rates
   - Cancellation tracking

## Integration Points

### Trip Integration
- Schedule validation
- Route checking
- Stop sequence
- Time validation

### Ticket Integration
- Booking validation
- Payment status
- Passenger details
- Status updates

### Driver Integration
- Boarding confirmation
- Occupancy updates
- Stop management
- Status reporting

## Repository Layer

### Occupancy Repository
```typescript
interface ISeatOccupancyRepository {
  updateOccupancy(tripId: string, data: Partial<SeatOccupancy>): Promise<void>;
  getOccupancy(tripId: string, fromStop: string, toStop: string): Promise<number>;
  getTripOccupancy(tripId: string): Promise<SeatOccupancy[]>;
  getHistoricalOccupancy(tripId: string, date: Date): Promise<SeatOccupancy[]>;
}
```

### Reservation Repository
```typescript
interface ISeatReservationRepository {
  createReservation(data: CreateReservationDto): Promise<SeatReservation>;
  confirmReservation(ticketId: string): Promise<void>;
  cancelReservation(ticketId: string): Promise<void>;
  getActiveReservations(tripId: string): Promise<SeatReservation[]>;
}
```

## Service Layer

### Occupancy Service
1. Tracking Services
   - Update occupancy
   - Calculate availability
   - Monitor capacity
   - Generate reports

2. Analysis Services
   - Usage patterns
   - Peak detection
   - Trend analysis
   - Optimization suggestions

### Reservation Service
1. Booking Services
   - Process reservations
   - Handle confirmations
   - Manage cancellations
   - Track expirations

2. Notification Services
   - Status updates
   - Expiry alerts
   - Confirmation reminders
   - Capacity notifications

## Validation Rules

### Occupancy Validation
1. Capacity Rules
   - Maximum capacity
   - Segment limits
   - Overlap checking
   - Time constraints

2. Update Rules
   - Valid stops
   - Sequential updates
   - Status transitions
   - Time windows

### Reservation Validation
1. Booking Rules
   - Availability check
   - Duration limits
   - Stop sequence
   - Time validity

2. Status Rules
   - Valid transitions
   - Expiry handling
   - Confirmation windows
   - Cancellation policies 