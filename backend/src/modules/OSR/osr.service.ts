import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { OpenRouteOptimizationRequestDTO, OpenRouteShipmentDTO } from "src/modules/OSR/osr.dto";
import { IRoutingOSRMService } from "src/modules/OSR/osr.port";
import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { TRACKING_SERVICE } from "src/modules/tracking/tracking.di-token";
import { ITrackingService } from "src/modules/tracking/tracking.port";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ITripRepository } from "src/modules/trip/trip.port";
import { TempTripId, TripIdForAtVehiclePosition } from "src/share/enums/osr.enum";
import { SharedRouteStopsType } from "src/share/enums/shared-route.enum";
import { Position } from "src/share/interface";

export class RoutingOSRService implements IRoutingOSRMService {
    private readonly OSR_OPTIMIZATION_API_URL = process.env.OSR_OPTIMIZATION_API_URL;
    private readonly OSR_DIRECTION_API_URL = process.env.OSR_DIRECTION_API_URL;
    private readonly OSR_API_KEY = process.env.OSR_API_KEY;

    constructor(
        private readonly httpService: HttpService,
        @Inject(TRACKING_SERVICE)
        private readonly trackingService: ITrackingService,
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository
    ) { }

    async getRoute(stops: sharedRouteStop[], vehicleId: string): Promise<
        {
            sharedRouteStop: sharedRouteStop[],
            durationToNewTripStart: number,
            durationToNewTripEnd: number,
            distanceToNewTripStart: number,
            distanceToNewTripEnd: number,
            distance: number,
            perTripDistanceAfterChange: {
                tripId: string,
                distance: number
            }[]
        }> {
        try {
            let requestBody: any = await this.convertToOpenRouteFormat(stops, vehicleId);
            requestBody = {
                ...requestBody,
                options: {
                    g: true,
                    metrics: [
                        "distance"
                    ]
                }
            }
            const response = await this.httpService.post(
                this.OSR_OPTIMIZATION_API_URL,
                requestBody,
                { headers: { 'Authorization': this.OSR_API_KEY } }
            ).toPromise();
            const result = await this.parseOpenRouteResponse(response.data, stops);
            console.log('result57', result);
            return result;
        } catch (error) {
            console.log('error', error);
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Failed to get route',
                    vnMessage: 'Không thể lấy tuyến đường',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getDistanceBetweenTwoPoints(startPoint: Position, endPoint: Position): Promise<number> {
        try {
            const url = `${this.OSR_DIRECTION_API_URL}/driving-car?api_key=${this.OSR_API_KEY}&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`;
            console.log('url', url);
            const response = await this.httpService.get(
                url
            ).toPromise();
            return response.data.features[0].properties.summary.distance;
        } catch (error) {
            console.log('error', error);
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Failed to get distance between two points',
                    vnMessage: 'Không thể lấy khoảng cách giữa hai điểm',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private async convertToOpenRouteFormat(
        stops: sharedRouteStop[],
        vehicleId: string
    ): Promise<OpenRouteOptimizationRequestDTO> {
        const lastVehicleLocation = await this.trackingService.getLastVehicleLocation(vehicleId);
        console.log('lastVehicleLocation', lastVehicleLocation);
        // Nhóm các stop theo trip
        const stopsByTrip: Record<
            string,//tripId
            {
                pickup: sharedRouteStop,//trip startPoint
                delivery: sharedRouteStop//trip endPoint
            }
        > = stops.reduce((acc, stop) => {
            const tripId = stop.trip.toString();
            if (!acc[tripId]) acc[tripId] = { pickup: null, delivery: null };

            if (stop.pointType === SharedRouteStopsType.START_POINT) {
                acc[tripId].pickup = stop;
            } else {
                acc[tripId].delivery = stop;
            }

            return acc;
        }, {});

        // Tạo danh sách trips theo định dạng shipment của OpenRouteService
        // Danh sách cuốc xe bao gôm pickup(startPoint) và delivery(endPoint)
        const listTrips: OpenRouteShipmentDTO[] = [];
        // Đánh ID cho các trip trong OpenRouteService theo index
        // Lưu Id của trip vào trong description của pickup và delivery
        let tripIndexId = 1;

        for (const [tripId, stops] of Object.entries(stopsByTrip)) {
            // Xử lý trường hợp thiếu pickup
            let isPickupSubstituted = false

            let pickupStop = stops.pickup;
            if (!pickupStop?.point.position || pickupStop.isPass) {
                pickupStop = {
                    ...pickupStop,
                    point: {
                        position: {
                            lat: lastVehicleLocation.latitude,
                            lng: lastVehicleLocation.longitude
                        },
                        address: 'Vehicle position'
                    },
                };
                isPickupSubstituted = true;
            }

            // Đảm bảo có cả pickup và delivery
            if (stops.delivery && stops.delivery.point.position) {
                listTrips.push({
                    id: tripIndexId++,
                    pickup: {
                        id: tripIndexId * 2 - 1,
                        location: [
                            pickupStop.point.position.lng,
                            pickupStop.point.position.lat
                        ],
                        description: isPickupSubstituted ?
                            `${TripIdForAtVehiclePosition}` :
                            `${tripId}`
                    },
                    delivery: {
                        id: tripIndexId * 2,
                        location: [
                            stops.delivery.point.position.lng,
                            stops.delivery.point.position.lat
                        ],
                        description: `${tripId}`
                    },
                    amount: [1]
                });
            }
        }

        return {
            vehicles: [
                {
                    id: 1,
                    description: vehicleId,
                    profile: 'driving-car',
                    start: [lastVehicleLocation.longitude, lastVehicleLocation.latitude],
                    capacity: [4]
                }
            ],
            shipments: listTrips
        };
    }

    private async parseOpenRouteResponse(response: any, originalStops: sharedRouteStop[]): Promise<{
        sharedRouteStop: sharedRouteStop[];
        durationToNewTripStart: number,
        durationToNewTripEnd: number,
        distanceToNewTripStart: number,
        distanceToNewTripEnd: number,
        distance: number,
        perTripDistanceAfterChange: {
            tripId: string,
            distance: number
        }[]
    }> {

        let durationToNewTripStart = 0;
        let durationToNewTripEnd = 0;
        let distanceToNewTripStart = 0;
        let distanceToNewTripEnd = 0;
        let distance = 0;
        const perTripDistanceAfterChange = [];
        const optimizedStops: sharedRouteStop[] = [];
        if (!response?.routes?.[0]?.steps) return {
            sharedRouteStop: [],
            durationToNewTripStart: durationToNewTripStart,
            durationToNewTripEnd: durationToNewTripEnd,
            distanceToNewTripStart: distanceToNewTripStart,
            distanceToNewTripEnd: distanceToNewTripEnd,
            distance: distance,
            perTripDistanceAfterChange: perTripDistanceAfterChange
        };

        distance = response.summary.distance;
        console.log('originalStops', originalStops);

        console.log('response', response.routes[0].steps);
        for (const step of response.routes[0].steps) {
            console.log('step175', step);

            if (!['pickup', 'delivery'].includes(step.type) || step.description === TripIdForAtVehiclePosition) {
                continue;
            }

            const tripId = step.description;
            const isPickup = step.type === 'pickup';
            const isDelivery = step.type === 'delivery';

            // Tìm điểm gốc tương ứng
            const originalStop = originalStops.find(s =>
                s.trip.toString() === tripId &&
                s.pointType === (isPickup ? SharedRouteStopsType.START_POINT : SharedRouteStopsType.END_POINT)
            );

            console.log('originalStop180', originalStop);
            if (!originalStop) return;

            // Cập nhật duration & distance nếu là trip cần tìm
            if (tripId === TempTripId) {
                if (isPickup) {
                    console.log('duration183', step.duration);
                    durationToNewTripStart = step.duration;
                    distanceToNewTripStart = step.distance;
                } else {
                    console.log('duration188', step.duration);
                    durationToNewTripEnd = step.duration;
                    distanceToNewTripEnd = step.distance;
                }
            }
            step.distance = step.distance / 1000;
            if (isDelivery) {
                const pickupStep = response.routes[0].steps.find(step => step.type === 'pickup' && step.description === tripId);
                let tripDistanceAfterChange = 0
                if (!pickupStep) {
                    const startStep = response.routes[0].steps.find(step => step.description === TripIdForAtVehiclePosition);
                    startStep.distance = startStep.distance / 1000;
                    console.log('startStep', startStep);
                    const tripDistanceFromVehicleToStop = step.distance - startStep.distance;
                    const defaulDistancFromVehicleToStop = await this.getDistanceBetweenTwoPoints(
                        {
                            lat: startStep.location[1],
                            lng: startStep.location[0]
                        },
                        {
                            lat: originalStop.point.position.lat,
                            lng: originalStop.point.position.lng
                        }
                    )
                    console.log('defaulDistancFromVehicleToStop', defaulDistancFromVehicleToStop);
                    const distanceChange = tripDistanceFromVehicleToStop - defaulDistancFromVehicleToStop / 1000;
                    const trip = await this.tripRepository.findById(tripId, ['servicePayload.bookingShare.distance']);
                    tripDistanceAfterChange = trip.servicePayload.bookingShare.distance + distanceChange;
                    console.log('tripDistanceAfterChange', tripDistanceAfterChange + '=' + trip.servicePayload.bookingShare.distance + '+' + distanceChange);
                } else {
                    pickupStep.distance = pickupStep.distance / 1000;
                    tripDistanceAfterChange = step.distance - pickupStep.distance;
                    console.log('tripDistanceAfterChange', tripDistanceAfterChange + '=' + step.distance + '-' + pickupStep.distance);
                }

                perTripDistanceAfterChange.push({
                    tripId: tripId,
                    distance: tripDistanceAfterChange
                });
            }

            // Thêm vào optimizedStops
            originalStop.order = optimizedStops.length + 1;
            console.log('optimizedStop211', originalStop);
            optimizedStops.push(originalStop);
        };
        console.log('optimizedStops', optimizedStops);

        return {
            sharedRouteStop: optimizedStops,
            durationToNewTripStart,
            durationToNewTripEnd,
            distanceToNewTripStart,
            distanceToNewTripEnd,
            distance,
            perTripDistanceAfterChange
        };
    }
}