import { Trip } from '~/interface/trip';
import { ScenicRouteDto } from '~/interface/trip';
import apiClient from './apiClient';
import { SharedItinerary } from '~/interface/share-itinerary';


export const getPersonalTrips = async (): Promise<Trip[]> => {
  try {
    const response = await apiClient.get('/trip/driver-personal-trip');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal trips:', error);
    throw error;
  }
};


export const getPersonalTripById = async (id: string): Promise<Trip> => {
  try {
    const response = await apiClient.get(`/trip/driver-personal-trip/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching personal trip by ID:', error);
    throw error;
  }
}

/**
 * Cập nhật trạng thái đón khách, đón khách
 */
export const pickUp = async (tripId: string): Promise<Trip> => {
  try {
    const response = await apiClient.post('/trip/driver-pickup-customer', { tripId });
    return response.data;
  } catch (error) {
    console.error('Error updating to pickup status:', error);
    throw error;
  }
};

/**
 * Bắt đầu chuyến đi
 */
export const startTrip = async (tripId: string): Promise<Trip> => {
  try {
    const response = await apiClient.post('/trip/driver-start-trip', { tripId });
    return response.data;
  } catch (error) {
    console.error('Error starting trip:', error);
    throw error;
  }
};

/**
 * Hoàn thành chuyến đi, trả khách
 */
export const completeTrip = async (tripId: string): Promise<Trip> => {
  try {
    const response = await apiClient.post('/trip/driver-complete-trip', { tripId });
    return response.data;
  } catch (error) {
    console.error('Error completing trip:', error);
    throw error;
  }
};

/**
 * Lấy thông tin lộ trình du lịch
 */
export const getSenicRouteById = async (routeId: string): Promise<ScenicRouteDto> => {
  try {
    const response = await apiClient.get(`/scenic-routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scenic route:', error);
    throw error;
  }
};

/**
 * Lấy đánh giá theo ID chuyến đi
 */
export const getRatingByTripId = async (tripId: string): Promise<Trip> => {
  try {
    const response = await apiClient.get(`/rating/get-rating-by-trip-id/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating:', error);
    throw error;
  }
};

/**
 * Hủy chuyến đi
 */
export const cancelTrip = async (tripId: string, reason: string): Promise<Trip> => {
  try {
    const response = await apiClient.post('/trip/cancel-trip', {
      tripId,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling trip:', error);
    throw error;
  }
};
export const getSharedItineraryById = async (Id: string): Promise<SharedItinerary> => {
  try {
    const response = await apiClient.get(`/share-itinerary/get-by-id/${Id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shared route:', error);
    throw error;
  }
}
export const getShareRouteByTripId = async (tripId: string): Promise<SharedItinerary> => {
  try {
    const response = await apiClient.get(`/share-itinerary/get-by-trip-id/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shared route:', error);
    throw error;
  }
}

export { Trip };
