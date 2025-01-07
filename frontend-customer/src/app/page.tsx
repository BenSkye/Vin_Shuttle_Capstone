import RideBookingForm from './components/RideBookingForm'
import MapWrapper from './components/MapWrapper'

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/3">
        <RideBookingForm />
      </div>
      <div className="w-full md:w-2/3 h-[600px]">
        <MapWrapper />
      </div>
    </div>
  )
}

