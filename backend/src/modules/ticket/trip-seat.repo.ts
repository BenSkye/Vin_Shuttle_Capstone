import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITripSeatRepository } from './ticket.port';
import { TripSeat } from './ticket.schema';

@Injectable()
export class TripSeatRepository implements ITripSeatRepository {
  constructor(
    @InjectModel(TripSeat.name)
    private readonly tripSeatModel: Model<TripSeat>,
  ) {}

  async updateSeats(
    tripId: string,
    fromStop: string,
    toStop: string,
    numberOfSeats: number,
  ): Promise<void> {
    const tripSeat = await this.tripSeatModel.findOne({
      busTrip: tripId,
      fromStop,
      toStop,
    });

    if (!tripSeat) {
      await this.tripSeatModel.create({
        busTrip: tripId,
        fromStop,
        toStop,
        seatsOccupied: numberOfSeats,
      });
    } else {
      await this.tripSeatModel.updateOne(
        { busTrip: tripId, fromStop, toStop },
        { $inc: { seatsOccupied: numberOfSeats } },
      );
    }
  }

  async checkAvailability(
    tripId: string,
    fromStop: string,
    toStop: string,
    seatsRequired: number,
  ): Promise<boolean> {
    const occupiedSeats = await this.getOccupiedSeats(tripId, fromStop, toStop);
    
    // Assuming maximum seats per trip is 50 (should get from vehicle configuration)
    const MAX_SEATS = 50;
    return occupiedSeats + seatsRequired <= MAX_SEATS;
  }

  async getOccupiedSeats(
    tripId: string,
    fromStop: string,
    toStop: string,
  ): Promise<number> {
    const tripSeat = await this.tripSeatModel.findOne({
      busTrip: tripId,
      fromStop,
      toStop,
    });

    return tripSeat ? tripSeat.seatsOccupied : 0;
  }
} 