import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTicketDto, ITicketData } from './ticket.dto';
import { ITicketRepository } from './ticket.port';
import { Ticket, TicketDocument } from './ticket.schema';
import { TicketStatus } from 'src/share/enums/ticket.enum';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async create(ticket: ITicketData): Promise<TicketDocument> {
    const newTicket = new this.ticketModel({
      ...ticket,
      status: TicketStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newTicket.save();
    
    return this.ticketModel.findById(newTicket._id)
      .populate([
        {
          path: 'busRoute',
          populate: {
            path: 'vehicleCategory',
            select: 'name description'
          }
        },
        {
          path: 'busTrip',
          select: 'startTime endTime status'
        },
        {
          path: 'fromStop',
          select: 'name position address'
        },
        {
          path: 'toStop',
          select: 'name position address'
        },
        {
          path: 'passenger',
          select: 'name phone email'
        }
      ])
      .exec();
  }

  async findById(id: string): Promise<TicketDocument> {
    return this.ticketModel.findById(id)
      .populate([
        {
          path: 'busRoute',
          populate: {
            path: 'vehicleCategory',
            select: 'name description'
          }
        },
        {
          path: 'busTrip',
          select: 'startTime endTime status'
        },
        {
          path: 'fromStop',
          select: 'name position address'
        },
        {
          path: 'toStop',
          select: 'name position address'
        },
        {
          path: 'passenger',
          select: 'name phone email'
        }
      ])
      .exec();
  }

  async updateStatus(id: string, status: string): Promise<TicketDocument> {
    return this.ticketModel
      .findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true },
      )
      .populate([
        {
          path: 'busRoute',
          populate: {
            path: 'vehicleCategory',
            select: 'name description'
          }
        },
        {
          path: 'busTrip',
          select: 'startTime endTime status'
        },
        {
          path: 'fromStop',
          select: 'name position address'
        },
        {
          path: 'toStop',
          select: 'name position address'
        },
        {
          path: 'passenger',
          select: 'name phone email'
        }
      ])
      .exec();
  }

  async findActiveByTrip(tripId: string): Promise<TicketDocument[]> {
    return this.ticketModel.find({
      busTrip: tripId,
      status: { $in: [TicketStatus.BOOKED, TicketStatus.CHECKED_IN] }
    })
    .populate([
      {
        path: 'busRoute',
        populate: {
          path: 'vehicleCategory',
          select: 'name description'
        }
      },
      {
        path: 'busTrip',
        select: 'startTime endTime status'
      },
      {
        path: 'fromStop',
        select: 'name position address'
      },
      {
        path: 'toStop',
        select: 'name position address'
      },
      {
        path: 'passenger',
        select: 'name phone email'
      }
    ])
    .exec();
  }
} 