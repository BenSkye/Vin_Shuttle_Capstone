import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RATING_REPOSITORY } from "src/modules/rating/rating.di-token";
import { ICreateRating } from "src/modules/rating/rating.dto";
import { IRatingRepository, IRatingService } from "src/modules/rating/rating.port";
import { RatingDocument } from "src/modules/rating/rating.schema";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ITripRepository } from "src/modules/trip/trip.port";


@Injectable()
export class RatingService implements IRatingService {
    constructor(
        @Inject(RATING_REPOSITORY) private readonly ratingRepository: IRatingRepository,
        @Inject(TRIP_REPOSITORY) private readonly tripRepository: ITripRepository
    ) { }

    async createRating(customerId: string, data: ICreateRating): Promise<RatingDocument> {
        const trip = await this.tripRepository.findById(data.tripId)
        if (!trip || trip.customerId.toString() !== customerId) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Trip not found ${data.tripId}`,
                vnMessage: `Không tìm thấy chuyến đi ${data.tripId}`
            }, HttpStatus.NOT_FOUND)
        }
        data.customerId = customerId
        return await this.ratingRepository.create(data)

    }
    async getRatingByTripId(tripId: string): Promise<RatingDocument> {
        return await this.ratingRepository.findOneRating({ tripId }, [])
    }

}