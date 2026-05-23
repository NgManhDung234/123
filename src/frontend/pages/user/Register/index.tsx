import { Button, Form, Input, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { register } from '../../../services/auth';
import styles from './index.less';

const { Title, Text } = Typography;

interface RegisterFormValues {
	fullName: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone?: string;
}

const Register: React.FC = () => {
	const [form] = Form.useForm();

	const onFinish = async (values: RegisterFormValues) => {
		try {
			await register({
				fullName: values.fullName,
				email: values.email,
				username: values.username,
				password: values.password,
				phone: values.phone,
			});
			message.success('Đăng ký thành công!');
			history.push('/user/login');
		} catch (error: any) {
			message.error(error?.response?.data?.message || 'Đăng ký thất bại');
		}
	};

	return (
		<div className={styles.container}>
			<Card className={styles.registerCard}>
				<div className={styles.header}>
					<Title level={2}>Đăng Ký</Title>
					<Text type="secondary">Tạo tài khoản mới của bạn</Text>
				</div>

				<Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
					<Form.Item
						label="Họ và tên"
						name="fullName"
						rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
					>
						<Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
					</Form.Item>

					<Form.Item
						label="Tên đăng nhập"
						name="username"
						rules={[
							{ required: true, message: 'Vui lòng nhập tên đăng nhập!' },
							{ min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
							{ pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!' },
						]}
					>
						<Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
					</Form.Item>

					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: 'Vui lòng nhập email!' },
							{ type: 'email', message: 'Email không hợp lệ!' },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Nhập email" />
					</Form.Item>

					<Form.Item label="Số điện thoại" name="phone">
						<Input placeholder="Nhập số điện thoại" />
					</Form.Item>

					<Form.Item
						label="Mật khẩu"
						name="password"
						dependencies={['username']}
						rules={[
							{ required: true, message: 'Vui lòng nhập mật khẩu!' },
							{ min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
							{
								pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
								message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!',
							},
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || value.toLowerCase() !== getFieldValue('username').toLowerCase()) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('Mật khẩu không được trùng với tên đăng nhập!'));
								},
							}),
						]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
					</Form.Item>

					<Form.Item
						label="Xác nhận mật khẩu"
						name="confirmPassword"
						dependencies={['password']}
						rules={[
							{ required: true, message: 'Vui lòng xác nhận mật khẩu!' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('Mật khẩu không khớp!'));
								},
							}),
						]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Đăng Ký
						</Button>
					</Form.Item>
				</Form>

				<div className={styles.footer}>
					<Text>
						Đã có tài khoản?{' '}
						<a onClick={() => history.push('/user/login')}>Đăng nhập ngay</a>
					</Text>
				</div>
			</Card>
		</div>
	);
};

export default Register;
