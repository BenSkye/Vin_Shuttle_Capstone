import axios from 'axios';

const API_URL = 'http://localhost:2028';

export interface TripRequest {
    name: string;
    description: string;
    route: {
        waypoints: {
            id: number;
            name: string;
            position: {
                lat: number;
                lng: number;
            };
            description?: string;
        }[];
        routeCoordinates: {
            lat: number;
            lng: number;
        }[];
        estimatedDuration: number;
        totalDistance: number;
    };
}

export interface TripResponse extends TripRequest {
    id: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export const tripService = {
    createTrip: async (data: TripRequest) => {
        const response = await axios.post<TripResponse>(`${API_URL}/trips`, data);
        return response.data;
    },

    getAllTrips: async () => {
        const response = await axios.get<TripResponse[]>(`${API_URL}/trips`);
        return response.data;
    },

    getTrip: async (id: string) => {
        const response = await axios.get<TripResponse>(`${API_URL}/trips/${id}`);
        return response.data;
    }
};
