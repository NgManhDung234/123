import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, message } from 'antd';
import { FileTextOutlined, BarChartOutlined, LogoutOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { getCurrentUser, logout } from '../../utils/auth';
import ProfilesPage from './components/ProfilesPage';
import StatisticsPage from './components/StatisticsPage';
import styles from './index.less';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerPage: React.FC = () => {
  const user = getCurrentUser();
  const [activeMenu, setActiveMenu] = useState('profiles');
  const [collapsed, setCollapsed] = useState(false);

  if (!user || user.role !== 'manager') {
    message.error('Bạn không có quyền truy cập trang quản lí');
    history.replace('/user/login');
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}
      >
        <div className={styles.siderLogo}>
          {collapsed
            ? <DashboardOutlined style={{ fontSize: 22, color: '#fff' }} />
            : (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Quản lý tuyển sinh</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Admin Dashboard</div>
              </div>
            )
          }
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={[
            { key: 'profiles', icon: <FileTextOutlined />, label: 'Danh sách hồ sơ' },
            { key: 'statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
          ]}
        />

        <div className={styles.siderBottom}>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => { logout(); history.push('/user/login'); }}
            style={{ color: 'rgba(255,255,255,0.65)', width: '100%', textAlign: 'left' }}
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{user.full_name}</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Quản trị viên</div>
            </div>
          </Space>
        </Header>

        <Content className={styles.content}>
          {activeMenu === 'profiles' && <ProfilesPage />}
          {activeMenu === 'statistics' && <StatisticsPage />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerPage;
