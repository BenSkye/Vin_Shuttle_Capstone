'use client';

import { Form, Input, Button, Card, Layout, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authServices';
import axios, { AxiosError } from 'axios';

interface LoginFormValues {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const response = await authService.login(values);
      
      // Lưu token vào localStorage hoặc cookies
      localStorage.setItem('accessToken', response.accessToken);
      
      message.success('Đăng nhập thành công');
      router.push('/'); // Chuyển hướng về trang chủ
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        message.error(axiosError.response?.data?.message || 'Đăng nhập thất bại');
      } else {
        message.error('Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Đăng nhập Admin</h1>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}