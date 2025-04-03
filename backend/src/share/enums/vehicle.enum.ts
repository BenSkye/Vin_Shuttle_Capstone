export enum VehicleOperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  CHARGING = 'charging',
  AVAILABLE = 'available'
}

export enum VehicleCondition {
  AVAILABLE = 'available',
  IN_USE = 'in-use',
  MAINTENANCE = 'maintenance',
}

export enum VehicleAvailabilityStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out-of-service'
}
