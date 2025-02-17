export interface Position {
    lat: number;
    lng: number;
}

export interface Waypoint {
    id: number;
    name: string;
    position: Position;
    description?: string;
}

export interface ICreateRouteDto {
    name: string;
    description: string;
    status?: 'active' | 'inactive';
    waypoints: Waypoint[];
    routeCoordinates: Position[];
    estimatedDuration: number; // in minutes
    totalDistance: number; // in kilometers
    // vehicleCategories: string[];
    tags: string[];
}


export interface IUpdateRouteDto {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    waypoints: Waypoint[];
    routeCoordinates: Position[];
    estimatedDuration: number; // in minutes
    totalDistance?: number; // in kilometers
    // vehicleCategories?: string[];
    // tags?: string[];
}
