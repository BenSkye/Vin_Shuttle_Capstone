import { ICreateTripDto } from 'src/modules/trip/trip.dto';
import { Trip } from 'src/modules/trip/trip.schema';


export interface ITripRepository {
    create(tripDto: ICreateTripDto): Promise<Trip>;
    findById(id: string): Promise<Trip>;
    findByDriverId(driverId: string): Promise<Trip[]>;
    find(query: any, select: string[]): Promise<Trip[]>
    updateStatus(id: string, status: string): Promise<Trip>;
}

export interface ITripService {
    createTrip(createTripDto: ICreateTripDto): Promise<Trip>;
    checkTrip(createTripDto: ICreateTripDto): Promise<boolean>;
    getPersonalCustomerTrip(customerId: string): Promise<Trip[]>
    getPersonalDriverTrip(driverId: string): Promise<Trip[]>
    // getTripById(id: string): Promise<Trip>;
    // getDriverTrips(driverId: string): Promise<Trip[]>;
}