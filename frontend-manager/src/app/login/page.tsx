'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Layout } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { loginUser } from '@/services/api/user';
import { useAuth } from '@/contexts/AuthContext';

interface CustomError {
    isCustomError: boolean;
    message: string;
}

export default function LoginPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg w-full space-y-10">


                <Layout className="min-h-screen flex items-center justify-center bg-gray-100">

                    <Card
                        className="w-[360px] shadow-lg"
                        bodyStyle={{ padding: '20px' }}
                        style={{ margin: 'auto' }}
                    >
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-bold">Đăng nhập Manager</h1>
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
                                    prefix={<UserOutlined className="text-gray-400 text-xs" />}
                                    placeholder="Email"
                                    size="small"
                                    className="text-xs"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400 text-xs" />}
                                    placeholder="Mật khẩu"
                                    size="small"
                                    className="text-xs"
                                />
                            </Form.Item>

                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full text-xs h-8"
                                    loading={loading}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Layout>
            </div>
        </div>
    );
}
