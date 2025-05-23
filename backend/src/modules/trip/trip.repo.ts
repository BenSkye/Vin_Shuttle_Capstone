import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import base62 from 'base62';
import { Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { ICreateTripDto, IUpdateTripDto } from 'src/modules/trip/trip.dto';
import { ITripRepository } from 'src/modules/trip/trip.port';
import { Trip, TripDocument } from 'src/modules/trip/trip.schema';
import { TripStatus } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';
import { codeGenerator, getSelectData } from 'src/share/utils';
import { applyQueryOptions } from 'src/share/utils/query-params.util';

@Injectable()
export class TripRepository implements ITripRepository {
  constructor(
    @InjectModel(Trip.name)
    private readonly tripModel: Model<Trip>,
  ) { }

  async create(tripDto: ICreateTripDto): Promise<TripDocument> {
    tripDto.code = await this.generateUniqueShortCode();
    const newTrip = new this.tripModel(tripDto);
    return await newTrip.save();
  }
  async findById(id: string, select: string[]): Promise<TripDocument> {
    return await this.tripModel
      .findById(id)
      .select(getSelectData(select))
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email')
      .populate('vehicleId');
  }
  async findByDriverId(driverId: string): Promise<TripDocument[]> {
    return await this.tripModel
      .find({ driverId: driverId })
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email')
      .populate('vehicleId');
  }
  async find(query: any, select: string[], options?: QueryOptions): Promise<TripDocument[]> {
    let queryBuilder = this.tripModel
      .find(query)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email')
      .populate('vehicleId');
    if (select && select.length > 0) {
      queryBuilder = queryBuilder.select(getSelectData(select));
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }

  async findWithNotPopulate(query: any, select: string[], options?: QueryOptions): Promise<TripDocument[]> {
    let queryBuilder = this.tripModel
      .find(query)
    if (select && select.length > 0) {
      queryBuilder = queryBuilder.select(getSelectData(select));
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }

  async findOne(query: any, select: string[]): Promise<TripDocument> {
    return await this.tripModel
      .findOne(query)
      .select(getSelectData(select))
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email')
      .populate('vehicleId');
  }

  async updateStatus(id: string, status: TripStatus): Promise<TripDocument> {
    const trip = await this.tripModel.findById(id);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Trip not found ${id}`,
          vnMessage: `Không thấy cuốc xe ${id}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    trip.status = status;
    return await trip.save();
  }

  async updateTrip(id: string, updateTripDto: IUpdateTripDto): Promise<TripDocument> {
    const trip = await this.tripModel.findById(id);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Trip not found ${id}`,
          vnMessage: `Không tìm thấy cuốc xe ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    trip.set(updateTripDto);
    return await trip.save();
  }

  async deleteTrip(id: string): Promise<void> {
    return await this.tripModel.findByIdAndDelete(id);
  }

  generateShortCode(): string {
    return codeGenerator()
  }

  async generateUniqueShortCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = this.generateShortCode();
      const existingTrip = await this.tripModel.findOne({ code });
      if (!existingTrip) isUnique = true;
    }

    return code;
  }
}
