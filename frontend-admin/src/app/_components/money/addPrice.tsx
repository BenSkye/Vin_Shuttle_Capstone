'use client'
import { Modal, Form, Select, InputNumber, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PricingConfig } from '../../services/interface';
import { useState, useEffect } from 'react';
import { pricingConfigServices } from '@/app/services/pricingServices';

interface AddPriceProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  categories: { [key: string]: string };
  serviceConfigs: PricingConfig[];
  serviceTypeMap: { [key: string]: string };
}

export default function AddPrice({ 
  visible, 
  onCancel, 
  onSuccess,
  categories,
  serviceConfigs,
  serviceTypeMap
}: AddPriceProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        tiered_pricing: [{
          range: 0,
          price: undefined
        }]
      });
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      await pricingConfigServices.addPricing(values);
      message.success('Thêm giá mới thành công');
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      console.log('Error adding price:', error);
      message.error("Có lỗi xảy ra khi thêm giá mới");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm giá mới"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={800}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="vehicle_category"
          label="Danh mục xe"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục xe' }]}
        >
          <Select
            placeholder="Chọn danh mục xe"
            options={Object.entries(categories).map(([id, name]) => ({
              value: id,
              label: name
            }))}
          />
        </Form.Item>

        <Form.Item
          name="service_config"
          label="Loại dịch vụ"
          rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
        >
          <Select
            placeholder="Chọn loại dịch vụ"
            options={serviceConfigs.map(config => ({
              value: config._id,
              label: serviceTypeMap[config.service_type] || config.service_type
            }))}
          />
        </Form.Item>

        <Form.List name="tiered_pricing">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'range']}
                    rules={[{ required: true, message: 'Nhập khoảng' }]}
                  >
                    <InputNumber 
                      placeholder="Khoảng" 
                      min={0} 
                      disabled={index === 0}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'price']}
                    rules={[{ required: true, message: 'Nhập giá' }]}
                  >
                    <InputNumber 
                      placeholder="Giá" 
                      min={0}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}

                      style={{ width: '200px' }}
                    />
                  </Form.Item>
                  {index !== 0 && (
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm khoảng giá
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
