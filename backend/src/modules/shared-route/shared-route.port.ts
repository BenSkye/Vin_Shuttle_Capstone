import { ICreateSharedRouteDTO, IUpdateSharedRouteDTO, searchSharedRouteDTO } from "src/modules/shared-route/shared-route.dto";
import { SharedRouteDocument } from "src/modules/shared-route/shared-route.schema";
import { SharedRouteStatus } from "src/share/enums/shared-route.enum";


export interface ISharedRouteRepository {
    create(createDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument>
    find(query: any, select: string[]): Promise<SharedRouteDocument[]>
    findOne(query: any, select: string[]): Promise<SharedRouteDocument>
    findById(id: string): Promise<SharedRouteDocument>
    update(shareRouteId: string, updateDto: IUpdateSharedRouteDTO): Promise<SharedRouteDocument>
    updateStatusShareRoute(shareRouteId: string, status: SharedRouteStatus): Promise<SharedRouteDocument>
    delete(query: any): Promise<any>
    deleteById(id: string): Promise<any>
    saveToRedis(sharedRoute: SharedRouteDocument): Promise<void>
    findInRedis(id: string): Promise<SharedRouteDocument>
}
export interface ISharedRouteService {
    findBestRouteForNewTrip(searchDto: searchSharedRouteDTO): Promise<{
        SharedRouteDocument: SharedRouteDocument,
        durationToNewTripStart: number,
        durationToNewTripEnd: number,
        distanceToNewTripStart: number,
        distanceToNewTripEnd: number,
    }>

    createSharedRoute(createDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument>
    updateSharedRoute(shareRouteId: string, updateDto: IUpdateSharedRouteDTO): Promise<SharedRouteDocument>
    updateStatusShareRoute(shareRouteId: string, status: SharedRouteStatus): Promise<SharedRouteDocument>
    passStartPoint(shareRouteId: string, tripId: string): Promise<SharedRouteDocument>
    passEndPoint(shareRouteId: string, tripId: string): Promise<SharedRouteDocument>
    saveASharedRouteFromRedisToDBByTripID(tripId: string): Promise<SharedRouteDocument>
}
