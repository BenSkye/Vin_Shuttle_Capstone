'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockOutlined } from '@ant-design/icons';
import { Card, Form, Input, Layout, message, Button } from 'antd';
import { authService } from '@/services/api/auth';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');

    const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            setLoading(true);
            if (!token) {
                message.error('Liên kết không hợp lệ!');
                return;
            }
            const response = await authService.resetForgotPassword(token, values.newPassword);
            const data = await response;

            if (data === true) {
                message.success('Cập nhật mật khẩu thành công!');
                router.push('/login');
            } else {
                message.error(data.message || 'Cập nhật mật khẩu thất bại');
            }
        } catch (error) {
            console.log('error', error);
            message.error('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
                <Card className="w-[400px] shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-red-500">Liên kết không hợp lệ</h1>
                        <p className="mt-2">Vui lòng yêu cầu gửi lại email đặt lại mật khẩu</p>
                    </div>
                </Card>
            </Layout>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg w-full space-y-10">
                <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
                    <Card className="w-[400px] shadow-lg">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
                            <p className="text-gray-500 mt-2">Nhập mật khẩu mới của bạn</p>
                        </div>

                        <Form
                            form={form}
                            name="resetPassword"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full"
                                    loading={loading}
                                >
                                    Cập nhật mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Layout>
            </div>
        </div>
    );
}

export default function ResetPasswordForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}