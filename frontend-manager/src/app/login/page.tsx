'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Modal, message } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { loginUser } from '@/services/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api/auth';


interface CustomError {
    isCustomError: boolean;
    message: string;
}

export default function LoginPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (values: { email: string; password: string }) => {
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(values.email, values.password);

            if (!response) {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
                return;
            }

            if (!response.token?.accessToken || !response.token?.refreshToken) {
                setError('Đã xảy ra lỗi xác thực. Vui lòng thử lại.');
                return;
            }

            await login(response.token.accessToken, response.token.refreshToken, response.userId);
            router.push('/');
        } catch (err) {
            if ((err as CustomError)?.isCustomError) {
                setError((err as CustomError).message);
            } else {
                setError('Email hoặc mật khẩu không đúng');
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
            message.error('Vui lòng nhập địa chỉ email');
            return;
        }

        try {
            setForgotPasswordLoading(true);
            await authService.forgotPassword(forgotPasswordEmail);

            message.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
            setForgotPasswordVisible(false);
            setForgotPasswordEmail('');
        } catch (error) {
            message.error('Gửi email thất bại. Vui lòng thử lại sau.');
            console.log(error);
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <Card
                className="w-full max-w-md shadow-xl border-0 rounded-xl overflow-hidden"
                bodyStyle={{ padding: '40px' }}
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        {/* Replace with your actual logo */}
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">VS</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Đăng nhập Manager</h1>
                    <p className="text-gray-500 mt-2">Đăng nhập để truy cập hệ thống quản lý</p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={handleSubmit}
                    layout="vertical"
                    size="middle"
                    className="space-y-4"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                        className=''
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400 mr-2" />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400 mr-2" />}
                            placeholder="Mật khẩu"
                            className="rounded-lg py-1.5"
                        />
                    </Form.Item>

                    <div className="flex justify-end mb-2" onClick={handleForgotPassword}>
                        <a className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                            Quên mật khẩu?
                        </a>
                    </div>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full h-12 text-base font-medium rounded-lg"
                            loading={loading}
                            style={{
                                background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
                                borderColor: 'transparent'
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Modal
                title="Đặt lại mật khẩu"
                visible={forgotPasswordVisible}
                onCancel={handleForgotPasswordCancel}
                footer={null}
            >
                <Form
                    name="forgot-password"
                    initialValues={{ remember: true }}
                    onFinish={handleForgotPasswordSubmit}
                    layout="vertical"
                    size="middle"
                    className="space-y-4"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400 mr-2" />}
                            placeholder="Email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full h-12 text-base font-medium rounded-lg"
                            loading={forgotPasswordLoading}
                            style={{
                                background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
                                borderColor: 'transparent'
                            }}
                        >
                            Gửi email đặt lại mật khẩu
                        </Button>
                    </Form.Item>
                </Form>

            </Modal>
        </div>
    );
}