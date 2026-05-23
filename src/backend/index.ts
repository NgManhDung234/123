import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import databaseRoutes from './routes/database.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
	res.json({
		message: 'Backend server đang chạy',
	});
});

app.use('/api/database', databaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(port, () => {
	console.log(`Backend server đang chạy tại http://localhost:${port}`);
});
