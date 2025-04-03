import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBusRouteService } from '../bus-route/bus-route.port';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { CreateTicketDto, UpdateTicketStatusDto } from './ticket.dto';
import { TICKET_REPOSITORY, TRIP_SEAT_REPOSITORY } from './ticket.di-token';
import { ITicketRepository, ITicketService, ITripSeatRepository } from './ticket.port';
import { TicketDocument } from './ticket.schema';
import { TicketStatus } from 'src/share/enums/ticket.enum';
import { TicketGateway } from './ticket.gateway';

@Injectable()
export class TicketService implements ITicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(TRIP_SEAT_REPOSITORY)
    private readonly tripSeatRepository: ITripSeatRepository,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
    private readonly ticketGateway: TicketGateway,
  ) {}

  async createTicket(createTicketDto: CreateTicketDto): Promise<TicketDocument> {
    // Kiểm tra số ghế còn trống
    const isAvailable = await this.checkAvailability(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats,
    );

    if (!isAvailable) {
      throw new BadRequestException('Not enough seats available for this trip segment');
    }

    // Tính giá vé
    const fare = await this.busRouteService.calculateFare(
      createTicketDto.busRoute,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats,
    );

    // Tạo vé
    const ticket = await this.ticketRepository.create({
      ...createTicketDto,
      fare,
    });

    // Cập nhật số ghế đã đặt
    await this.tripSeatRepository.updateSeats(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats,
    );

    // Thông báo cập nhật số ghế trống
    const occupiedSeats = await this.tripSeatRepository.getOccupiedSeats(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
    );
    const MAX_SEATS = 50; // Should get from vehicle config
    await this.ticketGateway.notifySeatsUpdate(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      MAX_SEATS - occupiedSeats,
    );

    // Thông báo trạng thái vé mới
    await this.ticketGateway.notifyTicketStatusChange(ticket);

    return ticket;
  }

  async checkAvailability(
    tripId: string,
    fromStop: string,
    toStop: string,
    seatsRequired: number,
  ): Promise<boolean> {
    return this.tripSeatRepository.checkAvailability(
      tripId,
      fromStop,
      toStop,
      seatsRequired,
    );
  }

  async updateStatus(ticketId: string, updateStatusDto: UpdateTicketStatusDto): Promise<TicketDocument> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Validate status transition
    this.validateStatusTransition(ticket.status, updateStatusDto.status);

    const updatedTicket = await this.ticketRepository.updateStatus(ticketId, updateStatusDto.status);

    // Thông báo cập nhật trạng thái vé
    await this.ticketGateway.notifyTicketStatusChange(updatedTicket);

    return updatedTicket;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions = {
      [TicketStatus.PENDING]: [TicketStatus.BOOKED, TicketStatus.CANCELLED],
      [TicketStatus.BOOKED]: [TicketStatus.CHECKED_IN, TicketStatus.CANCELLED],
      [TicketStatus.CHECKED_IN]: [TicketStatus.COMPLETED],
      [TicketStatus.COMPLETED]: [],
      [TicketStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async checkIn(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.updateStatus(ticketId, { status: TicketStatus.CHECKED_IN });

    // Cập nhật danh sách hành khách đã check-in
    const activePassengers = await this.getActivePassengers(ticket.busTrip.toString());
    await this.ticketGateway.notifyPassengerList(ticket.busTrip.toString(), activePassengers);

    return ticket;
  }

  async complete(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.updateStatus(ticketId, { status: TicketStatus.COMPLETED });

    // Cập nhật danh sách hành khách
    const activePassengers = await this.getActivePassengers(ticket.busTrip.toString());
    await this.ticketGateway.notifyPassengerList(ticket.busTrip.toString(), activePassengers);

    return ticket;
  }

  async cancel(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Chỉ cho phép hủy vé ở trạng thái PENDING hoặc BOOKED
    if (![TicketStatus.PENDING, TicketStatus.BOOKED].includes(ticket.status as TicketStatus)) {
      throw new BadRequestException('Cannot cancel ticket in current status');
    }

    // Cập nhật lại số ghế trống
    await this.tripSeatRepository.updateSeats(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      -ticket.numberOfSeats, // Trừ đi số ghế đã đặt
    );

    const cancelledTicket = await this.updateStatus(ticketId, { status: TicketStatus.CANCELLED });

    // Thông báo cập nhật số ghế trống
    const occupiedSeats = await this.tripSeatRepository.getOccupiedSeats(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
    );
    const MAX_SEATS = 50; // Should get from vehicle config
    await this.ticketGateway.notifySeatsUpdate(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      MAX_SEATS - occupiedSeats,
    );

    return cancelledTicket;
  }

  async getActivePassengers(tripId: string): Promise<TicketDocument[]> {
    const passengers = await this.ticketRepository.findActiveByTrip(tripId);
    await this.ticketGateway.notifyPassengerList(tripId, passengers);
    return passengers;
  }
}