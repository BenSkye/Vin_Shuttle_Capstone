// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SOCKET_NAMESPACE } from '@/constants/socket.enum'

import { LocationData } from '@/interface/trip.interface'
import { initSocket } from '@/service/socket'
import { getLastVehicleLocation } from '@/service/tracking.service'

const useTrackingSocket = (vehicleId?: string) => {
  const [location, setLocation] = useState<LocationData>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to keep track of the latest location without causing re-renders
  const locationRef = useRef<LocationData>(null)

  // Memoize the socket connection to prevent unnecessary socket reconnections
  const socket = useMemo(() => initSocket(SOCKET_NAMESPACE.TRACKING), [])

  // Create a stable function to check if location has changed significantly
  const hasLocationChangedSignificantly = useCallback(
    (newLocation: LocationData, oldLocation: LocationData) => {
      if (!oldLocation) return true

      // Consider a 1 meter change or heading change of 5 degrees significant
      const latDiff = Math.abs(newLocation.latitude - oldLocation.latitude)
      const lngDiff = Math.abs(newLocation.longitude - oldLocation.longitude)

      // Approximate conversion from degrees to meters at equator (very rough estimate)
      const meterDiffLat = latDiff * 111000
      const meterDiffLng = lngDiff * 111000 * Math.cos((oldLocation.latitude * Math.PI) / 180)

      const distanceChanged =
        Math.sqrt(meterDiffLat * meterDiffLat + meterDiffLng * meterDiffLng) > 1

      // Check if heading has changed by more than 5 degrees
      const headingChanged =
        newLocation.heading !== null &&
        oldLocation.heading !== null &&
        Math.abs(((newLocation.heading - oldLocation.heading + 180) % 360) - 180) > 5

      return distanceChanged || headingChanged
    },
    []
  )

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        if (vehicleId) {
          const lastVehicleLocation = await getLastVehicleLocation(vehicleId)
          setLocation(lastVehicleLocation)
          locationRef.current = lastVehicleLocation
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

    if (!socket.connected) {
      socket.connect()
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message)
    })

    if (vehicleId) {
      const eventKey = `update_location_${vehicleId}`
      socket.on(eventKey, (updatedLocation: LocationData) => {
        if (hasLocationChangedSignificantly(updatedLocation, locationRef.current)) {
          locationRef.current = updatedLocation
          setLocation(updatedLocation)
        }
      })
    }

    return () => {
      if (vehicleId) {
        socket.off(`update_location_${vehicleId}`)
      }
      // Don't disconnect the socket on component unmount
      // This will be handled by the socket service when the app is closed
    }
  }, [vehicleId, socket, hasLocationChangedSignificantly])

  // Return memoized data to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      data: location,
      isLoading: loading,
      error,
    }),
    [location, loading, error]
  )

  return result
}

export default useTrackingSocket
