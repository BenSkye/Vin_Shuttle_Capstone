export interface OpenRouteDTO {
    id: number;
    description: string;
    profile: string;
    start: [number, number];
    capacity: number[];
}

export interface OpenRouteShipmentDTO {
    id: number;
    pickup: {
        id: number;
        location: [number, number];
        description: string;
    };
    delivery: {
        id: number;
        location: [number, number];
        description: string;
    };
    amount: number[];
}

export interface OpenRouteOptimizationRequestDTO {
    vehicles: OpenRouteDTO[];
    shipments: OpenRouteShipmentDTO[];
}