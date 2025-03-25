// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react'

import { SOCKET_NAMESPACE } from '@/constants/socket.enum'

import { LocationData } from '@/interface/trip.interface'
import { initSocket } from '@/service/socket'
import { getLastVehicleLocation } from '@/service/tracking.service'

const useTrackingSocket = (vehicleId?: string) => {
  const [location, setLocation] = useState<LocationData>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    const socket = initSocket(SOCKET_NAMESPACE.TRACKING)
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        if (vehicleId) {
          const LastVehicleLocation = await getLastVehicleLocation(vehicleId)
          setLocation(LastVehicleLocation)
        }
        setLoading(false)
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }

    const handleConnect = () => {
      console.log('Socket connected:', socket.id)
      fetchInitialData()
    }

    console.log('Attempting to connect to socket...')
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message)
    })

    if (vehicleId) {
      const eventKey = `update_location_${vehicleId}`
      console.log(`Listening for: ${eventKey}`)
      socket.on(eventKey, (updatedLocation: LocationData) => {
        setLocation(updatedLocation)
      })
    }

    return () => {
      if (vehicleId) {
        socket.off(`update_location_${vehicleId}`)
      }
      socket.disconnect()
    }
  }, [vehicleId])

  return { data: location, isLoading: loading, error }
}

export default useTrackingSocket
