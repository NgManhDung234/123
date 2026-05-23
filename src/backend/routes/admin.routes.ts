import { Router, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { dbPool } from '../config/database';
import { requireManager, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Tất cả routes đều yêu cầu manager
router.use(requireManager as any);

// ─── GET /api/admin/profiles ─────────────────────────────────────────────────
// Lấy danh sách hồ sơ, hỗ trợ filter theo status, tìm kiếm theo mã hồ sơ/cccd
router.get('/profiles', async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = '1', pageSize = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let where = '1=1';
    const params: any[] = [];

    if (status && status !== 'ALL') {
      where += ' AND p.status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND (p.cccd_number LIKE ? OR p.full_name LIKE ? OR p.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM profiles p WHERE ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT p.*, u.username, u.email
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE ${where}
       ORDER BY p.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );

    res.json({ success: true, message: 'OK', data: { list: rows, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── GET /api/admin/profiles/:id ──────────────────────────────────────────────
// Xem chi tiết hồ sơ + nguyện vọng
router.get('/profiles/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [profileRows] = await dbPool.query<RowDataPacket[]>(
      `SELECT p.*, u.username, u.email, u.full_name as user_full_name
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (!profileRows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
    }

    const [applications] = await dbPool.query<RowDataPacket[]>(
      `SELECT a.*, u.name as university_name, u.code as university_code,
              m.name as major_name, m.code as major_code,
              c.code as combination_code, c.subject_names
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       JOIN majors m ON a.major_id = m.id
       JOIN combinations c ON a.combination_id = c.id
       WHERE a.profile_id = ?
       ORDER BY a.priority_order ASC`,
      [id]
    );

    res.json({ success: true, message: 'OK', data: { ...profileRows[0], applications } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── PUT /api/admin/profiles/:id/approve ──────────────────────────────────────
router.put('/profiles/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await dbPool.query<ResultSetHeader>(
      `UPDATE profiles SET status = 'APPROVED', reject_reason = NULL WHERE id = ? AND status = 'PENDING'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Hồ sơ không hợp lệ để duyệt (phải ở trạng thái PENDING)' });
    }

    // Ghi log email (thực tế sẽ gửi mail — để nhóm 2 tích hợp nodemailer)
    const [profileRows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM profiles WHERE id = ?', [id]);
    if (profileRows.length) {
      await dbPool.query(
        `INSERT INTO email_logs (profile_id, email_type, subject, message) VALUES (?, 'STATUS_CHANGED', 'Hồ sơ của bạn đã được duyệt', 'Chúc mừng! Hồ sơ tuyển sinh của bạn đã được xét duyệt thành công.')`,
        [id]
      );
    }

    res.json({ success: true, message: 'Đã duyệt hồ sơ thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── PUT /api/admin/profiles/:id/reject ───────────────────────────────────────
router.put('/profiles/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reject_reason } = req.body;

    if (!reject_reason || !reject_reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do từ chối' });
    }

    const [result] = await dbPool.query<ResultSetHeader>(
      `UPDATE profiles SET status = 'REJECTED', reject_reason = ? WHERE id = ? AND status = 'PENDING'`,
      [reject_reason.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Hồ sơ không hợp lệ để từ chối (phải ở trạng thái PENDING)' });
    }

    await dbPool.query(
      `INSERT INTO email_logs (profile_id, email_type, subject, message) VALUES (?, 'STATUS_CHANGED', 'Hồ sơ của bạn bị từ chối', ?)`,
      [id, `Hồ sơ của bạn bị từ chối với lý do: ${reject_reason.trim()}`]
    );

    res.json({ success: true, message: 'Đã từ chối hồ sơ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── GET /api/admin/statistics ────────────────────────────────────────────────
router.get('/statistics', async (_req: AuthRequest, res: Response) => {
  try {
    // Tổng quan theo trạng thái
    const [statusStats] = await dbPool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count FROM profiles GROUP BY status`
    );

    // Thống kê theo trường đại học (dựa vào nguyện vọng 1)
    const [uniStats] = await dbPool.query<RowDataPacket[]>(
      `SELECT u.name as university_name, COUNT(DISTINCT a.profile_id) as count
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.priority_order = 1
       GROUP BY u.id, u.name
       ORDER BY count DESC
       LIMIT 10`
    );

    // Thống kê theo ngành học (top 10)
    const [majorStats] = await dbPool.query<RowDataPacket[]>(
      `SELECT m.name as major_name, COUNT(DISTINCT a.profile_id) as count
       FROM applications a
       JOIN majors m ON a.major_id = m.id
       GROUP BY m.id, m.name
       ORDER BY count DESC
       LIMIT 10`
    );

    // Tổng số hồ sơ
    const [totalRow] = await dbPool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM profiles');

    // Hồ sơ theo ngày (7 ngày gần nhất)
    const [dailyStats] = await dbPool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM profiles
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({
      success: true,
      message: 'OK',
      data: {
        total: totalRow[0].total,
        byStatus: statusStats,
        byUniversity: uniStats,
        byMajor: majorStats,
        daily: dailyStats,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── GET /api/admin/universities ──────────────────────────────────────────────
router.get('/universities', async (_req: AuthRequest, res: Response) => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM universities ORDER BY name');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── GET /api/admin/export/profiles ───────────────────────────────────────────
// Trả về toàn bộ dữ liệu để FE tự xuất Excel (dùng thư viện xlsx đã có sẵn)
router.get('/export/profiles', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let where = '1=1';
    const params: any[] = [];
    if (status && status !== 'ALL') {
      where += ' AND p.status = ?';
      params.push(status);
    }

    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT p.id, p.full_name, p.dob, p.gender, p.cccd_number, p.phone,
              p.permanent_address, p.priority_area, p.priority_object,
              p.score_subject_1, p.score_subject_2, p.score_subject_3,
              p.total_score, p.priority_score, p.final_score,
              p.status, p.reject_reason, p.created_at,
              u.email, u.username
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE ${where}
       ORDER BY p.id`,
      params
    );

    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
