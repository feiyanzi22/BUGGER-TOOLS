import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '错误报告列表'
    },
    {
      key: '/reports/new',
      icon: <PlusOutlined />,
      label: '新建报告'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计分析'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          错误报告管理系统
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[]}
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录'
            }
          ]}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ border: 'none' }}
        />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{
            background: '#fff',
            margin: '24px 0',
            minHeight: 280,
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 