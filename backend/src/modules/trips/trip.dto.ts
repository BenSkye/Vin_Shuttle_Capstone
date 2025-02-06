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

export interface Route {
    waypoints: Waypoint[];
    routeCoordinates: Position[];
    estimatedDuration: number; // in minutes
    totalDistance: number; // in kilometers
}


export interface CreateTripDto {
    name: string;
    description: string;
    status?: 'active' | 'inactive';
    route: Route;
    // vehicleCategories: string[];
    tags: string[];
}


export interface UpdateTripDto {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    route?: Route;
    // vehicleCategories?: string[];
    tags?: string[];
}
