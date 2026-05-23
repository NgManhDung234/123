import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Menu,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Descriptions,
  Image,
  Statistic,
  Row,
  Col,
  Card,
  Typography,
  message,
  Popconfirm,
  Spin,
  Empty,
  Divider,
  Tooltip,
  Avatar,
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
import * as XLSX from 'xlsx';
import { getCurrentUser, logout } from '../../utils/auth';
import {
  getProfiles,
  getProfileDetail,
  approveProfile,
  rejectProfile,
  getStatistics,
  exportProfiles,
} from '../../services/admin';
import styles from './index.less';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
};
const GENDER_LABEL: Record<string, string> = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

// ── Thống kê ─────────────────────────────────────────────────────────────────
const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStatistics();
      setStats(res.data.data);
    } catch {
      message.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  if (!stats) return null;

  const sm: Record<string, number> = {};
  (stats.byStatus || []).forEach((s: any) => { sm[s.status] = Number(s.count); });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Thống kê tuyển sinh</Title>
        <Button icon={<ReloadOutlined />} onClick={load}>Làm mới</Button>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card className={styles.statCard}><Statistic title="Tổng hồ sơ" value={stats.total} prefix={<TeamOutlined style={{ color: '#1890ff' }} />} /></Card></Col>
        <Col xs={12} sm={6}><Card className={styles.statCard}><Statistic title="Chờ duyệt" value={sm['PENDING'] || 0} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card className={styles.statCard}><Statistic title="Đã duyệt" value={sm['APPROVED'] || 0} valueStyle={{ color: '#52c41a' }} prefix={<FileDoneOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card className={styles.statCard}><Statistic title="Bị từ chối" value={sm['REJECTED'] || 0} valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Theo trường đại học (nguyện vọng 1)" size="small">
            {stats.byUniversity?.length > 0 ? (
              <Table dataSource={stats.byUniversity} rowKey="university_name" pagination={false} size="small"
                columns={[
                  { title: 'Trường', dataIndex: 'university_name', ellipsis: true },
                  { title: 'Số hồ sơ', dataIndex: 'count', width: 90, render: (v: number) => <Tag color="blue">{v}</Tag> },
                ]} />
            ) : <Empty description="Chưa có dữ liệu" />}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Theo ngành học (top 10)" size="small">
            {stats.byMajor?.length > 0 ? (
              <Table dataSource={stats.byMajor} rowKey="major_name" pagination={false} size="small"
                columns={[
                  { title: 'Ngành', dataIndex: 'major_name', ellipsis: true },
                  { title: 'Số hồ sơ', dataIndex: 'count', width: 90, render: (v: number) => <Tag color="green">{v}</Tag> },
                ]} />
            ) : <Empty description="Chưa có dữ liệu" />}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Hồ sơ theo ngày (7 ngày gần nhất)" size="small">
            {stats.daily?.length > 0 ? (
              <Table dataSource={stats.daily} rowKey="date" pagination={false} size="small"
                columns={[
                  { title: 'Ngày', dataIndex: 'date' },
                  { title: 'Số hồ sơ', dataIndex: 'count', render: (v: number) => <Tag color="purple">{v}</Tag> },
                ]} />
            ) : <Empty description="Chưa có dữ liệu trong 7 ngày qua" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ── Chi tiết hồ sơ Modal ──────────────────────────────────────────────────────
const ProfileDetailModal: React.FC<{
  profileId: number | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}> = ({ profileId, onClose, onApprove, onReject }) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rejectForm] = Form.useForm();
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (profileId == null) { setDetail(null); return; }
    setLoading(true);
    setShowRejectForm(false);
    rejectForm.resetFields();
    getProfileDetail(profileId)
      .then(r => setDetail(r.data.data))
      .catch(() => message.error('Không thể tải chi tiết hồ sơ'))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleReject = async () => {
    try {
      const vals = await rejectForm.validateFields();
      onReject(profileId!, vals.reason);
      setShowRejectForm(false);
    } catch {}
  };

  const footerButtons = () => {
    if (!detail || detail.status !== 'PENDING') return [<Button key="close" onClick={onClose}>Đóng</Button>];
    if (showRejectForm) return [
      <Button key="cancel" onClick={() => setShowRejectForm(false)}>Hủy</Button>,
      <Button key="confirm" danger type="primary" onClick={handleReject}>Xác nhận từ chối</Button>,
    ];
    return [
      <Button key="close" onClick={onClose}>Đóng</Button>,
      <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => setShowRejectForm(true)}>Từ chối</Button>,
      <Popconfirm key="approve" title="Xác nhận duyệt hồ sơ này?" onConfirm={() => { onApprove(profileId!); onClose(); }}>
        <Button type="primary" icon={<CheckCircleOutlined />}>Duyệt hồ sơ</Button>
      </Popconfirm>,
    ];
  };

  return (
    <Modal title={`Chi tiết hồ sơ #${profileId}`} open={profileId != null} onCancel={onClose} width={900} footer={footerButtons()}>
      {loading && <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>}
      {!loading && detail && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Tag color={STATUS_COLOR[detail.status]} style={{ fontSize: 13, padding: '2px 10px' }}>{STATUS_LABEL[detail.status]}</Tag>
            {detail.status === 'REJECTED' && detail.reject_reason && <Text type="danger" style={{ marginLeft: 8 }}>Lý do: {detail.reject_reason}</Text>}
          </div>

          <Descriptions bordered column={2} size="small" title="Thông tin cá nhân">
            <Descriptions.Item label="Họ tên">{detail.full_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{detail.dob || '—'}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{GENDER_LABEL[detail.gender] || '—'}</Descriptions.Item>
            <Descriptions.Item label="CCCD">{detail.cccd_number || '—'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detail.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Dân tộc">{detail.ethnicity || '—'}</Descriptions.Item>
            <Descriptions.Item label="Nơi sinh" span={2}>{detail.pob || '—'}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ thường trú" span={2}>{detail.permanent_address || '—'}</Descriptions.Item>
            <Descriptions.Item label="Khu vực ưu tiên">{detail.priority_area ? <Tag color="blue">{detail.priority_area}</Tag> : '—'}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng ưu tiên">{detail.priority_object ? <Tag color="purple">{detail.priority_object}</Tag> : '—'}</Descriptions.Item>
            <Descriptions.Item label="Tài khoản">{detail.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
          </Descriptions>

          <Divider />
          <Descriptions bordered column={3} size="small" title="Điểm xét tuyển">
            <Descriptions.Item label="Môn 1">{detail.score_subject_1 ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Môn 2">{detail.score_subject_2 ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Môn 3">{detail.score_subject_3 ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Tổng điểm 3 môn"><Text strong>{detail.total_score ?? '—'}</Text></Descriptions.Item>
            <Descriptions.Item label="Điểm ưu tiên">{detail.priority_score ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Điểm xét tuyển"><Text strong type="success">{detail.final_score ?? '—'}</Text></Descriptions.Item>
          </Descriptions>

          {(detail.cccd_front_url || detail.cccd_back_url || detail.avatar_url) && (
            <>
              <Divider />
              <Title level={5} style={{ marginBottom: 12 }}>Hình ảnh hồ sơ</Title>
              <Space size={16} style={{ marginBottom: 8 }}>
                {detail.cccd_front_url && (<div style={{ textAlign: 'center' }}><div style={{ marginBottom: 4 }}><Text type="secondary">CCCD mặt trước</Text></div><Image src={`http://localhost:5000${detail.cccd_front_url}`} width={180} height={110} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" /></div>)}
                {detail.cccd_back_url && (<div style={{ textAlign: 'center' }}><div style={{ marginBottom: 4 }}><Text type="secondary">CCCD mặt sau</Text></div><Image src={`http://localhost:5000${detail.cccd_back_url}`} width={180} height={110} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" /></div>)}
                {detail.avatar_url && (<div style={{ textAlign: 'center' }}><div style={{ marginBottom: 4 }}><Text type="secondary">Ảnh chân dung</Text></div><Image src={`http://localhost:5000${detail.avatar_url}`} width={100} height={130} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" /></div>)}
              </Space>
            </>
          )}

          {detail.applications?.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Danh sách nguyện vọng ({detail.applications.length})</Title>
              <Table dataSource={detail.applications} rowKey="id" size="small" pagination={false}
                columns={[
                  { title: 'NV', dataIndex: 'priority_order', width: 50, align: 'center', render: (v: number) => <Tag color="blue">NV{v}</Tag> },
                  { title: 'Trường', dataIndex: 'university_name', ellipsis: true },
                  { title: 'Ngành', dataIndex: 'major_name', ellipsis: true },
                  { title: 'Tổ hợp', dataIndex: 'combination_code', width: 80 },
                  { title: 'Môn thi', dataIndex: 'subject_names', ellipsis: true },
                ]} />
            </>
          )}

          {showRejectForm && (
            <>
              <Divider />
              <Form form={rejectForm} layout="vertical">
                <Form.Item name="reason" label={<Text strong type="danger">Lý do từ chối</Text>} rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}>
                  <Input.TextArea rows={3} placeholder="Nhập rõ lý do từ chối để học sinh biết cần sửa gì..." />
                </Form.Item>
              </Form>
            </>
          )}
        </>
      )}
    </Modal>
  );
};

// ── Danh sách hồ sơ ──────────────────────────────────────────────────────────
const ProfilesPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback((p: number, ps: number, s: string, q: string) => {
    setLoading(true);
    getProfiles({ page: p, pageSize: ps, status: s !== 'ALL' ? s : undefined, search: q || undefined })
      .then(res => { setData(res.data.data.list); setTotal(res.data.data.total); })
      .catch(() => message.error('Không thể tải danh sách hồ sơ'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1, 10, 'ALL', ''); }, []);

  const refresh = () => load(page, pageSize, status, search);

  const handleApprove = (id: number) => {
    approveProfile(id)
      .then(() => { message.success('Đã duyệt hồ sơ!'); refresh(); })
      .catch((err: any) => message.error(err?.response?.data?.message || 'Duyệt hồ sơ thất bại'));
  };

  const handleReject = (id: number, reason: string) => {
    rejectProfile(id, reason)
      .then(() => { message.success('Đã từ chối hồ sơ'); setSelectedId(null); refresh(); })
      .catch((err: any) => message.error(err?.response?.data?.message || 'Từ chối thất bại'));
  };

  const handleExport = () => {
    exportProfiles(status !== 'ALL' ? status : undefined)
      .then(res => {
        const rows = res.data.data;
        const ws = XLSX.utils.json_to_sheet(rows.map((r: any) => ({
          'Mã HB': r.id, 'Họ tên': r.full_name, 'Ngày sinh': r.dob,
          'Giới tính': GENDER_LABEL[r.gender] || r.gender, 'CCCD': r.cccd_number, 'SĐT': r.phone,
          'KV ưu tiên': r.priority_area, 'ĐT ưu tiên': r.priority_object,
          'Môn 1': r.score_subject_1, 'Môn 2': r.score_subject_2, 'Môn 3': r.score_subject_3,
          'Tổng điểm': r.total_score, 'Điểm ưu tiên': r.priority_score, 'Điểm XT': r.final_score,
          'Trạng thái': STATUS_LABEL[r.status] || r.status, 'Lý do từ chối': r.reject_reason || '',
          'Email': r.email, 'Ngày nộp': r.created_at,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hồ sơ tuyển sinh');
        XLSX.writeFile(wb, `ho-so-tuyen-sinh-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
        message.success('Xuất Excel thành công!');
      })
      .catch(() => message.error('Xuất Excel thất bại'));
  };

  const columns = [
    { title: 'Mã HB', dataIndex: 'id', width: 70 },
    {
      title: 'Họ tên', dataIndex: 'full_name', ellipsis: true,
      render: (v: string, r: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={r.avatar_url ? `http://localhost:5000${r.avatar_url}` : undefined} />
          <span>{v || <Text type="secondary">Chưa cập nhật</Text>}</span>
        </Space>
      ),
    },
    { title: 'CCCD', dataIndex: 'cccd_number', width: 130, render: (v: string) => v || '—' },
    { title: 'Điểm XT', dataIndex: 'final_score', width: 80, align: 'center' as const, render: (v: number) => v ? <Text strong style={{ color: '#1890ff' }}>{v}</Text> : '—' },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, align: 'center' as const, render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title: 'Ngày nộp', dataIndex: 'created_at', width: 140, render: (v: string) => new Date(v).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', width: 140, align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedId(record.id)} /></Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm title="Duyệt hồ sơ này?" onConfirm={() => handleApprove(record.id)}>
                <Tooltip title="Duyệt"><Button size="small" type="primary" icon={<CheckCircleOutlined />} /></Tooltip>
              </Popconfirm>
              <Tooltip title="Từ chối (xem chi tiết để nhập lý do)">
                <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => setSelectedId(record.id)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Danh sách hồ sơ tuyển sinh</Title>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất Excel</Button>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="Tìm theo họ tên, CCCD, mã hồ sơ..."
            allowClear style={{ width: 300 }}
            onSearch={v => { setSearch(v); setPage(1); load(1, pageSize, status, v); }}
          />
          <Select value={status} style={{ width: 160 }} onChange={v => { setStatus(v); setPage(1); load(1, pageSize, v, search); }}>
            <Option value="ALL">Tất cả trạng thái</Option>
            <Option value="DRAFT">Nháp</Option>
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Bị từ chối</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={refresh}>Làm mới</Button>
        </Space>
      </Card>
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          current: page, pageSize, total,
          showSizeChanger: true,
          showTotal: t => `Tổng ${t} hồ sơ`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps!); load(p, ps!, status, search); },
        }}
        scroll={{ x: 800 }}
        rowClassName={(r) => r.status === 'PENDING' ? styles.pendingRow : ''}
      />
      <ProfileDetailModal profileId={selectedId} onClose={() => setSelectedId(null)} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
};

// ── Trang chính ───────────────────────────────────────────────────────────────
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
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark" width={220} style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}>
        <div className={styles.siderLogo}>
          {collapsed
            ? <DashboardOutlined style={{ fontSize: 22, color: '#fff' }} />
            : <div><div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Quản lý tuyển sinh</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Admin Dashboard</div></div>
          }
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeMenu]} onClick={({ key }) => setActiveMenu(key)}
          items={[
            { key: 'profiles', icon: <FileTextOutlined />, label: 'Danh sách hồ sơ' },
            { key: 'statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
          ]}
        />
        <div className={styles.siderBottom}>
          <Button type="text" icon={<LogoutOutlined />} onClick={() => { logout(); history.push('/user/login'); }}
            style={{ color: 'rgba(255,255,255,0.65)', width: '100%', textAlign: 'left' }}>
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
