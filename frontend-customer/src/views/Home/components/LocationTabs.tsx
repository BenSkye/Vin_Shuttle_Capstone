import { FaLocationArrow, FaMap, FaRegClock } from 'react-icons/fa';

const LocationTabs = () => {
    return (
        <div className="grid grid-cols-1 gap-1 mb-6">
            <button className="flex items-center justify-center gap-2 p-4 bg-yellow-400 text-gray-900 rounded hover:bg-yellow-500 transition-colors">
                <FaRegClock className="w-5 h-5" />
                <span>Đặt xe theo giờ</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                <FaMap className="w-5 h-5" />
                <span>Đặt theo tuyến cố định</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                <FaLocationArrow className="w-5 h-5" />
                <span>Đặt xe theo điểm đến</span>
            </button>
        </div>
    );
};

export default LocationTabs; 