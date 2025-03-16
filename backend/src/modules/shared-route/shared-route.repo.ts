import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateSharedRouteDTO, IUpdateSharedRouteDTO } from "src/modules/shared-route/shared-route.dto";
import { ISharedRouteRepository } from "src/modules/shared-route/shared-route.port";
import { SharedRoute, SharedRouteDocument } from "src/modules/shared-route/shared-route.schema";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/share/di-token";
import { getSelectData } from "src/share/utils";
import { paymentTime } from "src/share/enums/payment.enum";
import { SharedRouteStatus } from "src/share/enums/shared-route.enum";


export class SharedRouteRepository implements ISharedRouteRepository {

    constructor(
        @InjectModel(SharedRoute.name)
        private readonly shareRouteModel: Model<SharedRoute>,
        @Inject(REDIS_CLIENT)
        private readonly redisClient: Redis
    ) { }

    async create(createDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument> {
        const newShareRoute = new this.shareRouteModel(createDto)
        return await newShareRoute.save();
    }
    async find(query: any, select: string[]): Promise<SharedRouteDocument[]> {
        return await this.shareRouteModel.find(query).select(getSelectData(select))
    }
    async findOne(query: any, select: string[]): Promise<SharedRouteDocument> {
        return await this.shareRouteModel.findOne(query).select(getSelectData(select))
    }

    async findById(id: string): Promise<SharedRouteDocument> {
        return await this.shareRouteModel.findById(id)
    }

    async update(shareRouteId: string, updateDto: IUpdateSharedRouteDTO): Promise<SharedRouteDocument> {
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

    async updateStatusShareRoute(shareRouteId: string, status: SharedRouteStatus): Promise<SharedRouteDocument> {
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

    async saveToRedis(sharedRoute: SharedRouteDocument): Promise<void> {
        try {

            const key = `${SharedRoute.name}:${sharedRoute._id.toString()}`;


            const value = JSON.stringify(sharedRoute.toObject());

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

    async findInRedis(id: string): Promise<SharedRouteDocument> {
        try {
            const key = `${SharedRoute.name}:${id}`;
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