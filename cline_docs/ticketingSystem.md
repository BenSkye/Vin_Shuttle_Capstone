# Ticketing System - VinShuttle

## Core Components

### Ticket Schema
```typescript
interface Ticket {
  busRoute: ObjectId;      // Reference to route
  busTrip: ObjectId;       // Reference to specific trip
  fromStop: ObjectId;      // Boarding stop
  toStop: ObjectId;        // Destination stop
  numberOfSeats: number;   // Number of seats booked
  fare: number;           // Total fare amount
  boardingTime: Date;     // Scheduled boarding time
  expectedDropOffTime: Date; // Expected arrival time
  status: TicketStatus;   // Current ticket status
  passenger: ObjectId;    // Reference to passenger
  passengerInfo: {        // Passenger details
    name: string;
    phone?: string;
    email?: string;
  }
}
```

### Status Management
- Status Types:
  - PENDING: Initial reservation (15-minute hold)
  - BOOKED: Payment confirmed
  - CHECKED_IN: Passenger boarded
  - COMPLETED: Journey finished
  - CANCELLED: Booking cancelled
  - EXPIRED: Pending reservation timeout

- Time Constraints:
  - Pending expiration: 15 minutes
  - Check-in window: 30 minutes pre-departure
  - Cancellation window: 60 minutes pre-departure

### Seat Management
```typescript
interface TripSeat {
  busTrip: ObjectId;     // Trip reference
  fromStop: ObjectId;    // Starting stop
  toStop: ObjectId;      // Ending stop
  seatsOccupied: number; // Number of occupied seats
}
```

## Business Logic

### Ticket Creation
1. Validate route and trip existence
2. Check seat availability
3. Calculate fare based on:
   - Distance between stops
   - Number of seats
   - Vehicle category pricing
4. Create pending ticket
5. Initialize seat reservation

### Status Transitions
- Valid transitions:
  - PENDING → BOOKED/EXPIRED/CANCELLED
  - BOOKED → CHECKED_IN/CANCELLED
  - CHECKED_IN → COMPLETED
  - Any → CANCELLED (with restrictions)

### Seat Availability
- Track occupied seats per segment
- Consider overlapping segments
- Real-time availability updates
- Concurrent booking handling

## Real-time Features

### WebSocket Events
- Ticket status updates
- Seat availability changes
- Passenger list updates
- Check-in notifications

### Room Management
- Trip-specific rooms:
  - Staff monitoring
  - Status broadcasts
- User-specific rooms:
  - Personal ticket updates
  - Boarding notifications

## Integration Points

### Route Integration
- Route validation
- Stop sequence verification
- Distance calculation
- Fare computation

### Schedule Integration
- Trip availability checking
- Time slot validation
- Driver assignment verification
- Vehicle capacity checking

### Payment Integration
- Fare calculation
- Payment processing
- Refund handling
- Transaction tracking

## Validation Rules

### Input Validation
```typescript
interface CreateTicketDto {
  busRoute: string;       // MongoDB ObjectId
  busTrip: string;        // MongoDB ObjectId
  fromStop: string;       // MongoDB ObjectId
  toStop: string;         // MongoDB ObjectId
  numberOfSeats: number;  // Min: 1
  boardingTime: Date;     // Future date
  passengerInfo: {
    name: string;
    phone?: string;
    email?: string;
  }
}
```

### Business Rules
1. Stops must be in route sequence
2. Boarding time within trip schedule
3. Sufficient seat availability
4. Valid passenger information
5. Appropriate fare calculation

## Repository Layer

### Ticket Repository
- Create new tickets
- Find by ID with population
- Update ticket status
- Find active tickets by trip

### Seat Repository
- Update seat occupancy
- Check seat availability
- Get occupied seat count
- Handle concurrent updates