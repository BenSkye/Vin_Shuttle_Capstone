import { ServiceType } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';

export interface ICreateRating {
  tripId: string;
  driverId?: string;
  customerId?: string;
  rate: number;
  feedback?: string;
}

export interface IUpdateRating {
  tripId?: string;
  driverId?: string;
  customerId?: string;
  rate?: number;
  feedback?: string;
}

export interface IGetAverageRating {
  driverId?: string;
  customerId?: string;
  serviceType: ServiceType;
}

export interface IGetRatingByQuery extends QueryOptions {
  customerId?: string;
  driverId?: string;
  rate?: number;
  feedback?: string;
  serviceType: ServiceType;

}
