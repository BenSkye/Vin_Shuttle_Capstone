import { use } from 'react'

import BookingDetailPage from '@/views/Booking/DetailBooking'

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  return <BookingDetailPage id={id} />
}
