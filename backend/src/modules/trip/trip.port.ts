import { ICreateTripDto } from 'src/modules/trip/trip.dto';
import { Trip, TripDocument } from 'src/modules/trip/trip.schema';


export interface ITripRepository {
    create(tripDto: ICreateTripDto): Promise<TripDocument>;
    findById(id: string): Promise<TripDocument>;
    findByDriverId(driverId: string): Promise<TripDocument[]>;
    find(query: any, select: string[]): Promise<TripDocument[]>
    updateStatus(id: string, status: string): Promise<TripDocument>;
}

export interface ITripService {
    createTrip(createTripDto: ICreateTripDto): Promise<Trip>;
    checkTrip(createTripDto: ICreateTripDto): Promise<boolean>;
    getPersonalCustomerTrip(customerId: string): Promise<Trip[]>
    getPersonalDriverTrip(driverId: string): Promise<Trip[]>
    // getTripById(id: string): Promise<Trip>;
    // getDriverTrips(driverId: string): Promise<Trip[]>;
}