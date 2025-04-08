import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BusTrackingDocument } from './bus-tracking.schema';

@WebSocketGateway({
  namespace: 'bus-tracking',
  cors: {
    origin: '*',
  },
})
export class BusTrackingGateway {
  @WebSocketServer()
  server: Server;

  async broadcastLocationUpdate(tracking: BusTrackingDocument) {
    this.server.to(`trip:${tracking.busTrip}`).emit('location_update', {
      tripId: tracking.busTrip,
      vehicleId: tracking.vehicle,
      location: tracking.currentLocation,
      nextStop: tracking.nextStop,
      delayTime: tracking.delayTime,
      estimatedArrival: tracking.estimatedArrival,
    });
  }

  async broadcastTripStatus(tracking: BusTrackingDocument) {
    this.server.to(`trip:${tracking.busTrip}`).emit('trip_status', {
      tripId: tracking.busTrip,
      currentStop: tracking.currentStop,
      nextStop: tracking.nextStop,
      delayTime: tracking.delayTime,
      estimatedArrival: tracking.estimatedArrival,
    });
  }
}