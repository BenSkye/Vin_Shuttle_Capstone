import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

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
    scenicRouteCoordinates: {
        lat: number;
        lng: number;
    }[];
    estimatedDuration: number;
    totalDistance: number;
    status?: 'draft' | 'active' | 'inactive';
}

export interface RouteResponse extends RouteRequest {
    _id: string;
    status: 'draft' | 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export const routeService = {
    createRoute: async (data: RouteRequest) => {
        const response = await axios.post<RouteResponse>(`${API_URL}/scenic-routes`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    },

    getAllRoutes: async () => {
        const response = await axios.get<RouteResponse[]>(`${API_URL}/scenic-routes`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    },

    getRouteById: async (id: string) => {
        const response = await axios.get<RouteResponse>(`${API_URL}/scenic-routes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    },

    editRoute: async (id: string, data: RouteRequest) => {
        if (!id) {
            throw new Error('Route ID is required for editing');
        }

        console.log('Editing route with ID:', id);
        console.log('Edit data:', data);

        const response = await axios.put<RouteResponse>(
            `${API_URL}/scenic-routes/${id}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    }
};
