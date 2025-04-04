import { Form, Input, Button, Select, FormInstance, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { BusStopWithColor } from '../../busStopMap';
import { VehicleCategory } from '../../../../services/categoryServices';
import { UpdateServiceConfigRequest } from '../../../../services/priceConfigServices';

const { Text } = Typography;

interface BusRouteFormValues {
  name: string;
  description?: string;
  stopIds: string[]; // Mảng ID của các điểm dừng
  vehicleCategory: string; // ID của danh mục phương tiện
}

interface BusRouteFormProps {
  form: FormInstance;
  isLoading: boolean;
  busStops: BusStopWithColor[];
  vehicleCategories: VehicleCategory[];
  busRoutePricingConfig: UpdateServiceConfigRequest | null;
  onFinish: (values: BusRouteFormValues) => void;
}

const BusRouteForm = ({
  form,
  isLoading,
  busStops,
  vehicleCategories,
  busRoutePricingConfig,
  onFinish,
}: BusRouteFormProps) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="name"
        label="Tên tuyến"
        rules={[{ required: true, message: 'Vui lòng nhập tên tuyến!' }]}
      >
        <Input placeholder="Nhập tên tuyến xe bus" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea placeholder="Nhập mô tả về tuyến" rows={3} />
      </Form.Item>

      <Form.Item
        name="stopIds"
        label="Điểm dừng"
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một điểm dừng!' }]}
      >
        <Select
          mode="multiple"
          placeholder="Chọn các điểm dừng"
          options={busStops.map((stop) => ({
            value: stop._id,
            label: stop.name,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="vehicleCategory"
        label="Loại phương tiện"
        rules={[{ required: true, message: 'Vui lòng chọn loại phương tiện!' }]}
      >
        <Select
          placeholder="Chọn loại phương tiện"
          options={vehicleCategories.map((category) => ({
            value: category._id,
            label: `${category.name} (${category.numberOfSeat} chỗ)`,
          }))}
        />
      </Form.Item>

      <Form.Item label="Cấu hình giá">
        {busRoutePricingConfig ? (
          <Text>{`Đơn vị cơ bản: ${busRoutePricingConfig.base_unit} (${busRoutePricingConfig.base_unit_type})`}</Text>
        ) : (
          <Text type="danger">Chưa có cấu hình giá</Text>
        )}
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={isLoading}
          icon={<SaveOutlined />}
        >
          Tạo tuyến xe bus
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BusRouteForm;