import { Modal, Form, InputNumber } from 'antd';
import type { FormInstance } from 'antd';

interface UpdateConfigProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: FormInstance;
}

export default function UpdateConfig({ visible, onCancel, onOk, form }: UpdateConfigProps) {
  return (
    <Modal
      title="Cập nhật đơn vị cơ bản"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="base_unit"
          label="Đơn vị cơ bản"
          rules={[
            { required: true, message: 'Vui lòng nhập đơn vị cơ bản' }
          ]}
        >
          <InputNumber 
            min={1}
            placeholder="Nhập đơn vị cơ bản"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
