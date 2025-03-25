export interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  vehicleCondition: 'available' | 'in-use' | 'maintenance';
  operationStatus: 'pending' | 'running' | 'charging';
  image: string[];
  createdAt: string;
  updatedAt: string;
}
