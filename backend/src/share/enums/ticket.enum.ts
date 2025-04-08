export enum TicketStatus {
  PENDING = 'pending',      // Ticket is reserved but not paid
  BOOKED = 'booked',       // Ticket is paid and confirmed
  CHECKED_IN = 'checked_in', // Passenger has boarded
  COMPLETED = 'completed',  // Journey completed
  CANCELLED = 'cancelled',  // Ticket cancelled (by user or system)
  EXPIRED = 'expired'      // Pending ticket that wasn't paid within time limit
}

// Time limits for ticket states (in minutes)
export const TICKET_TIME_LIMITS = {
  PENDING_EXPIRATION: 15,  // Pending tickets expire after 15 minutes
  CHECKIN_WINDOW: 30,     // Check-in available 30 minutes before departure
  CANCELLATION_WINDOW: 60  // Free cancellation up to 60 minutes before departure
} as const; 