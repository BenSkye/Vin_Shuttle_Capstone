import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { OpenRouteOptimizationRequestDTO, OpenRouteShipmentDTO } from "src/modules/OSR/osr.dto";
import { IRoutingOSRMService } from "src/modules/OSR/osr.port";
import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { TRACKING_SERVICE } from "src/modules/tracking/tracking.di-token";
import { ITrackingService } from "src/modules/tracking/tracking.port";
import { SharedRouteStopsType } from "src/share/enums/shared-route.enum";

export class RoutingOSRService implements IRoutingOSRMService {
    private readonly OSR_API_URL = process.env.OSR_API_URL;
    private readonly OSR_API_KEY = process.env.ORS_API_KEY;

    constructor(
        private readonly httpService: HttpService,
        @Inject(TRACKING_SERVICE)
        private readonly trackingService: ITrackingService
    ) { }

    async getRoute(stops: sharedRouteStop[], vehicleId: string): Promise<sharedRouteStop[]> {
        // Chuyển đổi sang định dạng OpenRouteService
        const requestBody = await this.convertToOpenRouteFormat(stops, vehicleId);

        try {
            const response = await this.httpService.post(
                this.OSR_API_URL,
                requestBody,
                { headers: { 'Authorization': this.OSR_API_KEY } }
            ).toPromise();

            return this.parseOpenRouteResponse(response.data, stops);
        } catch (error) {
            throw new Error(`Failed to get optimized route: ${error.message}`);
        }
    }

    private async convertToOpenRouteFormat(
        stops: sharedRouteStop[],
        vehicleId: string
    ): Promise<OpenRouteOptimizationRequestDTO> {
        const lastVehicleLocation = await this.trackingService.getLastVehicleLocation(vehicleId);

        // Nhóm các stop theo trip
        const stopsByTrip: Record<
            string,
            {
                pickup: sharedRouteStop,
                delivery: sharedRouteStop
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

        // Tạo danh sách shipments
        const listShipments: OpenRouteShipmentDTO[] = [];
        let shipmentId = 1;

        for (const [tripId, stops] of Object.entries(stopsByTrip)) {
            // Xử lý trường hợp thiếu pickup
            let pickupStop = stops.pickup;
            if (!pickupStop?.position || pickupStop.isPass) {
                pickupStop = {
                    ...pickupStop,
                    position: {
                        lat: lastVehicleLocation.latitude,
                        lng: lastVehicleLocation.longitude
                    },
                    address: 'Current vehicle position'
                };
            }

            // Đảm bảo có cả pickup và delivery
            if (stops.delivery && stops.delivery.position) {
                listShipments.push({
                    id: shipmentId++,
                    pickup: {
                        id: shipmentId * 2 - 1,
                        location: [pickupStop.position.lng, pickupStop.position.lat],
                        description: tripId
                    },
                    delivery: {
                        id: shipmentId * 2,
                        location: [stops.delivery.position.lng, stops.delivery.position.lat],
                        description: tripId
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
            shipments: listShipments
        };
    }

    private parseOpenRouteResponse(response: any, originalStops: sharedRouteStop[]): sharedRouteStop[] {
        if (!response?.routes?.[0]?.steps) return [];

        const optimizedStops: sharedRouteStop[] = [];

        response.routes[0].steps.forEach(step => {
            if (step.type === 'job') {
                const originalStop = originalStops.find(s =>
                    s.trip.toString() === step.description
                );

                if (originalStop) {
                    optimizedStops.push({
                        ...originalStop,
                        order: optimizedStops.length + 1,
                        position: {
                            lat: step.location[1],
                            lng: step.location[0]
                        }
                    });
                }
            }
        });

        return optimizedStops;
    }
}