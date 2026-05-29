import React, { useState, useEffect } from 'react';
import {
  Modal, Button, Form, Input, Descriptions, Image, Tag,
  Typography, Space, Divider, Table, Spin, Popconfirm,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getProfileDetail } from '../../../services/admin';
import { STATUS_COLOR, STATUS_LABEL, GENDER_LABEL } from '../constants';

const { Text, Title } = Typography;

interface Props {
  profileId: number | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

const ProfileDetailModal: React.FC<Props> = ({ profileId, onClose, onApprove, onReject }) => {
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
      .catch(() => {})
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
    if (!detail || detail.status !== 'PENDING') {
      return [<Button key="close" onClick={onClose}>Đóng</Button>];
    }
    if (showRejectForm) {
      return [
        <Button key="cancel" onClick={() => setShowRejectForm(false)}>Hủy</Button>,
        <Button key="confirm" danger type="primary" onClick={handleReject}>Xác nhận từ chối</Button>,
      ];
    }
    return [
      <Button key="close" onClick={onClose}>Đóng</Button>,
      <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => setShowRejectForm(true)}>Từ chối</Button>,
      <Popconfirm key="approve" title="Xác nhận duyệt hồ sơ này?" onConfirm={() => { onApprove(profileId!); onClose(); }}>
        <Button type="primary" icon={<CheckCircleOutlined />}>Duyệt hồ sơ</Button>
      </Popconfirm>,
    ];
  };

  return (
    <Modal
      title={`Chi tiết hồ sơ #${profileId}`}
      open={profileId != null}
      onCancel={onClose}
      width={900}
      footer={footerButtons()}
    >
      {loading && <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>}
      {!loading && detail && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Tag color={STATUS_COLOR[detail.status]} style={{ fontSize: 13, padding: '2px 10px' }}>
              {STATUS_LABEL[detail.status]}
            </Tag>
            {detail.status === 'REJECTED' && detail.reject_reason && (
              <Text type="danger" style={{ marginLeft: 8 }}>Lý do: {detail.reject_reason}</Text>
            )}
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
            <Descriptions.Item label="Khu vực ưu tiên">
              {detail.priority_area ? <Tag color="blue">{detail.priority_area}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Đối tượng ưu tiên">
              {detail.priority_object ? <Tag color="purple">{detail.priority_object}</Tag> : '—'}
            </Descriptions.Item>
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
                {detail.cccd_front_url && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 4 }}><Text type="secondary">CCCD mặt trước</Text></div>
                    <Image src={`http://localhost:5000${detail.cccd_front_url}`} width={180} height={110} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" />
                  </div>
                )}
                {detail.cccd_back_url && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 4 }}><Text type="secondary">CCCD mặt sau</Text></div>
                    <Image src={`http://localhost:5000${detail.cccd_back_url}`} width={180} height={110} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" />
                  </div>
                )}
                {detail.avatar_url && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 4 }}><Text type="secondary">Ảnh chân dung</Text></div>
                    <Image src={`http://localhost:5000${detail.avatar_url}`} width={100} height={130} style={{ objectFit: 'cover', borderRadius: 6 }} fallback="data:image/png;base64,iVBORw0KGgo=" />
                  </div>
                )}
              </Space>
            </>
          )}

          {detail.applications?.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Danh sách nguyện vọng ({detail.applications.length})</Title>
              <Table
                dataSource={detail.applications}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: 'NV', dataIndex: 'priority_order', width: 50, align: 'center', render: (v: number) => <Tag color="blue">NV{v}</Tag> },
                  { title: 'Trường', dataIndex: 'university_name', ellipsis: true },
                  { title: 'Ngành', dataIndex: 'major_name', ellipsis: true },
                  { title: 'Tổ hợp', dataIndex: 'combination_code', width: 80 },
                  { title: 'Môn thi', dataIndex: 'subject_names', ellipsis: true },
                ]}
              />
            </>
          )}

          {showRejectForm && (
            <>
              <Divider />
              <Form form={rejectForm} layout="vertical">
                <Form.Item
                  name="reason"
                  label={<Text strong type="danger">Lý do từ chối</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                >
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

export default ProfileDetailModal;
