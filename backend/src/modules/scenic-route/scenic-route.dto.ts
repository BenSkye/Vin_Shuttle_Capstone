import { Position } from 'src/share/interface';

export interface Waypoint {
  id: number;
  name: string;
  position: Position;
  description?: string;
}

export interface ICreateScenicRouteDto {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  waypoints: Waypoint[];
  scenicRouteCoordinates: Position[];
  estimatedDuration: number; // in minutes
  totalDistance: number; // in kilometers
  // vehicleCategories: string[];
  tags: string[];
}

export interface IUpdateScenicRouteDto {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  waypoints: Waypoint[];
  scenicRouteCoordinates: Position[];
  estimatedDuration: number; // in minutes
  totalDistance?: number; // in kilometers
  // vehicleCategories?: string[];
  // tags?: string[];
}
