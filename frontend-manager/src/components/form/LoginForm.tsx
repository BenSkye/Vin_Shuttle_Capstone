import { useState } from 'react';
import { Form, Input, Button, Card, message, Layout } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await onSubmit(values.email, values.password);
        } catch (err) {
            console.error(err);
            message.error('Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-[400px] shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Đăng nhập Manager</h1>
                </div>

                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={handleSubmit}
                    layout="vertical"
                    size="middle"
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
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full"
                            loading={loading}
                            style={{ backgroundColor: '#007bff', borderColor: '#000000' }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
};