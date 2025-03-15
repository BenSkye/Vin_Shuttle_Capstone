import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateSharedRouteDTO, IUpdateSharedRouteDTO } from "src/modules/shared-route/shared-route.dto";
import { ISharedRouteRepository } from "src/modules/shared-route/shared-route.port";
import { SharedRoute, SharedRouteDocument } from "src/modules/shared-route/shared-route.schema";
import { getSelectData } from "src/share/utils";


export class SharedRouteRepository implements ISharedRouteRepository {

    constructor(
        @InjectModel(SharedRoute.name)
        private readonly shareRouteModel: Model<SharedRoute>,
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

    async delete(query: any): Promise<any> {
        return await this.shareRouteModel.deleteMany(query
        )
    }

    async deleteById(id: string): Promise<any> {
        return await this.shareRouteModel.findByIdAndDelete(id)
    }
}