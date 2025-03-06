import { ICreateRating } from "src/modules/rating/rating.dto"
import { RatingDocument } from "src/modules/rating/rating.schema"

export interface IRatingRepository {
    create(data: ICreateRating): Promise<RatingDocument>
    getRatingById(id: string): Promise<RatingDocument>
    getRatings(query: object, select: string[]): Promise<RatingDocument[]>
    findOneRating(query: object, select: string[]): Promise<RatingDocument>
}

export interface IRatingService {
    getRatingByTripId(tripId: string): Promise<RatingDocument>
    createRating(customerId: string, data: ICreateRating): Promise<RatingDocument>
}