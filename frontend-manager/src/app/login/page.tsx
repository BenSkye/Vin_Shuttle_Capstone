'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Layout, Modal, message } from 'antd';
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
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg w-full space-y-10">
                <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
                    <Card
                        className="w-[420px] shadow-lg"
                        bodyStyle={{ padding: '30px' }}
                        style={{ margin: 'auto' }}
                    >
                        <div className="text-center mb-4">
                            <h1 className="text-3xl font-bold">Đăng nhập Manager</h1>
                            {error && (
                                <p className="mt-2 text-center text-sm text-red-600">
                                    {error}
                                </p>
                            )}
                        </div>
                        <Form
                            form={form}
                            name="login"
                            initialValues={{ remember: true }}
                            onFinish={handleSubmit}
                            layout="vertical"
                            size="small"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Email"
                                    size="large"
                                    className="text-sm"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="Mật khẩu"
                                    size="large"
                                    className="text-sm"
                                />
                            </Form.Item>

                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full text-sm h-10"
                                    loading={loading}
                                    style={{ backgroundColor: '#000000', borderColor: '#000000' }}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center mt-4">
                            <Button
                                type="link"
                                onClick={handleForgotPassword}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                                Quên mật khẩu?
                            </Button>
                        </div>
                    </Card>
                </Layout>

                {/* Modal quên mật khẩu */}
                <Modal
                    title="Quên mật khẩu"
                    open={forgotPasswordVisible}
                    onOk={handleForgotPasswordSubmit}
                    onCancel={handleForgotPasswordCancel}
                    confirmLoading={forgotPasswordLoading}
                    okText="Gửi yêu cầu"
                    cancelText="Hủy bỏ"
                >
                    <p className="mb-4">Nhập địa chỉ email để nhận liên kết đặt lại mật khẩu:</p>
                    <Input
                        prefix={<MailOutlined className="text-gray-400" />}
                        placeholder="Email đăng nhập"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        size="large"
                    />
                </Modal>
            </div>
        </div>
    );
}