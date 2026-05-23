import { dbPool } from '../config/database';

async function migrate() {
	try {
		console.log('Creating password_reset_tokens table...');

		await dbPool.query(`
			CREATE TABLE IF NOT EXISTS password_reset_tokens (
				id INT AUTO_INCREMENT PRIMARY KEY,
				user_id INT NOT NULL,
				token VARCHAR(255) NOT NULL UNIQUE,
				expires_at TIMESTAMP NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT fk_password_reset_tokens_users
					FOREIGN KEY (user_id)
					REFERENCES users(id)
					ON DELETE CASCADE
					ON UPDATE CASCADE
			) ENGINE = InnoDB
			DEFAULT CHARSET = utf8mb4
			COLLATE = utf8mb4_unicode_ci
		`);

		console.log('Table password_reset_tokens created successfully!');
		process.exit(0);
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

migrate();
