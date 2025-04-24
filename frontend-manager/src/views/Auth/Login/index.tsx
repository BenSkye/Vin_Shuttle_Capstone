'use client';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
// import Image from 'next/image';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

const { Title } = Typography;

// Define interface for form values
interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login() {
    const onFinish = (values: LoginFormValues) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2} style={{ textAlign: 'center' }}>Sign in to your account</Title>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input placeholder="Enter your Gmail address" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item>
                        <Checkbox>Remember me</Checkbox>
                        <a href="#" style={{ float: 'right' }}>Forgot your password?</a>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Sign in
                        </Button>
                    </Form.Item>

                    {/* <Form.Item>
                        <Button type="default" style={{ width: '100%' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image 
                                    src="/path/to/google-icon.png" 
                                    alt="Google"
                                    width={20}
                                    height={20}
                                    style={{ marginRight: '8px' }}
                                />
                                Sign in with Google
                            </span>
                        </Button>
                    </Form.Item> */}
                </Form>
            </div>
        </div>
    );
}