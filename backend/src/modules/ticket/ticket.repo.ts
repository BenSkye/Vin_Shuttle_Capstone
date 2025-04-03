import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTicketDto } from './ticket.dto';
import { ITicketRepository } from './ticket.port';
import { Ticket, TicketDocument } from './ticket.schema';
import { TicketStatus } from 'src/share/enums/ticket.enum';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async create(ticket: CreateTicketDto): Promise<TicketDocument> {
    const newTicket = new this.ticketModel({
      ...ticket,
      status: TicketStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newTicket.save();
  }

  async findById(id: string): Promise<TicketDocument> {
    return this.ticketModel.findById(id)
      .populate('busRoute')
      .populate('busTrip')
      .populate('fromStop')
      .populate('toStop')
      .exec();
  }

  async updateStatus(id: string, status: string): Promise<TicketDocument> {
    return this.ticketModel
      .findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true },
      )
      .populate('busRoute')
      .populate('busTrip')
      .populate('fromStop')
      .populate('toStop')
      .exec();
  }

  async findActiveByTrip(tripId: string): Promise<TicketDocument[]> {
    return this.ticketModel.find({
      busTrip: tripId,
      status: { $in: [TicketStatus.BOOKED, TicketStatus.CHECKED_IN] }
    })
    .populate('fromStop')
    .populate('toStop')
    .exec();
  }
} 