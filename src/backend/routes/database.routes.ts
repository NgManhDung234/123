import { Router } from 'express';
import { testDatabaseConnection } from '../config/database';

const router = Router();

router.get('/health', async (_req, res) => {
	try {
		await testDatabaseConnection();
		res.json({
			success: true,
			message: 'Kết nối MySQL thành công',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Kết nối MySQL thất bại',
			error: error instanceof Error ? error.message : error,
		});
	}
});

export default router;
