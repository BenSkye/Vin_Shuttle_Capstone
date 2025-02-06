import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { TRIP_REPOSITORY } from "src/modules/trips/trip.di-token";
import { CreateTripDto, UpdateTripDto } from "src/modules/trips/trip.dto";
import { ITripRepository, ITripService } from "src/modules/trips/trip.port";
import { Trip } from "src/modules/trips/trip.schema";


@Injectable()
export class TripService implements ITripService {
    constructor(
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository
    ) { }

    async createTrip(trip: CreateTripDto): Promise<Trip> {
        const newTrip = await this.tripRepository.create(trip);
        if (!newTrip) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to create trip'
            }, HttpStatus.BAD_REQUEST);
        }
        return newTrip;
    }

    async getTrip(id: string): Promise<Trip> {
        const trip = await this.tripRepository.findById(id);
        if (!trip) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Trip not found'
            }, HttpStatus.NOT_FOUND);
        }
        return trip;
    }

    async getAllTrips(): Promise<Trip[]> {
        return await this.tripRepository.findAll();
    }

    async updateTrip(id: string, trip: UpdateTripDto): Promise<Trip> {
        const updatedTrip = await this.tripRepository.update(id, trip);
        if (!updatedTrip) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to update trip'
            }, HttpStatus.BAD_REQUEST);
        }
        return updatedTrip;

    }

}
