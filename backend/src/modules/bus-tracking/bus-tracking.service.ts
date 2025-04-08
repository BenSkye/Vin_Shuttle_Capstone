import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusTracking, BusTrackingDocument } from './bus-tracking.schema';
import { IBusLocation, UpdateLocationDto } from './bus-tracking.dto';
import { BusTrackingGateway } from './bus-tracking.gateway';
import { DRIVER_BUS_SCHEDULE_SERVICE } from '../driver-bus-schedule/driver-bus-schedule.di-token';
import { IDriverBusScheduleService } from '../driver-bus-schedule/driver-bus-schedule.port';
import { BUS_STOP_SERVICE } from '../bus-stop/bus-stop.di-token';
import { IBusStopService } from '../bus-stop/bus-stop.port';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { IBusRouteService } from '../bus-route/bus-route.port';

@Injectable()
export class BusTrackingService {
  constructor(
    @InjectModel(BusTracking.name)
    private readonly busTrackingModel: Model<BusTracking>,
    private readonly busTrackingGateway: BusTrackingGateway,
    @Inject(DRIVER_BUS_SCHEDULE_SERVICE)
    private readonly driverScheduleService: IDriverBusScheduleService,
    @Inject(BUS_STOP_SERVICE)
    private readonly busStopService: IBusStopService,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
  ) {}

  async getCurrentLocation(tripId: string): Promise<BusTrackingDocument> {
    const tracking = await this.busTrackingModel
      .findOne({ 
        busTrip: tripId,
        isActive: true 
      })
      .populate('currentStop')
      .populate('nextStop');

    if (!tracking) {
      throw new NotFoundException('No active tracking found for this trip');
    }

    return tracking;
  }

  async getLocationHistory(
    tripId: string,
    startTime: Date,
    endTime: Date
  ): Promise<BusTrackingDocument> {
    const tracking = await this.busTrackingModel.findOne({
      busTrip: tripId,
      'locationHistory.timestamp': {
        $gte: startTime,
        $lte: endTime
      }
    });

    if (!tracking) {
      throw new NotFoundException('No tracking history found for this trip');
    }

    tracking.locationHistory = tracking.locationHistory.filter(
      location => location.timestamp >= startTime && location.timestamp <= endTime
    );

    return tracking;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async updateNextStop(tracking: BusTrackingDocument): Promise<void> {
    const schedule = await this.driverScheduleService.getScheduleById(
      tracking.driverSchedule.toString()
    );

    const route = await this.busRouteService.getRouteById(schedule.busRoute.toString());
    const currentStopIndex = route.stops.findIndex(
      stop => stop.stopId.toString() === tracking.currentStop?.toString()
    );

    if (currentStopIndex < route.stops.length - 1) {
      tracking.nextStop = route.stops[currentStopIndex + 1].stopId;
    } else {
      tracking.nextStop = null; // Đã đến điểm cuối
    }
  }

  async updateLocation(
    driverScheduleId: string,
    locationData: UpdateLocationDto,
  ): Promise<BusTrackingDocument> {
    const tracking = await this.busTrackingModel.findOne({
      driverSchedule: driverScheduleId,
      isActive: true,
    });

    if (!tracking) {
      throw new NotFoundException('Active tracking session not found');
    }

    const newLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: new Date(),
      speed: locationData.speed,
      heading: locationData.heading,
    };

    // Cập nhật vị trí hiện tại
    tracking.currentLocation = newLocation;
    // Thêm vào lịch sử
    tracking.locationHistory.push(newLocation);
    
    // Tính toán thời gian delay nếu có
    await this.calculateDelay(tracking);
    
    // Cập nhật điểm dừng tiếp theo
    await this.updateNextStop(tracking);

    const updatedTracking = await tracking.save();

    // Gửi cập nhật realtime
    await this.busTrackingGateway.broadcastLocationUpdate(updatedTracking);

    return updatedTracking;
  }

  private async calculateDelay(tracking: BusTrackingDocument): Promise<void> {
    const schedule = await this.driverScheduleService.getScheduleById(
      tracking.driverSchedule.toString()
    );

    // Nếu có điểm dừng hiện tại, tính toán thời gian trễ
    if (tracking.nextStop) {
      // Lấy thời gian dự kiến đến điểm dừng tiếp theo từ lịch trình
      const route = await this.busRouteService.getRouteById(schedule.busRoute.toString());
      const nextStopIndex = route.stops.findIndex(
        stop => stop.stopId.toString() === tracking.nextStop.toString()
      );
      
      if (nextStopIndex !== -1) {
        const expectedTime = new Date(
          schedule.startTime.getTime() + route.stops[nextStopIndex].estimatedTime * 60000
        );
        const estimatedTime = await this.calculateEstimatedArrival(
          tracking.currentLocation,
          tracking.nextStop.toString()
        );

        tracking.delayTime = Math.max(0, 
          (estimatedTime.getTime() - expectedTime.getTime()) / (1000 * 60)
        );
        tracking.estimatedArrival = estimatedTime;
      }
    }
  }

  private async calculateEstimatedArrival(
    currentLocation: IBusLocation,
    nextStopId: string
  ): Promise<Date> {
    const nextStop = await this.busStopService.getBusStopById(nextStopId);
    
    // Tính khoảng cách còn lại
    const remainingDistance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextStop.position.lat,
      nextStop.position.lng
    );

    // Ước tính thời gian dựa trên tốc độ hiện tại
    const estimatedMinutes = (remainingDistance / currentLocation.speed) * 60;
    
    return new Date(Date.now() + estimatedMinutes * 60 * 1000);
  }
}
