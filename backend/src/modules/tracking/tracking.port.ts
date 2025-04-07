import { LocationData } from 'src/share/interface';

export interface ITrackingService {
  updateLastVehicleLocation(vehicleId: string, location: LocationData): Promise<void>;
  getLastVehicleLocation(vehicleId: string): Promise<LocationData>;
  deleteLastVehicleLocation(vehicleId: string): Promise<void>;

  setUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
  deleteUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
  getVehicleSubscribers(vehicleId: string): Promise<string[]>;
}
