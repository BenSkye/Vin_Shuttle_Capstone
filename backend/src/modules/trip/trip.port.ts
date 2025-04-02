import { ICreateTripDto, IUpdateTripDto, tripParams } from 'src/modules/trip/trip.dto';
import { TripDocument } from 'src/modules/trip/trip.schema';
import { TripStatus } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';

export interface ITripRepository {
  create(tripDto: ICreateTripDto): Promise<TripDocument>;
  findById(id: string, select: string[]): Promise<TripDocument>;
  findByDriverId(driverId: string): Promise<TripDocument[]>;
  find(query: any, select: string[], options?: QueryOptions): Promise<TripDocument[]>;
  findOne(query: any, select: string[]): Promise<TripDocument>;
  updateStatus(id: string, status: TripStatus): Promise<TripDocument>;
  updateTrip(id: string, updateTripDto: IUpdateTripDto): Promise<TripDocument>;
  deleteTrip(id: string): Promise<void>;
}

export interface ITripService {
  createTrip(createTripDto: ICreateTripDto): Promise<TripDocument>;
  checkTrip(createTripDto: ICreateTripDto): Promise<boolean>;
  getPersonalCustomerTrip(customerId: string): Promise<TripDocument[]>;
  getPersonalDriverTrip(driverId: string): Promise<TripDocument[]>;
  getPersonalCustomerTripById(customerId: string, id: string): Promise<TripDocument>;
  getPersonalDriverTripById(driverId: string, id: string): Promise<TripDocument>;
  calculateBusRouteFare(
    routeId: string,
    fromStopId: string,
    toStopId: string,
    numberOfSeats: number,
  ): Promise<number>;
  driverPickupCustomer(tripId: string, driverId: string): Promise<TripDocument>;
  driverStartTrip(tripId: string, driverId: string): Promise<TripDocument>;
  driverCompleteTrip(tripId: string, driverId: string): Promise<TripDocument>;
  // getTripById(id: string): Promise<Trip>;
  // getDriverTrips(driverId: string): Promise<Trip[]>;

  totalAmount(): Promise<number>;
  getTripByQuery(query: tripParams): Promise<TripDocument[]>;
  cancelTrip(userId: string, id: string, reason: string): Promise<TripDocument>;
  handleRefundForTrip(tripId: string, refundAmount: number): Promise<void>
}
