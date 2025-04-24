'use client'
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Upload, Button, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { categoryService } from '../../services/categoryServices';
import { vehiclesService } from '../../services/vehiclesServices';
import { uploadImage } from '../../utils/firebase/firebase';

interface EditVehicleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  vehicleId: string;
  initialData?: {
    name: string;
    categoryId: string;
    licensePlate: string;
    vehicleCondition: 'available' | 'in-use' | 'maintenance';
    operationStatus: 'pending' | 'running' | 'charging';
    image: string[];
  };
}

interface CategoryOption {
  value: string;
  label: string;
}

interface VehicleFormValues {
  name: string;
  categoryId: string;
  licensePlate: string;
  vehicleCondition: 'available' | 'in-use' | 'maintenance';
  operationStatus: 'pending' | 'running' | 'charging';
}

const vehicleConditionOptions = [
  { value: 'available', label: 'Sẵn sàng sử dụng' },
  { value: 'in-use', label: 'Đang sử dụng' },
  { value: 'maintenance', label: 'Đang bảo trì' }
];

const operationStatusOptions = [
  { value: 'pending', label: 'Chờ hoạt động' },
  { value: 'running', label: 'Đang chạy' },
  { value: 'charging', label: 'Đang sạc' }
];

export default function EditVehicleModal({ visible, onCancel, onSuccess, vehicleId, initialData }: EditVehicleModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Add this separate effect to fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // This effect now only handles initialData
  useEffect(() => {
    if (visible && initialData) {
      // Force a timeout to ensure form is ready before setting values
      setTimeout(() => {
        form.setFieldsValue({
          name: initialData.name,
          categoryId: initialData.categoryId,
          licensePlate: initialData.licensePlate,
          vehicleCondition: initialData.vehicleCondition,
          operationStatus: initialData.operationStatus,
        });
        setExistingImages(initialData.image || []);
      }, 100);
    }
  }, [visible, initialData, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setExistingImages([]);
    }
  }, [visible, form]);

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

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList.map(file => file.originFileObj as File));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields() as VehicleFormValues;
      
      // Upload new images if any
      const newImageUrls = await Promise.all(fileList.map(file => uploadImage(file)));

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      const vehicleData = {
        ...values,
        image: allImages
      };

      await vehiclesService.updateVehicle(vehicleId, vehicleData);
      message.success('Cập nhật xe thành công');
      onSuccess();
    } catch (error: unknown) {
      console.log('Error updating vehicle:', error);
      message.error("Có lỗi xảy ra khi cập nhật xe");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin xe"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
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

        <Form.Item
          name="vehicleCondition"
          label="Tình trạng xe"
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng xe' }]}
        >
          <Select
            placeholder="Chọn tình trạng xe"
            options={vehicleConditionOptions}
          />
        </Form.Item>

        <Form.Item
          name="operationStatus"
          label="Trạng thái hoạt động"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái hoạt động' }]}
        >
          <Select
            placeholder="Chọn trạng thái hoạt động"
            options={operationStatusOptions}
          />
        </Form.Item>

        <Form.Item label="Hình ảnh hiện tại">
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Vehicle ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
                <Button
                  size="small"
                  danger
                  className="absolute top-0 right-0"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>
        </Form.Item>

        <Form.Item label="Thêm hình ảnh mới">
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
