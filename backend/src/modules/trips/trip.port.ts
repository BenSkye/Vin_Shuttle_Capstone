import { CreateTripDto, UpdateTripDto } from "src/modules/trips/trip.dto";
import { Trip } from "src/modules/trips/trip.schema";


export interface ITripRepository {
    create(trip: CreateTripDto): Promise<Trip>;
    findById(id: string): Promise<Trip | null>;
    find(query: any): Promise<Trip | null>;
    findAll(): Promise<Trip[]>;
    update(id: string, trip: UpdateTripDto): Promise<Trip | null>;
}

export interface ITripService {
    createTrip(trip: CreateTripDto): Promise<Trip>;
    getTrip(id: string): Promise<Trip | null>;
    getAllTrips(): Promise<Trip[]>;
    updateTrip(id: string, trip: UpdateTripDto): Promise<Trip | null>;
    // getTripsByVehicleCategory(category: string): Promise<Trip[]>;
}