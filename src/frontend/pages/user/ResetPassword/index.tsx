import { Button, Form, Input, Card, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { history, useLocation } from 'umi';
import { resetPassword } from '../../../services/auth';
import styles from './index.less';

const { Title, Text } = Typography;

interface ResetPasswordFormValues {
	newPassword: string;
	confirmPassword: string;
}

const ResetPassword: React.FC = () => {
	const [form] = Form.useForm();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const token = searchParams.get('token');

	const onFinish = async (values: ResetPasswordFormValues) => {
		if (!token) {
			message.error('Token không hợp lệ');
			return;
		}

		try {
			await resetPassword(token, values.newPassword);
			message.success('Mật khẩu đã được đặt lại thành công!');
			history.push('/user/login');
		} catch (error: any) {
			message.error(error?.response?.data?.message || 'Đặt lại mật khẩu thất bại');
		}
	};

	if (!token) {
		return (
			<div className={styles.container}>
				<Card className={styles.resetCard}>
					<Title level={2}>Token Không Hợp Lệ</Title>
					<Text type="secondary">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</Text>
					<Button type="primary" block style={{ marginTop: 16 }} onClick={() => history.push('/user/forgot-password')}>
						Yêu cầu lại
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Card className={styles.resetCard}>
				<div className={styles.header}>
					<Title level={2}>Đặt Lại Mật Khẩu</Title>
					<Text type="secondary">Nhập mật khẩu mới của bạn</Text>
				</div>

				<Form form={form} name="reset-password" onFinish={onFinish} layout="vertical" size="large">
					<Form.Item
						label="Mật khẩu mới"
						name="newPassword"
						rules={[
							{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },
							{ min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
							{
								pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
								message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!',
							},
						]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
					</Form.Item>

					<Form.Item
						label="Xác nhận mật khẩu"
						name="confirmPassword"
						dependencies={['newPassword']}
						rules={[
							{ required: true, message: 'Vui lòng xác nhận mật khẩu!' },
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
						<Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Đặt Lại Mật Khẩu
						</Button>
					</Form.Item>
				</Form>

				<div className={styles.footer}>
					<Text>
						Quay lại đăng nhập?{' '}
						<a onClick={() => history.push('/user/login')}>Đăng nhập</a>
					</Text>
				</div>
			</Card>
		</div>
	);
};

export default ResetPassword;
