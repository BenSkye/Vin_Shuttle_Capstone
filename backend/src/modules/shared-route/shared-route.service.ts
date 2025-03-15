import { Inject } from "@nestjs/common";
import { OSR_SERVICE } from "src/modules/OSR/osr.di-token";
import { IRoutingOSRMService } from "src/modules/OSR/osr.port";
import { SHARE_ROUTE_REPOSITORY } from "src/modules/shared-route/shared-route.di-token";
import { ICreateSharedRouteDTO, searchSharedRouteDTO, sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { ISharedRouteRepository, ISharedRouteService } from "src/modules/shared-route/shared-route.port";
import { SharedRouteDocument } from "src/modules/shared-route/shared-route.schema";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ITripRepository } from "src/modules/trip/trip.port";
import { TempTripId } from "src/share/enums/osr.enum";
import { SharedRouteStatus, SharedRouteStopsType } from "src/share/enums/shared-route.enum";

export class SharedRouteService implements ISharedRouteService {
    constructor(
        @Inject(SHARE_ROUTE_REPOSITORY)
        private readonly sharedRouteRepository: ISharedRouteRepository,
        @Inject(OSR_SERVICE)
        private readonly osrService: IRoutingOSRMService,
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository
    ) { }

    async findBestRouteForNewTrip(searchDto: searchSharedRouteDTO): Promise<{
        SharedRouteDocument: SharedRouteDocument,
        durationToNewTripStart: number,
        durationToNewTripEnd: number,
        distanceToNewTripStart: number,
        distanceToNewTripEnd: number,
    }> {
        let durationToNewTripStart = 0;
        let durationToNewTripEnd = 0;
        let distanceToNewTripStart = 0;
        let distanceToNewTripEnd = 0
        const listSharedRoute = await this.sharedRouteRepository.find(
            {
                status: { $in: [SharedRouteStatus.PLANNED, SharedRouteStatus.IN_PROGRESS] }
            },
            ['_id', 'stops', 'vehicleId']
        );

        const newStartStop: sharedRouteStop = {
            order: 0,
            pointType: SharedRouteStopsType.START_POINT,
            trip: TempTripId,
            point: searchDto.startPoint,
            isPass: false
        }

        const newEndStop: sharedRouteStop = {
            order: 0,
            pointType: SharedRouteStopsType.END_POINT,
            trip: TempTripId,
            point: searchDto.endPoint,
            isPass: false
        }

        let bestRouteForNewTripId = null;
        let bestStopArray: sharedRouteStop[] = []
        let shortestLength = 0;
        for (const sharedRoute of listSharedRoute) {
            let stops = sharedRoute.stops;
            stops = [...stops, newStartStop, newEndStop];
            stops.filter(stop => stop.isPass === false);
            const vehicleId = sharedRoute.vehicleId.toString();
            const route = await this.osrService.getRoute(stops, vehicleId);
            console.log('sharedRouteStop', route.sharedRouteStop);
            if (!bestRouteForNewTripId || route.distance < shortestLength) {
                shortestLength = route.distance;
                bestRouteForNewTripId = sharedRoute._id;
                bestStopArray = route.sharedRouteStop;
                durationToNewTripStart = route.durationToNewTripStart;
                durationToNewTripEnd = route.durationToNewTripEnd;
                distanceToNewTripStart = route.distanceToNewTripStart;
                distanceToNewTripEnd = route.distanceToNewTripEnd;
            }
        }

        if (bestRouteForNewTripId === null) {
            return null;
        }
        const bestSharedRoute = await this.sharedRouteRepository.findById(bestRouteForNewTripId);
        const shareRouteTemp = bestSharedRoute;
        shareRouteTemp.stops = bestStopArray;
        await this.sharedRouteRepository.saveToRedis(shareRouteTemp)
        return {
            SharedRouteDocument: bestSharedRoute,
            durationToNewTripStart,
            durationToNewTripEnd,
            distanceToNewTripStart,
            distanceToNewTripEnd
        }
    }


    async createSharedRoute(createSharedRouteDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument> {
        return await this.sharedRouteRepository.create(createSharedRouteDto);
    }

    async updateSharedRoute(shareRouteId: string, updateDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument> {
        return await this.sharedRouteRepository.update(shareRouteId, updateDto);
    }

    async saveASharedRouteFromRedisToDBByTripID(tripId: string): Promise<SharedRouteDocument> {

        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            return null;
        }
        const sharedRouteId = trip.servicePayload.bookingShare.sharedRoute.toString();
        const oldSharedRoute = await this.sharedRouteRepository.findById(sharedRouteId);
        const sharedRoute = await this.sharedRouteRepository.findInRedis(sharedRouteId);
        if (!sharedRoute) {
            return null;
        }
        const stops = sharedRoute.stops;
        const stopHasPass = oldSharedRoute.stops.filter(stop => {
            return stop.isPass === true
        })
        console.log('stopHasPass', stopHasPass);
        const baseOrder = stopHasPass.length;
        const newStop = stopHasPass
        stops.forEach(stop => {
            if (stop.trip === TempTripId) {
                stop.trip = trip._id.toString();
            }
            stop.order = baseOrder + stop.order;
            newStop.push(stop);
            console.log('baseOrder', baseOrder);
        });
        console.log('newStop', newStop);
        return await this.sharedRouteRepository.update(sharedRouteId, {
            stops: newStop
        });
    }

}