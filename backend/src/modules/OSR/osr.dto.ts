export interface OpenItineraryDTO {
  id: number;
  description: string;
  profile: string;
  start: [number, number];
  capacity: number[];
}

export interface OpenItineraryShipmentDTO {
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

export interface OpenItineraryOptimizationRequestDTO {
  vehicles: OpenItineraryDTO[];
  shipments: OpenItineraryShipmentDTO[];
}

export interface tripAmount {
  tripId: number;
  amount: number;
}
