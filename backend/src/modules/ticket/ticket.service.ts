import { BadRequestException, Inject, Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { IBusRouteService } from '../bus-route/bus-route.port';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { CreateTicketDto, ITicketData, UpdateTicketStatusDto } from './ticket.dto';
import { TICKET_REPOSITORY, TRIP_SEAT_REPOSITORY } from './ticket.di-token';
import { ITicketRepository, ITicketService, ITripSeatRepository } from './ticket.port';
import { TicketDocument } from './ticket.schema';
import { TicketStatus, TICKET_TIME_LIMITS } from 'src/share/enums/ticket.enum';
import { TicketGateway } from './ticket.gateway';
import { VEHICLE_CATEGORY_SERVICE } from '../vehicle-categories/vehicle-category.di-token';
import { IVehicleCategoryService } from '../vehicle-categories/vehicle-category.port';

@Injectable()
export class TicketService implements ITicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(TRIP_SEAT_REPOSITORY)
    private readonly tripSeatRepository: ITripSeatRepository,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
    @Inject(VEHICLE_CATEGORY_SERVICE)
    private readonly vehicleCategoryService: IVehicleCategoryService,
    private readonly ticketGateway: TicketGateway,
  ) {}

  async createTicket(createTicketDto: CreateTicketDto): Promise<TicketDocument> {
    // Get bus route to get vehicle category
    const busRoute = await this.busRouteService.getRouteById(createTicketDto.busRoute);
    if (!busRoute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bus route not found',
          vnMessage: 'Không tìm thấy tuyến xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get vehicle category to check max seats
    const vehicleCategory = await this.vehicleCategoryService.getById(busRoute.vehicleCategory.toString());
    if (!vehicleCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vehicle category not found',
          vnMessage: 'Không tìm thấy loại xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate number of seats against vehicle capacity
    if (createTicketDto.numberOfSeats > vehicleCategory.numberOfSeat) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Maximum ${vehicleCategory.numberOfSeat} seats allowed per booking`,
          vnMessage: `Tối đa ${vehicleCategory.numberOfSeat} ghế cho mỗi lần đặt`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate boarding time
    const now = new Date();
    const boardingTime = new Date(createTicketDto.boardingTime);
    if (boardingTime < now) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cannot book tickets for past departure times',
          vnMessage: 'Không thể đặt vé cho thời gian đã qua',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check seat availability
    const isAvailable = await this.tripSeatRepository.checkAvailability(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats
    );

    if (!isAvailable) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Not enough seats available',
          vnMessage: 'Không đủ ghế trống',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Calculate fare
    const fare = await this.busRouteService.calculateFare(
      createTicketDto.busRoute,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats
    );

    // Create ticket data
    const ticketData: ITicketData = {
      ...createTicketDto,
      fare,
      status: TicketStatus.PENDING,
    };

    // Create ticket
    const ticket = await this.ticketRepository.create(ticketData);

    // Update available seats
    await this.tripSeatRepository.updateSeats(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats
    );

    // Schedule ticket expiration
    setTimeout(async () => {
      const currentTicket = await this.ticketRepository.findById(ticket.id);
      if (currentTicket && currentTicket.status === TicketStatus.PENDING) {
        await this.expireTicket(ticket.id);
      }
    }, TICKET_TIME_LIMITS.PENDING_EXPIRATION * 60 * 1000);

    // Notify about seat update
    await this.ticketGateway.notifySeatsUpdate(
      createTicketDto.busTrip,
      createTicketDto.fromStop,
      createTicketDto.toStop,
      createTicketDto.numberOfSeats
    );

    return ticket;
  }

  private async expireTicket(ticketId: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) return;

    // Update ticket status to EXPIRED
    await this.updateStatus(ticketId, { status: TicketStatus.EXPIRED });

    // Release the seats
    await this.tripSeatRepository.updateSeats(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      -ticket.numberOfSeats
    );

    // Notify about seat update
    await this.ticketGateway.notifySeatsUpdate(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      ticket.numberOfSeats
    );
  }

  async updateStatus(ticketId: string, updateStatusDto: UpdateTicketStatusDto): Promise<TicketDocument> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Validate status transition
    this.validateStatusTransition(ticket.status, updateStatusDto.status);

    // Additional validations based on status
    await this.validateStatusUpdate(ticket, updateStatusDto.status);

    const updatedTicket = await this.ticketRepository.updateStatus(ticketId, updateStatusDto.status);

    // Notify about ticket status change
    await this.ticketGateway.notifyTicketStatusChange(updatedTicket);

    return updatedTicket;
  }

  private async validateStatusUpdate(ticket: TicketDocument, newStatus: string): Promise<void> {
    const now = new Date();
    const boardingTime = new Date(ticket.boardingTime);

    switch (newStatus) {
      case TicketStatus.CHECKED_IN:
        // Can only check in within check-in window
        const checkInStartTime = new Date(boardingTime.getTime() - TICKET_TIME_LIMITS.CHECKIN_WINDOW * 60 * 1000);
        if (now < checkInStartTime) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: `Check-in available ${TICKET_TIME_LIMITS.CHECKIN_WINDOW} minutes before departure`,
              vnMessage: `Có thể check-in ${TICKET_TIME_LIMITS.CHECKIN_WINDOW} phút trước giờ khởi hành`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        break;

      case TicketStatus.CANCELLED:
        if (ticket.status === TicketStatus.CHECKED_IN || ticket.status === TicketStatus.COMPLETED) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Cannot cancel ticket after check-in',
              vnMessage: 'Không thể hủy vé sau khi đã check-in',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Check cancellation window for booked tickets
        if (ticket.status === TicketStatus.BOOKED) {
          const cancellationDeadline = new Date(boardingTime.getTime() - TICKET_TIME_LIMITS.CANCELLATION_WINDOW * 60 * 1000);
          if (now > cancellationDeadline) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Free cancellation available up to ${TICKET_TIME_LIMITS.CANCELLATION_WINDOW} minutes before departure`,
                vnMessage: `Có thể hủy vé miễn phí đến ${TICKET_TIME_LIMITS.CANCELLATION_WINDOW} phút trước giờ khởi hành`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        break;
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions = {
      [TicketStatus.PENDING]: [TicketStatus.BOOKED, TicketStatus.CANCELLED, TicketStatus.EXPIRED],
      [TicketStatus.BOOKED]: [TicketStatus.CHECKED_IN, TicketStatus.CANCELLED],
      [TicketStatus.CHECKED_IN]: [TicketStatus.COMPLETED],
      [TicketStatus.COMPLETED]: [],
      [TicketStatus.CANCELLED]: [],
      [TicketStatus.EXPIRED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async checkIn(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.updateStatus(ticketId, { status: TicketStatus.CHECKED_IN });

    // Update active passengers list
    const activePassengers = await this.getActivePassengers(ticket.busTrip.toString());
    await this.ticketGateway.notifyPassengerList(ticket.busTrip.toString(), activePassengers);

    return ticket;
  }

  async complete(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.updateStatus(ticketId, { status: TicketStatus.COMPLETED });

    // Update active passengers list
    const activePassengers = await this.getActivePassengers(ticket.busTrip.toString());
    await this.ticketGateway.notifyPassengerList(ticket.busTrip.toString(), activePassengers);

    return ticket;
  }

  async cancel(ticketId: string): Promise<TicketDocument> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Update ticket status to CANCELLED
    const cancelledTicket = await this.updateStatus(ticketId, { status: TicketStatus.CANCELLED });

    // Release the seats
    await this.tripSeatRepository.updateSeats(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      -ticket.numberOfSeats
    );

    // Notify about seat update
    await this.ticketGateway.notifySeatsUpdate(
      ticket.busTrip.toString(),
      ticket.fromStop.toString(),
      ticket.toStop.toString(),
      ticket.numberOfSeats
    );

    return cancelledTicket;
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

  async getActivePassengers(tripId: string): Promise<TicketDocument[]> {
    const passengers = await this.ticketRepository.findActiveByTrip(tripId);
    await this.ticketGateway.notifyPassengerList(tripId, passengers);
    return passengers;
  }
}