import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_EMAIL,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
});

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
	const mailOptions = {
		from: process.env.GMAIL_EMAIL,
		to: email,
		subject: 'Khôi phục mật khẩu - Đăng kí tuyển sinh',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #CC0D00;">Khôi phục mật khẩu</h2>
				<p>Chào bạn,</p>
				p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản của mình.</p>
				<p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
				<a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #CC0D00; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Đặt lại mật khẩu</a>
				<p>Hoặc copy và paste link sau vào trình duyệt:</p>
				<p style="word-break: break-all; color: #666;">${resetLink}</p>
				<p style="color: #666; font-size: 14px;">Link này sẽ hết hạn sau 1 giờ.</p>
				<p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
				<p>Trân trọng,<br>Đội ngũ Đăng kí tuyển sinh</p>
			</div>
		`,
	};

	await transporter.sendMail(mailOptions);
};
