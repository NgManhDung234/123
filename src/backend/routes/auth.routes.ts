import { Router } from 'express';
import { loginUser, registerUser, forgotPassword, resetPassword } from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res) => {
	try {
		const user = await registerUser(req.body);
		res.status(201).json({
			success: true,
			message: 'Đăng ký thành công',
			data: user,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : 'Đăng ký thất bại',
		});
	}
});

router.post('/login', async (req, res) => {
	try {
		const result = await loginUser(req.body);
		res.json({
			success: true,
			message: 'Đăng nhập thành công',
			data: result,
		});
	} catch (error) {
		res.status(401).json({
			success: false,
			message: error instanceof Error ? error.message : 'Đăng nhập thất bại',
		});
	}
});

router.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		const result = await forgotPassword(email);
		res.json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : 'Gửi email thất bại',
		});
	}
});

router.post('/reset-password', async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		const result = await resetPassword(token, newPassword);
		res.json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại',
		});
	}
});

export default router;
