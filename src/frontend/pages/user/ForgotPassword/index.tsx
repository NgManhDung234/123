import { Button, Form, Input, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { forgotPassword } from '../../../services/auth';
import styles from './index.less';

const { Title, Text } = Typography;

interface ForgotPasswordFormValues {
	email: string;
}

const ForgotPassword: React.FC = () => {
	const [form] = Form.useForm();

	const onFinish = async (values: ForgotPasswordFormValues) => {
		try {
			await forgotPassword(values.email);
			message.success('Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra email của bạn.');
			history.push('/user/login');
		} catch (error: any) {
			message.error(error?.response?.data?.message || 'Gửi email thất bại');
		}
	};

	return (
		<div className={styles.container}>
			<Card className={styles.forgotCard}>
				<div className={styles.header}>
					<Title level={2}>Quên Mật Khẩu</Title>
					<Text type="secondary">Nhập email để khôi phục mật khẩu</Text>
				</div>

				<Form form={form} name="forgot-password" onFinish={onFinish} layout="vertical" size="large">
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: 'Vui lòng nhập email!' },
							{ type: 'email', message: 'Email không hợp lệ!' },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Gửi Email Khôi Phục
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

export default ForgotPassword;
