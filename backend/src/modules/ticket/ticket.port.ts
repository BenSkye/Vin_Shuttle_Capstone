import { CreateTicketDto, UpdateTicketStatusDto } from './ticket.dto';
import { TicketDocument } from './ticket.schema';

export interface ITicketRepository {
  create(ticket: CreateTicketDto): Promise<TicketDocument>;
  findById(id: string): Promise<TicketDocument>;
  updateStatus(id: string, status: string): Promise<TicketDocument>;
  findActiveByTrip(tripId: string): Promise<TicketDocument[]>;
}

export interface ITripSeatRepository {
  updateSeats(tripId: string, fromStop: string, toStop: string, numberOfSeats: number): Promise<void>;
  checkAvailability(tripId: string, fromStop: string, toStop: string, seatsRequired: number): Promise<boolean>;
  getOccupiedSeats(tripId: string, fromStop: string, toStop: string): Promise<number>;
}

export interface ITicketService {
  createTicket(createTicketDto: CreateTicketDto): Promise<TicketDocument>;
  checkAvailability(tripId: string, fromStop: string, toStop: string, seatsRequired: number): Promise<boolean>;
  checkIn(ticketId: string): Promise<TicketDocument>;
  complete(ticketId: string): Promise<TicketDocument>;
  cancel(ticketId: string): Promise<TicketDocument>;
  getActivePassengers(tripId: string): Promise<TicketDocument[]>;
  updateStatus(ticketId: string, updateStatusDto: UpdateTicketStatusDto): Promise<TicketDocument>;
} 