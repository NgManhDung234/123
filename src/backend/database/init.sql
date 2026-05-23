CREATE DATABASE IF NOT EXISTS student_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'student_app'@'localhost' IDENTIFIED BY 'student_app_password';
GRANT ALL PRIVILEGES ON student_management.* TO 'student_app'@'localhost';
FLUSH PRIVILEGES;

USE student_management;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE,
	description VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	full_name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role_id INT NOT NULL,
	student_code VARCHAR(50) NULL UNIQUE,
	phone VARCHAR(20) NULL,
	avatar VARCHAR(255) NULL,
	is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	CONSTRAINT fk_users_roles
		FOREIGN KEY (role_id)
		REFERENCES roles(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
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
COLLATE = utf8mb4_unicode_ci;



CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_username_email ON users(username, email);

INSERT INTO roles (name, description)
VALUES
	('manager', 'Tài khoản quản lí'),
	('student', 'Tài khoản sinh viên');

INSERT INTO users (
	full_name,
	email,
	username,
	password_hash,
	role_id,
	student_code,
	phone
)
VALUES
	(
		'Nguyễn Văn Quản Lí',
		'manager@example.com',
		'manager01',
		'$2b$10$8IaJ8Wec9f/XLHfdLMMvu.BWbF18KTx110RxxBKzir1kK0OF5up5W',
		(SELECT id FROM roles WHERE name = 'manager'),
		NULL,
		'0987654321'
	),
	(
		'Nguyễn Văn Sinh Viên',
		'student@example.com',
		'student01',
		'$2b$10$7rYi61beqlsXPQFXx4DMmOD8pjKdvRBwsCT.JGCiVi7fEC4X1QPFu',
		(SELECT id FROM roles WHERE name = 'student'),
		'SV001',
		'0123456789'
	);

SELECT
	users.id,
	users.full_name,
	users.email,
	users.username,
	users.student_code,
	roles.name AS role,
	users.is_active,
	users.created_at
FROM users
JOIN roles ON users.role_id = roles.id;
