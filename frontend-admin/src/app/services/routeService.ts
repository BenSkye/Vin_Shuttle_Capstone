import axios from 'axios';

const API_URL = 'http://localhost:2028';

export interface RouteRequest {
    name: string;
    description: string;
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
}

export interface RouteResponse extends RouteRequest {
    id: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export const routeService = {
    createRoute: async (data: RouteRequest) => {
        const response = await axios.post<RouteResponse>(`${API_URL}/routes`, data);
        return response.data;
    },

    getAllRoutes: async () => {
        const response = await axios.get<RouteResponse[]>(`${API_URL}/routes`);
        return response.data;
    },

    getRoute: async (id: string) => {
        const response = await axios.get<RouteResponse>(`${API_URL}/routes/${id}`);
        return response.data;
    }
};
