import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip } from './trip.schema';
import { CreateTripDto, UpdateTripDto } from './trip.dto';
import { ITripRepository } from 'src/modules/trips/trip.port';

@Injectable()
export class TripRepository implements ITripRepository {
    constructor(
        @InjectModel(Trip.name) private readonly tripModel: Model<Trip>
    ) { }

    async create(trip: CreateTripDto): Promise<Trip> {
        const newTrip = new this.tripModel(trip);
        return await newTrip.save();
    }

    async findById(id: string): Promise<Trip | null> {
        return await this.tripModel.findById(id);
    }

    async find(query: any): Promise<Trip | null> {
        return await this.tripModel.findOne(query);
    }

    async findAll(): Promise<Trip[]> {
        return await this.tripModel.find();
    }

    async update(id: string, trip: UpdateTripDto): Promise<Trip | null> {
        return await this.tripModel.findByIdAndUpdate(id, trip, { new: true });
    }

    // async findByVehicleCategory(category: string): Promise<Trip[]> {
    //     return await this.tripModel.find({ vehicleCategories: category });
    // }
}
