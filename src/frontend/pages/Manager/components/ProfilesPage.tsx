import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Button, Input, Select, Space,
  Card, Typography, message, Popconfirm, Tooltip, Avatar,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  DownloadOutlined, UserOutlined, ReloadOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { getProfiles, approveProfile, rejectProfile, exportProfiles } from '../../../services/admin';
import { STATUS_COLOR, STATUS_LABEL, GENDER_LABEL } from '../constants';
import ProfileDetailModal from './ProfileDetailModal';
import styles from '../index.less';

const { Title, Text } = Typography;
const { Option } = Select;

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
          'Giới tính': GENDER_LABEL[r.gender] || r.gender,
          'CCCD': r.cccd_number, 'SĐT': r.phone,
          'KV ưu tiên': r.priority_area, 'ĐT ưu tiên': r.priority_object,
          'Môn 1': r.score_subject_1, 'Môn 2': r.score_subject_2, 'Môn 3': r.score_subject_3,
          'Tổng điểm': r.total_score, 'Điểm ưu tiên': r.priority_score, 'Điểm XT': r.final_score,
          'Trạng thái': STATUS_LABEL[r.status] || r.status,
          'Lý do từ chối': r.reject_reason || '',
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
    {
      title: 'Điểm XT', dataIndex: 'final_score', width: 80, align: 'center' as const,
      render: (v: number) => v ? <Text strong style={{ color: '#1890ff' }}>{v}</Text> : '—',
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 120, align: 'center' as const,
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
    },
    {
      title: 'Ngày nộp', dataIndex: 'created_at', width: 140,
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác', width: 140, align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedId(record.id)} />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm title="Duyệt hồ sơ này?" onConfirm={() => handleApprove(record.id)}>
                <Tooltip title="Duyệt">
                  <Button size="small" type="primary" icon={<CheckCircleOutlined />} />
                </Tooltip>
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
            allowClear
            style={{ width: 300 }}
            onSearch={v => { setSearch(v); setPage(1); load(1, pageSize, status, v); }}
          />
          <Select
            value={status}
            style={{ width: 160 }}
            onChange={v => { setStatus(v); setPage(1); load(1, pageSize, v, search); }}
          >
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
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: t => `Tổng ${t} hồ sơ`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps!); load(p, ps!, status, search); },
        }}
        scroll={{ x: 800 }}
        rowClassName={(r) => r.status === 'PENDING' ? styles.pendingRow : ''}
      />

      <ProfileDetailModal
        profileId={selectedId}
        onClose={() => setSelectedId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ProfilesPage;
