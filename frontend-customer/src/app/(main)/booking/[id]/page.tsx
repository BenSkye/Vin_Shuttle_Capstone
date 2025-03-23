import BookingDetailPage from '@/views/Booking/DetailBooking'
import { use } from 'react'

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  return <BookingDetailPage id={id} />
}

