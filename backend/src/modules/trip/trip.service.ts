import { Inject, Injectable } from "@nestjs/common";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ICreateTripDto } from "src/modules/trip/trip.dto";
import { ITripRepository, ITripService } from "src/modules/trip/trip.port";
import { Trip } from "src/modules/trip/trip.schema";


@Injectable()
export class TripService implements ITripService {
    constructor(
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository
    ) { }

    async createTrip(createTripDto: ICreateTripDto): Promise<Trip> {
        const newTrip = await this.tripRepository.create(createTripDto)
        return newTrip
    }

    async checkTrip(createTripDto: ICreateTripDto): Promise<boolean> {
        const valid = true;
        //

        return valid
    }

}