'use client'
import { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Space, App, notification, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../_components/common/Sidebar';
import { categoryService } from '../../../services/categoryServices';
import { use } from 'react';

const { Header, Content } = Layout;

interface VehicleCategory {
  _id: string;
  name: string;
  description: string;
  numberOfSeat: number;
}

interface ApiError {
  message: string;
}

export default function CategoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const categoryId = use(params).id;

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        const category = await categoryService.getCategoryById(categoryId);
        form.setFieldsValue(category);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        notification.error({
          message: 'Lỗi',
          description: apiError.message || 'Không thể tải thông tin danh mục xe',
          duration: 5,
          placement: 'topRight'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [categoryId, form]);

  const handleUpdate = async (values: Omit<VehicleCategory, '_id'>) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn cập nhật danh mục xe này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await categoryService.updateCategory(categoryId, values);
          notification.success({
            message: 'Thành công',
            description: 'Cập nhật danh mục xe thành công',
            duration: 5,
            placement: 'topRight'
          });
          router.push('/category');
        } catch (error: unknown) {
          const apiError = error as ApiError;
          notification.error({
            message: 'Lỗi',
            description: apiError.message || 'Không thể cập nhật danh mục xe',
            duration: 5,
            placement: 'topRight'
          });
        }
      }
    });
  };

  return (
    <App>
      <Layout>
        <Sidebar />
        <Layout>
          <Header className="bg-white p-4">
            <h2 className="text-xl font-semibold ml-7">Chi tiết danh mục xe</h2>
          </Header>
          <Content className="m-6 p-6 bg-white">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              disabled={loading}
            >
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="numberOfSeat"
                label="Số ghế"
                rules={[
                  { required: true, message: 'Vui lòng nhập số ghế!' },
                  {
                    validator: async (_, value) => {
                      const numValue = Number(value);
                      if (isNaN(numValue)) {
                        throw new Error('Vui lòng nhập số hợp lệ!');
                      }
                      if (numValue < 1) {
                        throw new Error('Số ghế phải lớn hơn 0!');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" min={1} />
              </Form.Item>

              <Form.Item className="flex justify-end mb-0">
                <Space>
                  <Button onClick={() => router.push('/category')}>
                    Quay lại
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Content>
        </Layout>
      </Layout>
    </App>
  );
}
