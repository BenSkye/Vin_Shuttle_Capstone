import axiosInstance from "./axios";


export interface RatingQuery {
    sortOrder?: 'asc' | 'desc';
    orderBy?: string;
    skip?: number;
    limit?: number;
    serviceType?: 'booking_hour' | 'booking_scenic_route' | 'booking_share' | 'booking_destination';
    feedback?: string;
    rate?: number;
    driverId?: string;
    customerId?: string;
}

export const getAllRating = async (query?: RatingQuery) => {
    try {
        const response = await axiosInstance.get('/rating/get-rating-by-query', { params: query })
        return response.data
    } catch (error) {
        console.error('Error fetching ratings:', error)
        throw error
    }
}

