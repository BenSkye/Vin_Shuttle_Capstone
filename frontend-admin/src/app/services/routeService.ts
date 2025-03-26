import apiClient from './apiClient';

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
    /**
     * Tạo lộ trình mới
     * @param data Dữ liệu lộ trình mới
     */
    createRoute: async (data: RouteRequest): Promise<RouteResponse> => {
        try {
            const response = await apiClient.post<RouteResponse>('/scenic-routes', data);
            return response.data;
        } catch (error) {
            console.error('Error creating route:', error);
            throw error;
        }
    },

    /**
     * Lấy tất cả lộ trình
     */
    getAllRoutes: async (): Promise<RouteResponse[]> => {
        try {
            const response = await apiClient.get<RouteResponse[]>('/scenic-routes');
            return response.data;
        } catch (error) {
            console.error('Error fetching all routes:', error);
            throw error;
        }
    },

    /**
     * Lấy lộ trình theo ID
     * @param id ID của lộ trình
     */
    getRouteById: async (id: string): Promise<RouteResponse> => {
        try {
            const response = await apiClient.get<RouteResponse>(`/scenic-routes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching route with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Sửa lộ trình
     * @param id ID của lộ trình cần sửa
     * @param data Dữ liệu cập nhật
     */
    editRoute: async (id: string, data: RouteRequest): Promise<RouteResponse> => {
        if (!id) {
            throw new Error('Route ID is required for editing');
        }

        try {
            console.log('Editing route with ID:', id);
            console.log('Edit data:', data);

            const response = await apiClient.put<RouteResponse>(
                `/scenic-routes/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating route with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa lộ trình
     * @param id ID của lộ trình cần xóa
     */
    deleteRoute: async (id: string): Promise<void> => {
        if (!id) {
            throw new Error('Route ID is required for deletion');
        }

        try {
            await apiClient.delete(`/scenic-routes/${id}`);
        } catch (error) {
            console.error(`Error deleting route with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Thay đổi trạng thái lộ trình
     * @param id ID của lộ trình
     * @param status Trạng thái mới ('draft', 'active', 'inactive')
     */
    changeRouteStatus: async (
        id: string,
        status: 'draft' | 'active' | 'inactive'
    ): Promise<RouteResponse> => {
        if (!id) {
            throw new Error('Route ID is required for status change');
        }

        try {
            const response = await apiClient.patch<RouteResponse>(
                `/scenic-routes/${id}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            console.error(`Error changing status for route with ID ${id}:`, error);
            throw error;
        }
    }
};