import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateSharedItineraryDTO, IUpdateSharedItineraryDTO } from "src/modules/shared-itinerary/shared-itinerary.dto";
import { ISharedItineraryRepository } from "src/modules/shared-itinerary/shared-itinerary.port";
import { SharedItinerary, SharedItineraryDocument } from "src/modules/shared-itinerary/shared-itinerary.schema";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/share/di-token";
import { getSelectData } from "src/share/utils";
import { paymentTime } from "src/share/enums/payment.enum";
import { SharedItineraryStatus } from "src/share/enums/shared-itinerary.enum";


export class SharedItineraryRepository implements ISharedItineraryRepository {

    constructor(
        @InjectModel(SharedItinerary.name)
        private readonly shareRouteModel: Model<SharedItinerary>,
        @Inject(REDIS_CLIENT)
        private readonly redisClient: Redis
    ) { }

    async create(createDto: ICreateSharedItineraryDTO): Promise<SharedItineraryDocument> {
        const newSharedItinerary = new this.shareRouteModel(createDto)
        return await newSharedItinerary.save();
    }
    async find(query: any, select: string[]): Promise<SharedItineraryDocument[]> {
        return await this.shareRouteModel.find(query).select(getSelectData(select))
    }
    async findOne(query: any, select: string[]): Promise<SharedItineraryDocument> {
        return await this.shareRouteModel.findOne(query).select(getSelectData(select))
    }

    async findById(id: string): Promise<SharedItineraryDocument> {
        return await this.shareRouteModel.findById(id)
    }

    async update(shareRouteId: string, updateDto: IUpdateSharedItineraryDTO): Promise<SharedItineraryDocument> {
        const shareRoute = await this.shareRouteModel.findById(shareRouteId);
        if (!shareRoute) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Share route not found ${shareRouteId}`,
                vnMessage: `Không tìm thấy chia sẻ tuyến ${shareRouteId}`,
            }, HttpStatus.NOT_FOUND);
        }
        return await this.shareRouteModel.findByIdAndUpdate(shareRouteId, updateDto, { new: true })
    }

    async updateStatusSharedItinerary(shareRouteId: string, status: SharedItineraryStatus): Promise<SharedItineraryDocument> {
        const shareRoute = await this.shareRouteModel.findById(shareRouteId);
        if (!shareRoute) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Share route not found ${shareRouteId}`,
                vnMessage: `Không tìm thấy chia sẻ tuyến ${shareRouteId}`,
            }, HttpStatus.NOT_FOUND);
        }
        shareRoute.status = status;
        return await shareRoute.save();
    }

    async delete(query: any): Promise<any> {
        return await this.shareRouteModel.deleteMany(query
        )
    }

    async deleteById(id: string): Promise<any> {
        return await this.shareRouteModel.findByIdAndDelete(id)
    }

    async saveToRedis(sharedItinerary: SharedItineraryDocument): Promise<void> {
        try {

            const key = `${SharedItinerary.name}:${sharedItinerary._id.toString()}`;


            const value = JSON.stringify(sharedItinerary.toObject());

            await this.redisClient.set(key, value, 'EX', (paymentTime + 1) * 60); // Hết hạn sau 2 phút

        } catch (error) {
            console.error('Error saving to Redis:', error);
            throw new HttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Không thể lưu vào Redis',
                vnMessage: 'Không thể lưu vào Redis',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findInRedis(id: string): Promise<SharedItineraryDocument> {
        try {
            const key = `${SharedItinerary.name}:${id}`;
            const value = await this.redisClient.get(key);
            if (!value) return null;
            return JSON.parse(value);
        } catch (error) {
            console.error('Error finding in Redis:', error);
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Không thể lấy dữ liệu từ Redis',
                vnMessage: 'Không thể lấy dữ liệu từ Redis',
            }, HttpStatus.NOT_FOUND);
        }
    }
}