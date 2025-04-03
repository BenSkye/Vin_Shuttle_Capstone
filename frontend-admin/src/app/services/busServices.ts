import apiClient from "./apiClient";

export interface Position {
  lat: number;
  lng: number;
}

export interface BusStop {
  _id: string;
  name: string;
  description?: string;
  position: Position;
  status: 'active' | 'inactive' | 'maintenance';
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  stopId: string;
  orderIndex: number;
  distanceFromStart: number; // Khoảng cách từ điểm đầu (km)
  estimatedTime: number; // Thời gian ước tính từ điểm đầu (phút)
}

export interface BusRouteWithStops {
  _id: string;
  name: string;
  description?: string;
  stops: RouteStop[]; // Mảng các điểm dừng với metadata
  routeCoordinates: Position[]; // Tọa độ chi tiết của tuyến đường
  totalDistance: number; // km
  estimatedDuration: number; // phút
  vehicleCategory: string; // ID của loại phương tiện
  status: string; // active, inactive, etc.
  startTime?: Date; // Ngày bắt đầu áp dụng
  endTime?: Date; // Ngày kết thúc áp dụng
  pricingConfig: string; // ID của cấu hình giá
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Interface bổ sung để hiển thị trên giao diện
export interface BusRouteDisplay extends Omit<BusRouteWithStops, 'stops'> {
  stops: Array<BusStop & { orderIndex: number; distanceFromStart: number; estimatedTime: number }>;
}


export const busStopService = {
  /**
   * Tạo điểm dừng mới
   * @param data Dữ liệu điểm dừng mới
   * */
  createBusStop: async (data: BusStop): Promise<BusStop> => {
    try {
      const response = await apiClient.post<BusStop>("/bus-stops", data);
      return response.data;
    } catch (error) {
      console.error("Error creating bus stop:", error);
      throw error;
    }
  },

  /**
   * Lấy tất cả điểm dừng
   */
  getAllBusStops: async (): Promise<BusStop[]> => {
    try {
      const response = await apiClient.get<BusStop[]>("/bus-stops");
      return response.data;
    } catch (error) {
      console.error("Error fetching all bus stops:", error);
      throw error;
    }
  },

    /**
     * Lấy thông tin điểm dừng theo ID
     * @param id ID của điểm dừng
     */
    getBusStopById: async (id: string): Promise<BusStop> => {
        try {
            const response = await apiClient.get<BusStop>(`/bus-stops/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching bus stop by ID:", error);
            throw error;
        }
        },
    /**
     * Cập nhật thông tin điểm dừng
     * @param id ID của điểm dừng
     * @param data Dữ liệu cập nhật
     * */
    updateBusStop: async (id: string, data: Partial<BusStop>): Promise<BusStop> => {    
        try {
            const response = await apiClient.put<BusStop>(`/bus-stops/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating bus stop:", error);
            throw error;
        }
    },
    /**
     * Xóa điểm dừng
     * @param id ID của điểm dừng
     * */
    deleteBusStop: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/bus-stops/${id}`);
        } catch (error) {
            console.error("Error deleting bus stop:", error);
            throw error;
        }
    }
};


export const busRouteService = {
  /**
   * Tạo tuyến xe buýt mới
   * @param data Dữ liệu tuyến mới
   */
  createBusRoute: async (data: Omit<BusRouteWithStops, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<BusRouteWithStops> => {
    try {
      const response = await apiClient.post<BusRouteWithStops>("/bus-routes", data);
      return response.data;
    } catch (error) {
      console.error("Error creating bus route:", error);
      throw error;
    }
  },

  /**
   * Lấy tất cả tuyến xe buýt
   */
  getAllBusRoutes: async (): Promise<BusRouteWithStops[]> => {
    try {
      const response = await apiClient.get<BusRouteWithStops[]>("/bus-routes");
      return response.data;
    } catch (error) {
      console.error("Error fetching all bus routes:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin tuyến xe buýt theo ID
   * @param id ID của tuyến xe buýt
   */
  getBusRouteById: async (id: string): Promise<BusRouteWithStops> => {
    try {
      const response = await apiClient.get<BusRouteWithStops>(`/bus-routes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bus route by ID:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin tuyến xe buýt
   * @param id ID của tuyến xe buýt
   * @param data Dữ liệu cập nhật
   */
  updateBusRoute: async (id: string, data: Partial<BusRouteWithStops>): Promise<BusRouteWithStops> => {
    try {
      const response = await apiClient.put<BusRouteWithStops>(`/bus-routes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating bus route:", error);
      throw error;
    }
  },

  /**
   * Xóa tuyến xe buýt
   * @param id ID của tuyến xe buýt
   */
  deleteBusRoute: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bus-routes/${id}`);
    } catch (error) {
      console.error("Error deleting bus route:", error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin chi tiết tuyến xe buýt kèm thông tin đầy đủ của các điểm dừng
   * @param id ID của tuyến xe buýt
   */
  getBusRouteWithDetailedStops: async (id: string): Promise<BusRouteDisplay> => {
    try {
      // Lấy thông tin tuyến
      const route = await busRouteService.getBusRouteById(id);
      
      // Lấy thông tin chi tiết của từng điểm dừng
      const stopsWithDetails = await Promise.all(
        route.stops.map(async (routeStop) => {
          const stopDetail = await busStopService.getBusStopById(routeStop.stopId);
          return {
            ...stopDetail,
            orderIndex: routeStop.orderIndex,
            distanceFromStart: routeStop.distanceFromStart,
            estimatedTime: routeStop.estimatedTime
          };
        })
      );
      
      // Tạo đối tượng kết quả
      const result: BusRouteDisplay = {
        ...route,
        stops: stopsWithDetails
      };
      
      return result;
    } catch (error) {
      console.error("Error fetching bus route with detailed stops:", error);
      throw error;
    }
  }
};
