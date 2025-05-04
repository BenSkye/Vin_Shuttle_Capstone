'use client';

import { Form, Input, Button, Card, Layout, notification, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
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
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
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

      const accessToken = response.token.accessToken;

      if (!authService.isAdmin(accessToken)) {
        notification.error({
          message: 'Không có quyền truy cập',
          description: 'Bạn không có quyền truy cập vào trang quản trị.',
          duration: 5,
        });
        return;
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', response.token.refreshToken);
      localStorage.setItem('userId', response.userId);

      const decodedToken = authService.decodeAccessToken(accessToken);
      localStorage.setItem('userRole', decodedToken.role);

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
          description: 'Vui lòng thử lại sau.',
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordVisible(true);
  };

  const handleForgotPasswordCancel = () => {
    setForgotPasswordVisible(false);
    setForgotPasswordEmail('');
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập địa chỉ email',
        duration: 5,
      });
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await authService.forgotPassword(forgotPasswordEmail);
      if (response === true) {
        notification.success({
          message: 'Thành công',
          description: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
          duration: 5,
        });
        setForgotPasswordVisible(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        notification.error({
          message: 'Lỗi',
          description: axiosError.response?.data?.message || 'Gửi email thất bại. Vui lòng thử lại sau.',
          duration: 5,
        });
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Gửi email thất bại. Vui lòng thử lại sau.',
          duration: 5,
        });
      }
    } finally {
      setForgotPasswordLoading(false);
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

        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={handleForgotPassword}
            className="text-blue-500 hover:underline"
          >
            Quên mật khẩu?
          </Button>
        </div>
      </Card>

      {/* Modal quên mật khẩu */}
      <Modal
        title="Quên mật khẩu"
        visible={forgotPasswordVisible}
        onOk={handleForgotPasswordSubmit}
        onCancel={handleForgotPasswordCancel}
        confirmLoading={forgotPasswordLoading}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
      >
        <p>Vui lòng nhập địa chỉ email để nhận liên kết đặt lại mật khẩu:</p>
        <Input
          prefix={<MailOutlined />}
          placeholder="Email đăng nhập"
          value={forgotPasswordEmail}
          onChange={(e) => setForgotPasswordEmail(e.target.value)}
          className="mt-4"
        />
      </Modal>
    </Layout>
  );
}