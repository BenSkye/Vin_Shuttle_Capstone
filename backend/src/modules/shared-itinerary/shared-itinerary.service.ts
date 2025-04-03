import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { OSR_SERVICE } from 'src/modules/OSR/osr.di-token';
import { IRoutingOSRMService } from 'src/modules/OSR/osr.port';
import { SHARE_ITINERARY_GATEWAY, SHARE_ITINERARY_REPOSITORY } from 'src/modules/shared-itinerary/shared-itinerary.di-token';
import {
  ICreateSharedItineraryDTO,
  searchSharedItineraryDTO,
  sharedItineraryStop,
} from 'src/modules/shared-itinerary/shared-itinerary.dto';
import { SharedItineraryGateway } from 'src/modules/shared-itinerary/shared-itinerary.gateway';
import {
  ISharedItineraryRepository,
  ISharedItineraryService,
} from 'src/modules/shared-itinerary/shared-itinerary.port';
import { SharedItineraryDocument } from 'src/modules/shared-itinerary/shared-itinerary.schema';
import { TRACKING_SERVICE } from 'src/modules/tracking/tracking.di-token';
import { ITrackingService } from 'src/modules/tracking/tracking.port';
import { TRIP_REPOSITORY } from 'src/modules/trip/trip.di-token';
import { ITripRepository } from 'src/modules/trip/trip.port';
import { VEHICLE_SERVICE } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesService } from 'src/modules/vehicles/vehicles.port';
import { ServiceType } from 'src/share/enums';
import { TempTripId } from 'src/share/enums/osr.enum';
import {
  MaxDistancePercentAvailableToChange,
  SharedItineraryStatus,
  SharedItineraryStopsType,
} from 'src/share/enums/shared-itinerary.enum';

export class SharedItineraryService implements ISharedItineraryService {
  constructor(
    @Inject(SHARE_ITINERARY_REPOSITORY)
    private readonly sharedItineraryRepository: ISharedItineraryRepository,
    @Inject(OSR_SERVICE)
    private readonly osrService: IRoutingOSRMService,
    @Inject(TRIP_REPOSITORY)
    private readonly tripRepository: ITripRepository,
    @Inject(VEHICLE_SERVICE)
    private readonly vehicleService: IVehiclesService,
    @Inject(TRACKING_SERVICE)
    private readonly trackingService: ITrackingService,
    @Inject(SHARE_ITINERARY_GATEWAY)
    private readonly sharedItineraryGateway: SharedItineraryGateway,
  ) { }

  async findBestItineraryForNewTrip(searchDto: searchSharedItineraryDTO): Promise<{
    SharedItineraryDocument: SharedItineraryDocument;
    durationToNewTripStart: number;
    durationToNewTripEnd: number;
    distanceToNewTripStart: number;
    distanceToNewTripEnd: number;
  }> {
    let durationToNewTripStart = 0;
    let durationToNewTripEnd = 0;
    let distanceToNewTripStart = 0;
    let distanceToNewTripEnd = 0;
    const listSharedItinerary = await this.sharedItineraryRepository.find(
      {
        status: { $in: [SharedItineraryStatus.PLANNED, SharedItineraryStatus.IN_PROGRESS] },
      },
      ['_id', 'stops', 'vehicleId'],
    );

    const newStartStop: sharedItineraryStop = {
      order: 0,
      pointType: SharedItineraryStopsType.START_POINT,
      trip: TempTripId,
      point: searchDto.startPoint,
      isPass: false,
      isCancel: false,
    };

    const newEndStop: sharedItineraryStop = {
      order: 0,
      pointType: SharedItineraryStopsType.END_POINT,
      trip: TempTripId,
      point: searchDto.endPoint,
      isPass: false,
      isCancel: false,
    };

    let bestItineraryForNewTripId = null;
    let bestStopArray: sharedItineraryStop[] = [];
    let shortestLength = 0;
    console.log('listSharedItinerary', listSharedItinerary);
    for (const sharedItinerary of listSharedItinerary) {
      // loop through all shared itinerarys
      const vehicleId = sharedItinerary.vehicleId.toString();
      const lastVehicleLocation = await this.trackingService.getLastVehicleLocation(vehicleId);
      console.log('lastVehicleLocation', lastVehicleLocation);
      if (!lastVehicleLocation) {
        continue;
      }
      const vehicleCategory = await this.vehicleService.getVehicleCategoryByVehicleId(vehicleId);
      if (!vehicleCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `vehicleCategory ${vehicleId} not found`,
            vnMessage: 'Xe không tồn tại',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (vehicleCategory.numberOfSeat < searchDto.numberOfSeats) {
        continue;
      }
      let stops = sharedItinerary.stops;
      //loại các stop isPass và isCancel
      stops = stops.filter(stop => stop.isPass === false && stop.isCancel === false);
      //get all stops have pointType endPoint
      const stopsEndPoint = stops.filter(
        stop => stop.pointType === SharedItineraryStopsType.END_POINT,
      );
      const listTripsAmount = [];
      for (const endPoint of stopsEndPoint) {
        const trip = await this.tripRepository.findById(endPoint.trip, ['servicePayload']);
        if (trip) {
          listTripsAmount.push({
            tripId: trip._id.toString(),
            amount: trip.servicePayload.bookingShare.numberOfSeat,
          });
        }
      }
      stops = [...stops, newStartStop, newEndStop];
      listTripsAmount.push({
        tripId: TempTripId,
        amount: searchDto.numberOfSeats,
      });

      const itinerary = await this.osrService.getItinerary(
        stops,
        vehicleId,
        vehicleCategory.numberOfSeat,
        listTripsAmount,
      );
      console.log('itinerary', itinerary);
      if (!itinerary || itinerary.distance === 0) {
        console.error('Failed to get itinerary for vehicle:', vehicleId);
        continue;
      }
      console.log('sharedItineraryStop', itinerary.sharedItineraryStop);
      console.log('perTripDistanceAfterChange71', itinerary.perTripDistanceAfterChange);

      if (!bestItineraryForNewTripId || itinerary.distance < shortestLength) {
        const perTripDistanceAfterChange = itinerary.perTripDistanceAfterChange;
        let isValidItinerary = true;
        for (const perTripDistance of perTripDistanceAfterChange) {
          if (perTripDistance.tripId === TempTripId) {
            console.log('perTripDistance.distance', perTripDistance.distance);
            console.log(
              searchDto.distanceEstimate +
              '+' +
              '(' +
              searchDto.distanceEstimate +
              '*' +
              MaxDistancePercentAvailableToChange +
              ')',
              searchDto.distanceEstimate +
              searchDto.distanceEstimate * MaxDistancePercentAvailableToChange,
            );
            if (
              perTripDistance.distance >
              searchDto.distanceEstimate +
              searchDto.distanceEstimate * MaxDistancePercentAvailableToChange
            ) {
              console.log('is larger than max distance available to change');
              isValidItinerary = false;
              break;
            }
          } else {
            const trip = await this.tripRepository.findById(perTripDistance.tripId, [
              'servicePayload',
            ]);
            if (trip) {
              if (
                perTripDistance.distance >
                trip.servicePayload.bookingShare.distanceEstimate +
                trip.servicePayload.bookingShare.distanceEstimate *
                MaxDistancePercentAvailableToChange
              ) {
                isValidItinerary = false;
                break;
              }
            }
          }
        }
        //Check sharedItineraryStop is valid
        if (!isValidItinerary) {
          continue;
        }
        shortestLength = itinerary.distance;
        bestItineraryForNewTripId = sharedItinerary._id;
        bestStopArray = itinerary.sharedItineraryStop;
        durationToNewTripStart = itinerary.durationToNewTripStart;
        durationToNewTripEnd = itinerary.durationToNewTripEnd;
        distanceToNewTripStart = itinerary.distanceToNewTripStart;
        distanceToNewTripEnd = itinerary.distanceToNewTripEnd;
      }
    }
    console.log('bestItineraryForNewTripId', bestItineraryForNewTripId);
    if (bestItineraryForNewTripId === null) {
      return null;
    }
    const bestSharedItinerary =
      await this.sharedItineraryRepository.findById(bestItineraryForNewTripId);
    const shareItineraryTemp = bestSharedItinerary;
    shareItineraryTemp.stops = bestStopArray;
    await this.sharedItineraryRepository.saveToRedis(shareItineraryTemp);
    return {
      SharedItineraryDocument: bestSharedItinerary,
      durationToNewTripStart,
      durationToNewTripEnd,
      distanceToNewTripStart,
      distanceToNewTripEnd,
    };
  }

  async createSharedItinerary(
    createSharedItineraryDto: ICreateSharedItineraryDTO,
  ): Promise<SharedItineraryDocument> {
    return await this.sharedItineraryRepository.create(createSharedItineraryDto);
  }

  async passStartPoint(shareItineraryId: string, tripId: string): Promise<SharedItineraryDocument> {
    const sharedItinerary = await this.sharedItineraryRepository.findById(shareItineraryId);
    if (!sharedItinerary) {
      return null;
    }
    const stops = sharedItinerary.stops;
    const newStop = stops.map(stop => {
      if (stop.trip === tripId && stop.pointType === SharedItineraryStopsType.START_POINT) {
        stop.isPass = true;
      }
      return stop;
    });
    //if stop is the first stop of share itinerary change status to in progress
    if (newStop[0].trip === tripId) {
      await this.sharedItineraryRepository.updateStatusSharedItinerary(
        shareItineraryId,
        SharedItineraryStatus.IN_PROGRESS,
      );
    }
    return await this.sharedItineraryRepository.update(shareItineraryId, {
      stops: newStop,
    });
  }

  async passEndPoint(shareItineraryId: string, tripId: string): Promise<SharedItineraryDocument> {
    const sharedItinerary = await this.sharedItineraryRepository.findById(shareItineraryId);
    if (!sharedItinerary) {
      return null;
    }
    const stops = sharedItinerary.stops;
    const newStop = stops.map(stop => {
      if (stop.trip === tripId && stop.pointType === SharedItineraryStopsType.END_POINT) {
        stop.isPass = true;
      }
      return stop;
    });
    //if the stop is the last stop of share itinerary change status to completed
    if (
      newStop[newStop.length - 1].trip === tripId &&
      newStop[newStop.length - 1].pointType === SharedItineraryStopsType.END_POINT
    ) {
      await this.sharedItineraryRepository.updateStatusSharedItinerary(
        shareItineraryId,
        SharedItineraryStatus.COMPLETED,
      );
    }
    return await this.sharedItineraryRepository.update(shareItineraryId, {
      stops: newStop,
    });
  }

  async updateSharedItinerary(
    shareItineraryId: string,
    updateDto: ICreateSharedItineraryDTO,
  ): Promise<SharedItineraryDocument> {
    return await this.sharedItineraryRepository.update(shareItineraryId, updateDto);
  }

  async updateStatusSharedItinerary(
    shareItineraryId: string,
    status: SharedItineraryStatus,
  ): Promise<SharedItineraryDocument> {
    return await this.sharedItineraryRepository.updateStatusSharedItinerary(
      shareItineraryId,
      status,
    );
  }

  async saveASharedItineraryFromRedisToDBByTripID(
    tripId: string,
  ): Promise<SharedItineraryDocument> {
    const trip = await this.tripRepository.findById(tripId, ['servicePayload']);
    if (!trip) {
      return null;
    }
    const sharedItineraryId = trip.servicePayload.bookingShare.sharedItinerary.toString();
    const oldSharedItinerary = await this.sharedItineraryRepository.findById(sharedItineraryId);
    const sharedItinerary = await this.sharedItineraryRepository.findInRedis(sharedItineraryId);
    if (!sharedItinerary) {
      return null;
    }
    const stops = sharedItinerary.stops;
    const stopHasPass = oldSharedItinerary.stops.filter(stop => {
      return stop.isPass === true;
    });
    console.log('stopHasPass', stopHasPass);
    const baseOrder = stopHasPass.length;
    const newStop = stopHasPass;
    stops.forEach(stop => {
      if (stop.trip === TempTripId) {
        stop.trip = trip._id.toString();
      }
      stop.order = baseOrder + stop.order;
      newStop.push(stop);
      console.log('baseOrder', baseOrder);
    });
    console.log('newStop', newStop);
    const updatedSharedItinerary = await this.sharedItineraryRepository.update(sharedItineraryId, {
      stops: newStop,
    });
    return updatedSharedItinerary;
  }

  async getSharedItineraryById(shareItineraryId: string): Promise<SharedItineraryDocument> {
    const itinerary = await this.sharedItineraryRepository.findById(shareItineraryId);

    if (!itinerary) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Itinerary not found',
          vnMessage: 'Lộ trình chia sẻ không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Lọc bỏ các stops đã bị cancel
    const filteredStops = itinerary.stops.filter(stop => !stop.isCancel);
    itinerary.stops = filteredStops;
    return itinerary;
  }

  async getSharedItineraryByTripId(tripId: string): Promise<SharedItineraryDocument> {
    const trip = await this.tripRepository.findById(tripId, ['serviceType', 'servicePayload']);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Chuyến đi không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.serviceType !== ServiceType.BOOKING_SHARE) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not shared itinerary',
          vnMessage: 'Chuyến đi không phải là chuyến đi chia sẻ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const sharedItineraryId = trip.servicePayload.bookingShare.sharedItinerary.toString();
    const itinerary = await this.sharedItineraryRepository.findById(sharedItineraryId);
    if (!itinerary) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Itinerary not found',
          vnMessage: 'Lộ trình chia sẻ không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // Lọc bỏ các stops đã bị cancel
    const filteredStops = itinerary.stops.filter(stop => !stop.isCancel);

    return {
      ...itinerary,
      stops: filteredStops
    } as SharedItineraryDocument;
  }

  async cancelTripInItinerary(tripId: string, sharedItineraryId: string): Promise<SharedItineraryDocument> {
    const sharedItinerary = await this.sharedItineraryRepository.findById(sharedItineraryId);
    const trips = await this.tripRepository.find({
      serviceType: ServiceType.BOOKING_SHARE,
      servicePayload: {
        bookingShare: { sharedItinerary: sharedItineraryId },
      }
    }, ['_id', 'servicePayload']);
    if (trips.length === 1) {
      const updatedSharedItinerary = await this.sharedItineraryRepository.updateStatusSharedItinerary(sharedItineraryId, SharedItineraryStatus.CANCELLED)
      return updatedSharedItinerary
    }
    if (!sharedItinerary) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Shared itinerary not found',
          vnMessage: 'Chuyến đi chia sẻ không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('sharedItinerary416', sharedItinerary);
    console.log('tripId417', tripId);
    console.log('sharedItineraryId418', sharedItinerary.stops);
    const updatedStops = sharedItinerary.stops.map(stop => {
      if (stop.trip === tripId) {
        stop.isCancel = true;
        stop.order = 0;
      }
      return stop;
    });
    console.log('updatedStops427', updatedStops);

    //lấy ra các stop không bị cancel
    const sortStop = updatedStops
      .sort((a, b) => a.order - b.order);


    const activeStop = sortStop.filter(stop => stop.isCancel === false);
    const inActiveStop = sortStop.filter(stop => stop.isCancel === true);

    const reIndexedStop = activeStop.map((stop, index) => {
      stop.order = index + 1;
      return stop;
    })
    const reorderedStops = [...inActiveStop, ...reIndexedStop]

    sharedItinerary.stops = reorderedStops;
    console.log('reorderedStops', reorderedStops);
    const updatedSharedItinerary = await this.sharedItineraryRepository.update(sharedItineraryId, {
      stops: reorderedStops,
    })
    const filteredStops = updatedSharedItinerary.stops.filter(stop => !stop.isCancel);
    const filterSharedItinerary = {
      ...updatedSharedItinerary,
      stops: filteredStops
    } as SharedItineraryDocument;
    await this.sharedItineraryGateway.emitUpdatedSharedItineraryDetail(
      sharedItinerary.driverId.toString(),
      sharedItineraryId,
      filterSharedItinerary,
    )
    return filterSharedItinerary
  }
}
