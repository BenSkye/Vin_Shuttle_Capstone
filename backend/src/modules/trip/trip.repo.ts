import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateTripDto, IUpdateTripDto } from 'src/modules/trip/trip.dto';
import { ITripRepository } from 'src/modules/trip/trip.port';
import { Trip, TripDocument } from 'src/modules/trip/trip.schema';
import { TripStatus } from 'src/share/enums';
import { getSelectData } from 'src/share/utils';

@Injectable()
export class TripRepository implements ITripRepository {
  constructor(
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
  ) { }

  async create(tripDto: ICreateTripDto): Promise<TripDocument> {
    const newTrip = new this.tripModel(tripDto)
    return await newTrip.save();
  }
  async findById(id: string): Promise<TripDocument> {
    return await this.tripModel.findById(id).populate('customerId', 'name phone email').populate('driverId', 'name phone email').populate('vehicleId')
  }
  async findByDriverId(driverId: string): Promise<TripDocument[]> {
    return await this.tripModel.find({ driverId: driverId }).populate('customerId', 'name phone email').populate('driverId', 'name phone email').populate('vehicleId')
  }
  async find(query: any, select: string[]): Promise<TripDocument[]> {
    return await this.tripModel.find(query).select(getSelectData(select)).populate('customerId', 'name phone email').populate('driverId', 'name phone email').populate('vehicleId')
  }

  async findOne(query: any, select: string[]): Promise<TripDocument> {
    return await this.tripModel.findOne(query).select(getSelectData(select)).populate('customerId', 'name phone email').populate('driverId', 'name phone email').populate('vehicleId')
  }

  async updateStatus(id: string, status: TripStatus): Promise<TripDocument> {
    const trip = await this.tripModel.findById(id);
    if (!trip) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Trip not found ${id}`,
        vnMesage: `Không thấy chuyến đi ${id}`,
      }, HttpStatus.BAD_REQUEST);
    }

    trip.status = status;
    return await trip.save();
  }

  async updateTrip(id: string, updateTripDto: IUpdateTripDto): Promise<TripDocument> {
    const trip = await this.tripModel.findById(id);
    if (!trip) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Trip not found ${id}`,
        vnMessage: `Không tìm thấy chuyến đi ${id}`,
      }, HttpStatus.NOT_FOUND);
    }
    trip.set(updateTripDto);
    return await trip.save();
  }

  async deleteTrip(id: string): Promise<void> {
    return await this.tripModel.findByIdAndDelete(id);
  }
}
