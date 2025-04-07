import { SOCKET_NAMESPACE } from '@/constants/socket.enum'

import { Trip } from '@/interface/trip.interface'

import SocketService from './socket.core'

class TripSocketService {
  private socket = SocketService.getInstance(SOCKET_NAMESPACE.TRIPS)

  connect() {
    console.log('Connecting to trip socket...')
    if (!this.socket.connected) {
      this.socket.connect()
    }
    return this
  }

  disconnect() {
    SocketService.disconnect(SOCKET_NAMESPACE.TRIPS)
  }

  onTripUpdate(callback: (trips: Trip[]) => void) {
    // callback using to set data has received from server
    this.socket.on('trip_updated', callback)
    return () => this.socket.off('trip_updated', callback)
  }

  onTripDetailUpdate(tripId: string, callback: (trip: Trip) => void) {
    const eventName = `trip_updated_detail_${tripId}`
    this.socket.on(eventName, callback)
    return () => this.socket.off(eventName, callback)
  }
}

export const tripSocketService = new TripSocketService()
