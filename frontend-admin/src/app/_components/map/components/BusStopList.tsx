import { Spin } from 'antd';
import BusStopCard from './BusStopCard';
import { BusStopWithColor } from "../busMap";

interface BusStopListProps {
  busStops: BusStopWithColor[];
  selectedBusStop: BusStopWithColor | null;
  isLoading: boolean;
  onSelectBusStop: (busStop: BusStopWithColor) => void;
  onEditBusStop: (busStop: BusStopWithColor) => void;
  onDeleteBusStop: (busStop: BusStopWithColor) => void;
}

const BusStopList = ({ 
  busStops,
  selectedBusStop,
  isLoading,
  onSelectBusStop,
  onEditBusStop,
  onDeleteBusStop
}: BusStopListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <Spin tip="Đang xử lý..." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {busStops.length > 0 ? busStops.map((stop) => (
        <BusStopCard 
          key={stop._id || stop._id} 
          busStop={stop}
          isSelected={selectedBusStop?._id === stop._id}
          onSelect={onSelectBusStop}
          onEdit={onEditBusStop}
          onDelete={onDeleteBusStop}
        />
      )) : (
        <div className="text-center text-gray-500 py-8">
          Chưa có điểm dừng nào được tạo
        </div>
      )}
    </div>
  );
};

export default BusStopList;