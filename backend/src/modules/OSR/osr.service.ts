import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { OpenRouteOptimizationRequestDTO, OpenRouteShipmentDTO } from "src/modules/OSR/osr.dto";
import { IRoutingOSRMService } from "src/modules/OSR/osr.port";
import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { TRACKING_SERVICE } from "src/modules/tracking/tracking.di-token";
import { ITrackingService } from "src/modules/tracking/tracking.port";
import { TempTripId, TripIdForAtVehiclePosition } from "src/share/enums/osr.enum";
import { SharedRouteStopsType } from "src/share/enums/shared-route.enum";

export class RoutingOSRService implements IRoutingOSRMService {
    private readonly OSR_API_URL = process.env.OSR_API_URL;
    private readonly OSR_API_KEY = process.env.ORS_API_KEY;

    constructor(
        private readonly httpService: HttpService,
        @Inject(TRACKING_SERVICE)
        private readonly trackingService: ITrackingService
    ) { }

    async getRoute(stops: sharedRouteStop[], vehicleId: string): Promise<
        {
            sharedRouteStop: sharedRouteStop[],
            durationToNewTripStart: number,
            durationToNewTripEnd: number,
            distanceToNewTripStart: number,
            distanceToNewTripEnd: number,
            distance: number
        }> {
        // Chuyển đổi sang định dạng OpenRouteService
        const requestBody = await this.convertToOpenRouteFormat(stops, vehicleId);

        try {
            const response = await this.httpService.post(
                this.OSR_API_URL,
                requestBody,
                { headers: { 'Authorization': this.OSR_API_KEY } }
            ).toPromise();

            const result = this.parseOpenRouteResponse(response.data, stops);
            return result;
        } catch (error) {
            throw new Error(`Failed to get optimized route: ${error.message}`);
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

    private parseOpenRouteResponse(response: any, originalStops: sharedRouteStop[]): {
        sharedRouteStop: sharedRouteStop[];
        durationToNewTripStart: number,
        durationToNewTripEnd: number,
        distanceToNewTripStart: number,
        distanceToNewTripEnd: number,
        distance: number
    } {
        let durationToNewTripStart = 0;
        let durationToNewTripEnd = 0;
        let distanceToNewTripStart = 0;
        let distanceToNewTripEnd = 0;
        let distance = 0;
        if (!response?.routes?.[0]?.steps) return {
            sharedRouteStop: [],
            durationToNewTripStart: durationToNewTripStart,
            durationToNewTripEnd: durationToNewTripEnd,
            distanceToNewTripStart: distanceToNewTripStart,
            distanceToNewTripEnd: distanceToNewTripEnd,
            distance: distance
        };

        const optimizedStops: sharedRouteStop[] = [];
        distance = response.summary.distance;
        response.routes[0].steps.forEach(step => {
            if ((step.type !== 'start' || step.type !== 'end') && step.description !== TripIdForAtVehiclePosition) {
                const tripId = step.description;
                const originalStop = originalStops.find(s =>
                    s.trip.toString() === tripId //store tripId in description
                );
                if (tripId === TempTripId) {
                    if (originalStop.pointType === SharedRouteStopsType.START_POINT) {
                        durationToNewTripStart = step.duration;
                        distanceToNewTripStart = step.distance;
                    }
                    if (originalStop.pointType === SharedRouteStopsType.END_POINT) {
                        durationToNewTripEnd = step.duration;
                        distanceToNewTripEnd = step.distance;
                    }
                }

                if (originalStop) {
                    optimizedStops.push({
                        ...originalStop,
                        order: optimizedStops.length + 1,
                        point: {
                            position: {
                                lat: step.location[1],
                                lng: step.location[0]
                            },
                            address: originalStop.point.address
                        }
                    });
                }
            }
        });

        return {
            sharedRouteStop: optimizedStops,
            durationToNewTripStart,
            durationToNewTripEnd,
            distanceToNewTripStart,
            distanceToNewTripEnd,
            distance
        };
    }
}