import { tripAmount } from 'src/modules/OSR/osr.dto';
import { sharedItineraryStop } from 'src/modules/shared-itinerary/shared-itinerary.dto';
import { Position } from 'src/share/interface';

export interface IRoutingOSRMService {
  getItinerary(
    stop: sharedItineraryStop[],
    vehicleId: string,
    vehicleCapacity: number,
    listTripsAmount: tripAmount[],
  ): Promise<{
    sharedItineraryStop: sharedItineraryStop[];
    durationToNewTripStart: number;
    durationToNewTripEnd: number;
    distanceToNewTripStart: number;
    distanceToNewTripEnd: number;
    distance: number;
    perTripDistanceAfterChange: {
      tripId: string;
      distance: number;
    }[];
  }>;

  getDistanceBetweenTwoPoints(startPoint: Position, endPoint: Position): Promise<number>;
}
