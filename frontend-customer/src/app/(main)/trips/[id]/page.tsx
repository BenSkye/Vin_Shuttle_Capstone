import { use } from 'react'

import DetailTripPage from '@/views/Trips/DetailTrips'

export default function DetailTrip({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  return <DetailTripPage id={id} />
}
