import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Empty, Spin, Button, Typography, message } from 'antd';
import { TeamOutlined, ClockCircleOutlined, FileDoneOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import { getStatistics } from '../../../services/admin';
import styles from '../index.less';

const { Title } = Typography;

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
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic title="Tổng hồ sơ" value={stats.total} prefix={<TeamOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic title="Chờ duyệt" value={sm['PENDING'] || 0} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic title="Đã duyệt" value={sm['APPROVED'] || 0} valueStyle={{ color: '#52c41a' }} prefix={<FileDoneOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic title="Bị từ chối" value={sm['REJECTED'] || 0} valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Theo trường đại học (nguyện vọng 1)" size="small">
            {stats.byUniversity?.length > 0 ? (
              <Table
                dataSource={stats.byUniversity}
                rowKey="university_name"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Trường', dataIndex: 'university_name', ellipsis: true },
                  { title: 'Số hồ sơ', dataIndex: 'count', width: 90, render: (v: number) => <Tag color="blue">{v}</Tag> },
                ]}
              />
            ) : <Empty description="Chưa có dữ liệu" />}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Theo ngành học (top 10)" size="small">
            {stats.byMajor?.length > 0 ? (
              <Table
                dataSource={stats.byMajor}
                rowKey="major_name"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Ngành', dataIndex: 'major_name', ellipsis: true },
                  { title: 'Số hồ sơ', dataIndex: 'count', width: 90, render: (v: number) => <Tag color="green">{v}</Tag> },
                ]}
              />
            ) : <Empty description="Chưa có dữ liệu" />}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Hồ sơ theo ngày (7 ngày gần nhất)" size="small">
            {stats.daily?.length > 0 ? (
              <Table
                dataSource={stats.daily}
                rowKey="date"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Ngày', dataIndex: 'date' },
                  { title: 'Số hồ sơ', dataIndex: 'count', render: (v: number) => <Tag color="purple">{v}</Tag> },
                ]}
              />
            ) : <Empty description="Chưa có dữ liệu trong 7 ngày qua" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
