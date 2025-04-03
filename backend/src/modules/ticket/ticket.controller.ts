import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckAvailabilityDto, CreateTicketDto, UpdateTicketStatusDto } from './ticket.dto';
import { TICKET_SERVICE } from './ticket.di-token';
import { ITicketService } from './ticket.port';
import { TicketDocument } from './ticket.schema';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TICKET_SERVICE)
    private readonly ticketService: ITicketService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async createTicket(@Body() createTicketDto: CreateTicketDto): Promise<TicketDocument> {
    return this.ticketService.createTicket(createTicketDto);
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Check seat availability for a trip segment' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(
    @Body() checkAvailabilityDto: CheckAvailabilityDto,
  ): Promise<{ available: boolean }> {
    const available = await this.ticketService.checkAvailability(
      checkAvailabilityDto.busTrip,
      checkAvailabilityDto.fromStop,
      checkAvailabilityDto.toStop,
      checkAvailabilityDto.seatsRequired,
    );
    return { available };
  }

  @Put(':id/check-in')
  @ApiOperation({ summary: 'Check in a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket checked in successfully' })
  async checkIn(@Param('id') id: string): Promise<TicketDocument> {
    return this.ticketService.checkIn(id);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket completed successfully' })
  async complete(@Param('id') id: string): Promise<TicketDocument> {
    return this.ticketService.complete(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket cancelled successfully' })
  async cancel(@Param('id') id: string): Promise<TicketDocument> {
    return this.ticketService.cancel(id);
  }

  @Get('trip/:tripId/passengers')
  @ApiOperation({ summary: 'Get list of active passengers for a trip' })
  @ApiResponse({ status: 200, description: 'List of active passengers' })
  async getActivePassengers(@Param('tripId') tripId: string): Promise<TicketDocument[]> {
    return this.ticketService.getActivePassengers(tripId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTicketStatusDto,
  ): Promise<TicketDocument> {
    return this.ticketService.updateStatus(id, updateStatusDto);
  }
}