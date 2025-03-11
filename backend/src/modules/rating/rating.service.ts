import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RATING_REPOSITORY } from "src/modules/rating/rating.di-token";
import { ICreateRating, IGetAverageRating } from "src/modules/rating/rating.dto";
import { IRatingRepository, IRatingService } from "src/modules/rating/rating.port";
import { RatingDocument } from "src/modules/rating/rating.schema";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ITripRepository } from "src/modules/trip/trip.port";
import { TripStatus } from "src/share/enums";


@Injectable()
export class RatingService implements IRatingService {
    constructor(
        @Inject(RATING_REPOSITORY) private readonly ratingRepository: IRatingRepository,
        @Inject(TRIP_REPOSITORY) private readonly tripRepository: ITripRepository
    ) { }

    async createRating(customerId: string, data: ICreateRating): Promise<RatingDocument> {
        const trip = await this.tripRepository.findById(data.tripId)
        if (!trip || trip.customerId._id.toString() !== customerId) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Trip not found ${data.tripId}`,
                vnMessage: `Không tìm thấy chuyến đi ${data.tripId}`
            }, HttpStatus.NOT_FOUND)
        }
        if (trip.status !== TripStatus.COMPLETED) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Trip is not completed yet`,
                vnMessage: `Chuyến đi chưa hoàn thành`
            }, HttpStatus.BAD_REQUEST)
        }
        data.customerId = customerId
        const rating = await this.ratingRepository.create(data)
        await this.tripRepository.updateTrip(data.tripId, { isRating: true })
        return rating

    }
    async getRatingByTripId(tripId: string): Promise<RatingDocument> {
        return await this.ratingRepository.findOneRating({ tripId }, [])
    }

    async averageRating(query: IGetAverageRating): Promise<number> {
        const filter: any = query
        const findQuery: any = {}
        if (query.driverId) {
            findQuery.driverId = query.driverId
        }
        if (query.customerId) {
            findQuery.customerId = query.customerId
        }
        if (query.serviceType) {
            findQuery.serviceType = query.serviceType
        }
        findQuery.status = TripStatus.COMPLETED
        console.log('findQuery', findQuery)
        const trips = await this.tripRepository.find(
            findQuery,
            ['_id'])
        console.log('trips', trips)

        if (trips.length === 0) {
            return 0
        }
        filter.tripId = { $in: trips.map(trip => trip._id) }
        const ratings = await this.ratingRepository.getRatings(
            filter.tripId,
            ['rate']
        )
        if (ratings.length === 0) {
            return 0
        }
        const totalRate = ratings.reduce((total, rating) => total + rating.rate, 0)
        return totalRate / ratings.length
    }


}