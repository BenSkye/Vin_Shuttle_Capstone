'use client';

import { Form, Input, Button, Card, Layout, notification  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authServices';
import { AxiosError } from 'axios';
import axios from 'axios';
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

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const response = await authService.login(values);
      
      // Lưu token vào localStorage và cookie
      localStorage.setItem('accessToken', response.token.accessToken);
      localStorage.setItem('refreshToken', response.token.refreshToken);
      localStorage.setItem('userId', response.userId);
           
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
        duration: 5,
      });
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        notification.error({
            message: 'Đăng nhập thất bại',
            description: axiosError.response?.data?.message || 'Vui lòng thử lại sau.',
            duration: 5,
          });
      } else {
        notification.error({
            message: 'Đăng nhập thất bại',
            description: (error as AxiosError<ErrorResponse>).response?.data?.message || 'Vui lòng thử lại sau.',
            duration: 5,
          });
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