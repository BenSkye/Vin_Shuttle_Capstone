import {
  SharedItineraryStatus,
  SharedItineraryStopsType,
} from 'src/share/enums/shared-itinerary.enum';
import { StartOrEndPoint } from 'src/share/interface';

export interface sharedItineraryStop {
  order: number;
  pointType: SharedItineraryStopsType;
  trip: string;
  tripCode: string;
  point: StartOrEndPoint;
  isPass: boolean;
  isCancel: boolean;
}

export interface searchSharedItineraryDTO {
  startPoint: StartOrEndPoint;
  endPoint: StartOrEndPoint;
  distanceEstimate: number;
  numberOfSeats: number;
}

export interface ICreateSharedItineraryDTO {
  driverId: string;
  vehicleId: string;
  scheduleId: string;
  stops?: sharedItineraryStop[];
  // distanceEstimate: number;
  // durationEstimate: number;
}

export interface IUpdateSharedItineraryDTO {
  driverId?: string;
  vehicleId?: string;
  scheduleId?: string;
  stops?: sharedItineraryStop[];
  distanceEstimate?: number;
  // distanceActual?: number;
  // durationEstimate?: number;
  durationActual?: number;
  status?: SharedItineraryStatus;
  statusHistory?: {
    status: SharedItineraryStatus;
    changedAt: Date;
    reason?: string;
  }[];
}
