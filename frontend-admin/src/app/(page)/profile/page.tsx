'use client'
import { Layout, Card, Avatar, Button, Form, Input, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import Sidebar from '../../_components/common/Sidebar';

const { Header, Content } = Layout;

export default function Profile() {
  // Mock data cho profile
  const profileData = {
    name: 'Admin Name',
    email: 'admin@example.com',
    phone: '0123456789',
    avatar: null // URL hình ảnh avatar nếu có
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // Xử lý cập nhật thông tin profile
  };

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4">
          <h2 className="text-xl font-semibold ml-7">Trang cá nhân</h2>
        </Header>
        <Content className="m-6">
          <div className="max-w-3xl mx-auto">
            {/* Thông tin cơ bản */}
            <Card className="mb-6">
              <div className="flex items-center mb-6">
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  src={profileData.avatar}
                  className="mr-6"
                />
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{profileData.name}</h3>
                  <p className="text-gray-500">Administrator</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  <span>{profileData.phone}</span>
                </div>
              </div>
            </Card>

            {/* Form chỉnh sửa thông tin */}
            <Card title="Chỉnh sửa thông tin">
              <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={profileData}
              >
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>

                <Divider />

                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
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
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Lưu thay đổi
                    </Button>
                    <Button>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}