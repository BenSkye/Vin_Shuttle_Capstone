import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IRatingRepository } from "src/modules/rating/rating.port";
import { Rating, RatingDocument } from "src/modules/rating/rating.schema";
import { getSelectData } from "src/share/utils";

@Injectable()
export class RatingRepository implements IRatingRepository {
    constructor(
        @InjectModel(Rating.name) private readonly RatingModel: Model<Rating>
    ) { }

    async create(data: any): Promise<RatingDocument> {
        const newRating = new this.RatingModel(data)
        const savedRating = await newRating.save();
        return savedRating
    }

    async getRatingById(id: string): Promise<RatingDocument> {
        const rating = await this.RatingModel.findById(id)
        return rating
    }
    async getRatings(query: object, select: string[]): Promise<RatingDocument[]> {
        const ratings = await this.RatingModel.find(query).select(getSelectData(select))
        return ratings
    }
    async findOneRating(query: object, select: string[]): Promise<RatingDocument> {
        const rating = await this.RatingModel.findOne(query).select(getSelectData(select))
        return rating
    }
}