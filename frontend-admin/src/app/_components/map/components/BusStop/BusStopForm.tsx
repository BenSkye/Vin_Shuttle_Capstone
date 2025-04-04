import { Form, Input, Button, Select, FormInstance } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { STATUS_OPTIONS } from '../../busStopMap';
import { BusStopWithColor } from '../../busStopMap';

interface BusStopFormProps {
  form: FormInstance;
  isEditing: boolean;
  isLoading: boolean;
  onFinish: (values: BusStopWithColor) => void;
  currentBusStop: BusStopWithColor | null;
}

const BusStopForm = ({
  form,
  isEditing,
  isLoading,
  onFinish,
  currentBusStop
}: BusStopFormProps) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="Tên điểm dừng"
        rules={[{ required: true, message: 'Vui lòng nhập tên điểm dừng!' }]}
      >
        <Input placeholder="Nhập tên điểm dừng" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea placeholder="Nhập mô tả về điểm dừng" rows={3} />
      </Form.Item>
      
      <Form.Item
        name="address"
        label="Địa chỉ"
      >
        <Input.TextArea placeholder="Địa chỉ chi tiết" rows={2} readOnly />
      </Form.Item>
      
      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
      >
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          loading={isLoading}
          icon={<SaveOutlined />}
        >
          {isEditing ? 'Cập nhật điểm dừng' : 'Tạo điểm dừng'}
        </Button>
      </Form.Item>
      
      {currentBusStop && !currentBusStop._id && (
        <div className="text-gray-500 text-sm mt-2">
          * Click vào bản đồ để chọn vị trí điểm dừng
        </div>
      )}
    </Form>
  );
};

export default BusStopForm;