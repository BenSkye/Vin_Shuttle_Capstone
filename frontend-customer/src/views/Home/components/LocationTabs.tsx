import { FaLocationArrow, FaMap, FaRegClock } from 'react-icons/fa'

const LocationTabs = () => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-1">
      <button className="flex items-center justify-center gap-2 rounded bg-yellow-400 p-4 text-gray-900 transition-colors hover:bg-yellow-500">
        <FaRegClock className="h-5 w-5" />
        <span>Đặt xe theo giờ</span>
      </button>
      <button className="flex items-center justify-center gap-2 rounded bg-gray-700 p-4 text-white transition-colors hover:bg-gray-600">
        <FaMap className="h-5 w-5" />
        <span>Đặt theo lộ trình ngắm cảnh</span>
      </button>
      <button className="flex items-center justify-center gap-2 rounded bg-gray-700 p-4 text-white transition-colors hover:bg-gray-600">
        <FaLocationArrow className="h-5 w-5" />
        <span>Đặt xe theo điểm đến</span>
      </button>
    </div>
  )
}

export default LocationTabs
