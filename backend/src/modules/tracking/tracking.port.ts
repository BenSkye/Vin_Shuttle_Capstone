import { LocationData } from 'src/share/interface';

export interface ITrackingService {
  updateLastVehicleLocation(vehicleId: string, location: LocationData): Promise<void>;
  getLastVehicleLocation(vehicleId: string): Promise<LocationData>;
  deleteLastVehicleLocation(vehicleId: string): Promise<void>;
}
