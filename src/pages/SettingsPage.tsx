import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Table, Space, Modal, message, Select } from 'antd';
import { UserOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';

const { TabPane } = Tabs;
const { Option } = Select;

interface UserData {
  id: string;
  username: string;
  role: string;
  department: string;
  createTime: Date;
}

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  department: string;
}

// 添加角色常量
const USER_ROLES = {
  admin: '管理员',
  user: '普通用户',
  manager: '部门主管'
};

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { user } = useApi();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [passwordForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await user.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ChangePasswordForm) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      await user.changePassword({
        userId: currentUser.id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    }
  };

  const handleCreateUser = async (values: CreateUserRequest) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    try {
      await user.createUser(values, currentUser.id);
      message.success('创建用户成功');
      setIsModalVisible(false);
      userForm.resetFields();
      loadUsers();
    } catch (error) {
      console.error('创建用户失败:', error);
      message.error('创建用户失败');
    }
  };

  const columns: ColumnsType<UserData> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: Date) => time.toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleResetPassword(record.id)}>
            重置密码
          </Button>
          <Button type="link" danger onClick={() => handleDeleteUser(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleResetPassword = async (userId: string) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    try {
      await user.resetPassword(userId, currentUser.id);
      message.success('密码重置成功');
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error('重置密码失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await user.deleteUser(userId, currentUser.id);
          message.success('删除用户成功');
          loadUsers();
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
        }
      }
    });
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Tabs defaultActiveKey="password">
            <TabPane tab="修改密码" key="password">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="当前密码"
                  name="oldPassword"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="新密码"
                  name="newPassword"
                  rules={[{ required: true, message: '请输入新密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="确认新密码"
                  name="confirmPassword"
                  rules={[{ required: true, message: '请再次输入新密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            {currentUser?.role === 'admin' && (
              <TabPane tab="用户管理" key="users">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Button type="primary" onClick={() => setIsModalVisible(true)}>
                    新建用户
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={loadUsers}
                    loading={loading}
                  >
                    刷新
                  </Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="id"
                  loading={loading}
                />

                <Modal
                  title="新建用户"
                  open={isModalVisible}
                  onCancel={() => setIsModalVisible(false)}
                  footer={null}
                >
                  <Form
                    form={userForm}
                    layout="vertical"
                    onFinish={handleCreateUser}
                  >
                    <Form.Item
                      name="username"
                      label="用户名"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label="密码"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, message: '密码长度不能少于6位' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="role"
                      label="角色"
                      rules={[{ required: true, message: '请选择角色' }]}
                    >
                      <Select placeholder="请选择角色">
                        {Object.entries(USER_ROLES).map(([key, label]) => (
                          <Option key={key} value={key}>{label}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="department"
                      label="部门"
                      rules={[{ required: true, message: '请输入部门' }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        创建
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </TabPane>
            )}
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage; 