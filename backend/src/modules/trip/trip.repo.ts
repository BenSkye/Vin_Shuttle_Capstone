import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateTripDto } from "src/modules/trip/trip.dto";
import { ITripRepository } from "src/modules/trip/trip.port";
import { Trip, TripDocument } from "src/modules/trip/trip.schema";
import { getSelectData } from "src/share/utils";

@Injectable()
export class TripRepository implements ITripRepository {
    constructor(
        @InjectModel(Trip.name)
        private readonly tripModel: Model<Trip>
    ) { }

    async create(tripDto: ICreateTripDto): Promise<TripDocument> {
        const newTrip = new this.tripModel(tripDto)
        return await newTrip.save();
    }
    async findById(id: string): Promise<TripDocument> {
        return await this.tripModel.findById(id).populate('customerId', 'name').populate('driverId', 'name').populate('vehicleId')
    }
    async findByDriverId(driverId: string): Promise<TripDocument[]> {
        return await this.tripModel.find({ driverId: driverId }).populate('customerId', 'name').populate('driverId', 'name').populate('vehicleId')
    }
    async find(query: any, select: string[]): Promise<TripDocument[]> {
        return await this.tripModel.find(query).select(getSelectData(select)).populate('customerId', 'name').populate('driverId', 'name').populate('vehicleId')
    }
    async updateStatus(id: string, status: string): Promise<TripDocument> {
        return await this.tripModel.findByIdAndUpdate(id, { status })
    }
}