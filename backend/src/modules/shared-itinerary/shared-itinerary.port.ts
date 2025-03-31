import {
  ICreateSharedItineraryDTO,
  IUpdateSharedItineraryDTO,
  searchSharedItineraryDTO,
} from 'src/modules/shared-itinerary/shared-itinerary.dto';
import { SharedItineraryDocument } from 'src/modules/shared-itinerary/shared-itinerary.schema';
import { SharedItineraryStatus } from 'src/share/enums/shared-itinerary.enum';

export interface ISharedItineraryRepository {
  create(createDto: ICreateSharedItineraryDTO): Promise<SharedItineraryDocument>;
  find(query: any, select: string[]): Promise<SharedItineraryDocument[]>;
  findOne(query: any, select: string[]): Promise<SharedItineraryDocument>;
  findById(id: string): Promise<SharedItineraryDocument>;
  update(
    shareItineraryId: string,
    updateDto: IUpdateSharedItineraryDTO,
  ): Promise<SharedItineraryDocument>;
  updateStatusSharedItinerary(
    shareItineraryId: string,
    status: SharedItineraryStatus,
  ): Promise<SharedItineraryDocument>;
  delete(query: any): Promise<any>;
  deleteById(id: string): Promise<any>;
  saveToRedis(sharedItinerary: SharedItineraryDocument): Promise<void>;
  findInRedis(id: string): Promise<SharedItineraryDocument>;
}
export interface ISharedItineraryService {
  findBestItineraryForNewTrip(searchDto: searchSharedItineraryDTO): Promise<{
    SharedItineraryDocument: SharedItineraryDocument;
    durationToNewTripStart: number;
    durationToNewTripEnd: number;
    distanceToNewTripStart: number;
    distanceToNewTripEnd: number;
  }>;

  createSharedItinerary(createDto: ICreateSharedItineraryDTO): Promise<SharedItineraryDocument>;
  updateSharedItinerary(
    shareItineraryId: string,
    updateDto: IUpdateSharedItineraryDTO,
  ): Promise<SharedItineraryDocument>;
  updateStatusSharedItinerary(
    shareItineraryId: string,
    status: SharedItineraryStatus,
  ): Promise<SharedItineraryDocument>;
  passStartPoint(shareItineraryId: string, tripId: string): Promise<SharedItineraryDocument>;
  passEndPoint(shareItineraryId: string, tripId: string): Promise<SharedItineraryDocument>;
  saveASharedItineraryFromRedisToDBByTripID(tripId: string): Promise<SharedItineraryDocument>;
  getSharedItineraryById(id: string): Promise<SharedItineraryDocument>;
  getSharedItineraryByTripId(tripId: string): Promise<SharedItineraryDocument>;
}
