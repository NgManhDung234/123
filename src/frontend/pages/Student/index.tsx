import { Button, Card, Typography, message } from 'antd';
import { history } from 'umi';
import { getCurrentUser, logout } from '../../utils/auth';
import styles from './index.less';

const { Title, Text } = Typography;

const StudentPage: React.FC = () => {
	const user = getCurrentUser();

	if (!user || user.role !== 'student') {
		message.error('Bạn không có quyền truy cập trang sinh viên');
		history.replace('/user/login');
		return null;
	}

	return (
		<div className={styles.container}>
			<Card className={styles.card}>
				<Title level={2}>Trang Sinh Viên</Title>
				<Text>Xin chào sinh viên: {user.full_name}</Text>
				<div>
					<Text>Mã sinh viên: {user.student_code || 'Chưa cập nhật'}</Text>
				</div>
				<div className={styles.actions}>
					<Button
						type="primary"
						onClick={() => {
							logout();
							history.push('/user/login');
						}}
					>
						Đăng xuất
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default StudentPage;
