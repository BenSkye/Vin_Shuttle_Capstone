import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { TicketDocument } from './ticket.schema';

@WebSocketGateway({
  namespace: SOCKET_NAMESPACE.TRIPS,
  cors: {
    origin: '*',
  },
})
export class TicketGateway {
  @WebSocketServer()
  server: Server;

  // Gửi thông báo khi số ghế trống thay đổi
  async notifySeatsUpdate(tripId: string, fromStop: string, toStop: string, availableSeats: number) {
    this.server.to(`trip:${tripId}`).emit('seats_updated', {
      tripId,
      fromStop,
      toStop,
      availableSeats,
    });
  }

  // Gửi thông báo khi trạng thái vé thay đổi
  async notifyTicketStatusChange(ticket: TicketDocument) {
    // Gửi cho người dùng sở hữu vé
    this.server.to(`user:${ticket.passenger}`).emit('ticket_status_changed', {
      ticketId: ticket.id,
      status: ticket.status,
      boardingTime: ticket.boardingTime,
      expectedDropOffTime: ticket.expectedDropOffTime,
    });

    // Gửi cập nhật cho admin/nhân viên quản lý chuyến xe
    this.server.to(`trip:${ticket.busTrip}`).emit('passenger_status_changed', {
      ticketId: ticket.id,
      passengerId: ticket.passenger,
      passengerInfo: ticket.passengerInfo,
      status: ticket.status,
      fromStop: ticket.fromStop,
      toStop: ticket.toStop,
    });
  }

  // Gửi danh sách hành khách đã check-in cho nhân viên
  async notifyPassengerList(tripId: string, passengers: TicketDocument[]) {
    this.server.to(`trip:${tripId}`).emit('passenger_list_updated', {
      tripId,
      passengers: passengers.map(p => ({
        ticketId: p.id,
        passengerId: p.passenger,
        passengerInfo: p.passengerInfo,
        status: p.status,
        fromStop: p.fromStop,
        toStop: p.toStop,
        boardingTime: p.boardingTime,
        expectedDropOffTime: p.expectedDropOffTime,
      })),
    });
  }

  // Client join room theo chuyến xe
  @SubscribeMessage('join_trip')
  handleJoinTrip(client: Socket, tripId: string) {
    client.join(`trip:${tripId}`);
  }

  // Client rời room chuyến xe
  @SubscribeMessage('leave_trip')
  handleLeaveTrip(client: Socket, tripId: string) {
    client.leave(`trip:${tripId}`);
  }

  // Client join room theo user
  @SubscribeMessage('join_user')
  handleJoinUser(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  // Client rời room user
  @SubscribeMessage('leave_user')
  handleLeaveUser(client: Socket, userId: string) {
    client.leave(`user:${userId}`);
  }
} 