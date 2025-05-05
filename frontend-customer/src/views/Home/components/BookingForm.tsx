'use client'

import LocationTabs from './LocationTabs'

interface BookingFormProps {
  tripType: 'one-way' | 'roundtrip'
  setTripType: (type: 'one-way' | 'roundtrip') => void
  passengers: number
  setPassengers: (count: number) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
}

const BookingForm = ({
  tripType,
  setTripType,
  passengers,
  setPassengers,
  selectedDate,
  setSelectedDate,
}: BookingFormProps) => {
  return (
    <div className="w-full max-w-md rounded-lg bg-white/10 p-6 text-white backdrop-blur-md">
      <LocationTabs />
      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-white">Điểm đón:</label>
          <select className="w-full rounded-lg border border-white/30 bg-white/20 p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
            <option value="">Chọn điểm đón</option>
            <option value="center">Khu Origami</option>
            <option value="airport">Khu RainBow</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-white">Điểm đến:</label>
          <select className="w-full rounded-lg border border-white/30 bg-white/20 p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
            <option value="">Chọn điểm đến</option>
            <option value="center">Khu Origami</option>
            <option value="airport">Khu RainBow</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-white">Loại cuốc xe:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTripType('one-way')}
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                tripType === 'one-way' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
              }`}
            >
              Một chiều →
            </button>
            <button
              onClick={() => setTripType('roundtrip')}
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                tripType === 'roundtrip' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
              }`}
            >
              Khứ hồi ⇄
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-white">Ngày đi:</label>
          <input
            type="date"
            className="w-full rounded-lg border border-white/30 bg-white/20 p-3 text-white"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-white">Số hành khách:</label>
          <div className="flex items-center rounded-lg border border-white/30 bg-white/20">
            <button
              className="p-3 text-white hover:bg-white/10"
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              aria-label="Giảm số hành khách"
            >
              -
            </button>
            <input
              type="number"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full border-none bg-transparent text-center text-white focus:ring-0"
              min="1"
              aria-label="Số hành khách"
            />
            <button
              className="p-3 text-white hover:bg-white/10"
              onClick={() => setPassengers(passengers + 1)}
              aria-label="Tăng số hành khách"
            >
              +
            </button>
          </div>
        </div>

        <button className="w-full rounded-lg bg-yellow-400 p-4 font-medium text-gray-900 transition-colors hover:bg-yellow-500">
          TIẾP TỤC
        </button>
      </div>
    </div>
  )
}

export default BookingForm
