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
import { MaxDistanceAvailableToChange, SharedRouteStatus, SharedRouteStopsType } from "src/share/enums/shared-route.enum";


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
        console.log('listSharedRoute', listSharedRoute);
        for (const sharedRoute of listSharedRoute) { // loop through all shared routes
            let stops = sharedRoute.stops;
            stops = [...stops, newStartStop, newEndStop];
            stops.filter(stop => stop.isPass === false);
            const vehicleId = sharedRoute.vehicleId.toString();
            const route = await this.osrService.getRoute(stops, vehicleId);
            console.log('route', route);
            if (!route) {
                console.error('Failed to get route for vehicle:', vehicleId);
            }
            console.log('sharedRouteStop', route.sharedRouteStop);
            console.log('perTripDistanceAfterChange71', route.perTripDistanceAfterChange);

            if (!bestRouteForNewTripId || route.distance < shortestLength) {
                const perTripDistanceAfterChange = route.perTripDistanceAfterChange;
                let isValidRoute = true;
                for (const perTripDistance of perTripDistanceAfterChange) {
                    console.log('perTripDistance.tripId', perTripDistance.tripId);
                    if (perTripDistance.tripId === TempTripId) {
                        console.log(perTripDistance.distance + "-" + searchDto.distanceEstimate)
                        if (perTripDistance.distance - searchDto.distanceEstimate > MaxDistanceAvailableToChange) {
                            console.log('is larger than max distance available to change')
                            isValidRoute = false;
                            break
                        }
                    } else {
                        const trip = await this.tripRepository.findById(perTripDistance.tripId, ['servicePayload']);
                        if (trip) {
                            if (perTripDistance.distance - trip.servicePayload.bookingShare.distanceEstimate > MaxDistanceAvailableToChange) {
                                isValidRoute = false;
                                break;
                            }
                        }
                    }
                }
                if (!isValidRoute) {
                    continue;
                }
                shortestLength = route.distance;
                bestRouteForNewTripId = sharedRoute._id;
                bestStopArray = route.sharedRouteStop;
                durationToNewTripStart = route.durationToNewTripStart;
                durationToNewTripEnd = route.durationToNewTripEnd;
                distanceToNewTripStart = route.distanceToNewTripStart;
                distanceToNewTripEnd = route.distanceToNewTripEnd;
            }
        }
        console.log('bestRouteForNewTripId', bestRouteForNewTripId);
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

    async passStartPoint(shareRouteId: string, tripId: string): Promise<SharedRouteDocument> {
        const sharedRoute = await this.sharedRouteRepository.findById(shareRouteId);
        if (!sharedRoute) {
            return null;
        }
        const stops = sharedRoute.stops;
        const newStop = stops.map(stop => {
            if (stop.trip === tripId && stop.pointType === SharedRouteStopsType.START_POINT) {
                stop.isPass = true;
            }
            return stop;
        });
        //if stop is the first stop of share route change status to in progress
        if (newStop[0].trip === tripId) {
            await this.sharedRouteRepository.updateStatusShareRoute(
                shareRouteId,
                SharedRouteStatus.IN_PROGRESS
            );
        }
        return await this.sharedRouteRepository.update(shareRouteId, {
            stops: newStop
        });
    }

    async passEndPoint(shareRouteId: string, tripId: string): Promise<SharedRouteDocument> {
        const sharedRoute = await this.sharedRouteRepository.findById(shareRouteId);
        if (!sharedRoute) {
            return null;
        }
        const stops = sharedRoute.stops;
        const newStop = stops.map(stop => {
            if (stop.trip === tripId && stop.pointType === SharedRouteStopsType.END_POINT) {
                stop.isPass = true;
            }
            return stop;
        }
        );
        //if the stop is the last stop of share route change status to completed
        if (newStop[newStop.length - 1].trip === tripId && newStop[newStop.length - 1].pointType === SharedRouteStopsType.END_POINT) {
            await this.sharedRouteRepository.updateStatusShareRoute(
                shareRouteId,
                SharedRouteStatus.COMPLETED
            );
        }
        return await this.sharedRouteRepository.update(shareRouteId, {
            stops: newStop
        });
    }

    async updateSharedRoute(shareRouteId: string, updateDto: ICreateSharedRouteDTO): Promise<SharedRouteDocument> {
        return await this.sharedRouteRepository.update(shareRouteId, updateDto);
    }

    async updateStatusShareRoute(shareRouteId: string, status: SharedRouteStatus): Promise<SharedRouteDocument> {
        return await this.sharedRouteRepository.updateStatusShareRoute(shareRouteId, status);
    }

    async saveASharedRouteFromRedisToDBByTripID(tripId: string): Promise<SharedRouteDocument> {

        const trip = await this.tripRepository.findById(tripId, ['servicePayload']);
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