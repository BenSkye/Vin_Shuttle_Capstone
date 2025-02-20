'use client'
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { categoryService } from '../../services/categoryServices';
import { vehiclesService } from '../../services/vehiclesServices';
import { uploadImage } from '../../utils/firebase/firebase';

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
  const [fileList, setFileList] = useState<File[]>([]);

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
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục xe');
    }
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.map((file: any) => file.originFileObj));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Upload images and get URLs
      const imageUrls = await Promise.all(fileList.map(file => uploadImage(file)));

      const vehicleData = {
        ...values,
        isActive: true,
        status: 'available',
        image: imageUrls // Include image URLs
      };

      await vehiclesService.addVehicle(vehicleData);
      message.success('Thêm xe mới thành công');
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Có lỗi xảy ra khi thêm xe mới';
      message.error(errorMessage);
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

        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture"
            multiple
            beforeUpload={() => false}
            onChange={handleFileChange}
          >
            <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
