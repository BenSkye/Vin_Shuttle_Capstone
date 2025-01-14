import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8081, { cors: true }) // Enable CORS for WebSocket connections
export class CarTrackingGateway {
  @WebSocketServer()
  server: Server;

  // Store the positions of each car
  private carPositions = {
    car1: null,
    car2: null,
    car3: null,
  };

  // Handle connection events
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle disconnection events
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle messages from drivers
  @SubscribeMessage('driver-update')
  handleDriverUpdate(
    @MessageBody() data: { car: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { car, lat, lng } = data;
    console.log(`Driver ${client.id} updated position for ${car}: ${lat}, ${lng}`);
    this.carPositions[car] = { lat, lng };

    // Broadcast the updated position to all customers
    this.server.emit('car-position', { car, lat, lng });
  }

  // Handle messages from customers
  @SubscribeMessage('customer-subscribe')
  handleCustomerSubscribe(
    @MessageBody() car: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Send the current position of the selected car to the customer
    if (this.carPositions[car]) {
      console.log(`Customer ${client.id} subscribed to ${car}`);
      client.emit('car-position', { car, ...this.carPositions[car] });
    }
  }
}