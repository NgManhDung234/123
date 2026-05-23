import { Button, Form, Input, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { login } from '../../../services/auth';
import { redirectByRole } from '../../../utils/auth';
import styles from './index.less';

const { Title, Text } = Typography;

interface LoginFormValues {
	username: string;
	password: string;
}

const Login: React.FC = () => {
	const [form] = Form.useForm();

	const onFinish = async (values: LoginFormValues) => {
		try {
			const res = await login(values);
			const { token, user } = res.data.data;
			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(user));
			message.success('Đăng nhập thành công!');
			history.push(redirectByRole(user.role));
		} catch (error: any) {
			message.error(error?.response?.data?.message || 'Đăng nhập thất bại');
		}
	};

	return (
		<div className={styles.container}>
			<Card className={styles.loginCard}>
				<div className={styles.header}>
					<Title level={2}>Đăng Nhập</Title>
					<Text type="secondary">Chào mừng bạn quay lại!</Text>
				</div>

				<Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large">
					<Form.Item
						label="Tên đăng nhập"
						name="username"
						rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
					>
						<Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
					</Form.Item>

					<Form.Item
						label="Mật khẩu"
						name="password"
						rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Đăng Nhập
						</Button>
					</Form.Item>
				</Form>

				<div className={styles.footer}>
					<Text>
						Chưa có tài khoản?{' '}
						<a onClick={() => history.push('/user/register')}>Đăng ký ngay</a>
					</Text>
					<br />
					<a onClick={() => history.push('/user/forgot-password')}>Quên mật khẩu?</a>
				</div>
			</Card>
		</div>
	);
};

export default Login;
