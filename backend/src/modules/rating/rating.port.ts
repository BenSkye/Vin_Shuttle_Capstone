import { ICreateRating, IGetAverageRating } from 'src/modules/rating/rating.dto';
import { RatingDocument } from 'src/modules/rating/rating.schema';
import { QueryOptions } from 'src/share/interface';

export interface IRatingRepository {
  create(data: ICreateRating): Promise<RatingDocument>;
  getRatingById(id: string): Promise<RatingDocument>;
  getRatings(query: object, select: string[], options?: QueryOptions): Promise<RatingDocument[]>;
  findOneRating(query: object, select: string[]): Promise<RatingDocument>;
}

export interface IRatingService {
  getRatingByTripId(tripId: string): Promise<RatingDocument>;
  createRating(customerId: string, data: ICreateRating): Promise<RatingDocument>;
  averageRating(query: IGetAverageRating): Promise<number>;
  getRatingByQuery(query: any): Promise<RatingDocument[]>;
}
