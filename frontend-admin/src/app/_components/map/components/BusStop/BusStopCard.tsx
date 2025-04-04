import { Card, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BusStopWithColor } from '../../busStopMap';

interface BusStopCardProps {
  busStop: BusStopWithColor;
  isSelected: boolean;
  onSelect: (busStop: BusStopWithColor) => void;
  onEdit: (busStop: BusStopWithColor) => void;
  onDelete: (busStop: BusStopWithColor) => void;
}

const BusStopCard = ({ busStop, isSelected, onSelect, onEdit, onDelete }: BusStopCardProps) => {
  // Render badge trạng thái
  const renderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, text: string }> = {
      active: { color: 'bg-green-200 text-green-800', text: 'Đang hoạt động' },
      inactive: { color: 'bg-red-200 text-red-800', text: 'Ngừng hoạt động' },
      maintenance: { color: 'bg-yellow-200 text-yellow-800', text: 'Đang bảo trì' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <Card 
      size="small" 
      className="cursor-pointer"
      onClick={() => onSelect(busStop)}
      style={{ 
        borderLeft: `4px solid ${busStop.color}`,
        borderColor: isSelected ? '#1890ff' : undefined,
        backgroundColor: isSelected ? '#e6f7ff' : undefined,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-base">{busStop.name}</div>
          <div className="text-gray-500 text-sm mt-1">{busStop.address || 'Không có địa chỉ'}</div>
          <div className="mt-2">
            {renderStatusBadge(busStop.status)}
          </div>
        </div>
        <div className="flex space-x-1">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(busStop);
              }} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(busStop);
              }} 
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default BusStopCard;