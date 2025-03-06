import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import FileUploadTest from './pages/FileUploadTest';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Layout style={{ minHeight: '100vh' }}>
              <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                  <Menu.Item key="1">
                    <Link to="/">首页</Link>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Link to="/file-upload-test">文件上传测试</Link>
                  </Menu.Item>
                </Menu>
              </Header>
              <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <Routes>
                  <Route path="/" element={<div>首页内容</div>} />
                  <Route path="/file-upload-test" element={<FileUploadTest />} />
                </Routes>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                Electron React 应用 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App; 