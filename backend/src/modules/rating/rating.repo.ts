import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRatingRepository } from 'src/modules/rating/rating.port';
import { Rating, RatingDocument } from 'src/modules/rating/rating.schema';
import { QueryOptions } from 'src/share/interface';
import { getSelectData } from 'src/share/utils';
import { applyQueryOptions } from 'src/share/utils/query-params.util';

@Injectable()
export class RatingRepository implements IRatingRepository {
  constructor(@InjectModel(Rating.name) private readonly RatingModel: Model<Rating>) { }

  async create(data: any): Promise<RatingDocument> {
    const newRating = new this.RatingModel(data);
    const savedRating = await newRating.save();
    return savedRating;
  }

  async getRatingById(id: string): Promise<RatingDocument> {
    const rating = await this.RatingModel.findById(id);
    return rating;
  }
  async getRatings(query: object, select: string[], options?: QueryOptions): Promise<RatingDocument[]> {
    let queryBuilder = this.RatingModel
      .find(query)
      .select(getSelectData(select));
    if (select && select.length > 0) {
      queryBuilder = queryBuilder.select(getSelectData(select));
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }
  async findOneRating(query: object, select: string[]): Promise<RatingDocument> {
    const rating = await this.RatingModel.findOne(query).select(getSelectData(select));
    return rating;
  }
}
