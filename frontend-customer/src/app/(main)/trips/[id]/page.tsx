import DetailTripPage from '@/views/Trips/DetailTrips'
import { use } from 'react'

export default function DetailTrip({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  return <DetailTripPage id={id} />
}

