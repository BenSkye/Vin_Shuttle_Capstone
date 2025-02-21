import { ICreateTripDto, IUpdateTripDto } from 'src/modules/trip/trip.dto';
import { TripDocument } from 'src/modules/trip/trip.schema';


export interface ITripRepository {
    create(tripDto: ICreateTripDto): Promise<TripDocument>;
    findById(id: string): Promise<TripDocument>;
    findByDriverId(driverId: string): Promise<TripDocument[]>;
    find(query: any, select: string[]): Promise<TripDocument[]>
    updateStatus(id: string, status: string): Promise<TripDocument>;
    updateTrip(id: string, updateTripDto: IUpdateTripDto): Promise<TripDocument>;
}

export interface ITripService {
    createTrip(createTripDto: ICreateTripDto): Promise<TripDocument>;
    checkTrip(createTripDto: ICreateTripDto): Promise<boolean>;
    getPersonalCustomerTrip(customerId: string): Promise<TripDocument[]>
    getPersonalDriverTrip(driverId: string): Promise<TripDocument[]>
    // getTripById(id: string): Promise<Trip>;
    // getDriverTrips(driverId: string): Promise<Trip[]>;
}