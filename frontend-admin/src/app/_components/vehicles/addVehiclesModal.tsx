'use client'
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { categoryService } from '../../services/categoryServices';
import { vehiclesService } from '../../services/vehiclesServices';

interface AddVehicleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface CategoryOption {
  value: string;
  label: string;
}

export default function AddVehicleModal({ visible, onCancel, onSuccess }: AddVehicleModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const options = data.map(category => ({
        value: category._id,
        label: category.name
      }));
      setCategories(options);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục xe');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const vehicleData = {
        ...values,
        isActive: true,
        status: 'available'
      };

      await vehiclesService.addVehicle(vehicleData);
      message.success('Thêm xe mới thành công');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm xe mới');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm xe mới"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Tên xe"
          rules={[{ required: true, message: 'Vui lòng nhập tên xe' }]}
        >
          <Input placeholder="Nhập tên xe" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Danh mục xe"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục xe' }]}
        >
          <Select
            placeholder="Chọn danh mục xe"
            options={categories}
          />
        </Form.Item>

        <Form.Item
          name="licensePlate"
          label="Biển số xe"
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
        >
          <Input placeholder="Nhập biển số xe" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
