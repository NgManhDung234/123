USE student_management;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS major_combinations;
DROP TABLE IF EXISTS combinations;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS universities;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE universities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE majors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE (university_id, code),
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE combinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    subject_names VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE major_combinations (
    major_id INT NOT NULL,
    combination_id INT NOT NULL,
    PRIMARY KEY (major_id, combination_id),
    FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE,
    FOREIGN KEY (combination_id) REFERENCES combinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    gender ENUM('MALE','FEMALE','OTHER') DEFAULT NULL,
    ethnicity VARCHAR(50) DEFAULT NULL,
    religion VARCHAR(50) DEFAULT NULL,
    pob VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) UNIQUE DEFAULT NULL,
    cccd_number VARCHAR(20) UNIQUE DEFAULT NULL,
    permanent_address TEXT DEFAULT NULL,
    high_school_info JSON DEFAULT NULL,
    priority_area ENUM('KV1','KV2-NT','KV2','KV3') DEFAULT NULL,
    priority_object ENUM('UT1','UT2') DEFAULT NULL,
    cccd_front_url VARCHAR(255) DEFAULT NULL,
    cccd_back_url VARCHAR(255) DEFAULT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    score_subject_1 DECIMAL(4,2) DEFAULT NULL,
    score_subject_2 DECIMAL(4,2) DEFAULT NULL,
    score_subject_3 DECIMAL(4,2) DEFAULT NULL,
    total_score DECIMAL(5,2) DEFAULT NULL,
    priority_score DECIMAL(4,2) DEFAULT NULL,
    final_score DECIMAL(5,2) DEFAULT NULL,
    status ENUM('DRAFT','PENDING','APPROVED','REJECTED') DEFAULT 'DRAFT',
    reject_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    university_id INT NOT NULL,
    major_id INT NOT NULL,
    combination_id INT NOT NULL,
    priority_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (profile_id, priority_order),
    UNIQUE (profile_id, university_id, major_id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id),
    FOREIGN KEY (major_id) REFERENCES majors(id),
    FOREIGN KEY (combination_id) REFERENCES combinations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    email_type ENUM('SUBMIT_SUCCESS','STATUS_CHANGED') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu: Trường đại học
INSERT INTO universities (code, name) VALUES
('BKH','Trường Đại học Bách Khoa Hà Nội'),
('NEU','Trường Đại học Kinh tế Quốc dân'),
('VNU','Trường Đại học Quốc gia Hà Nội'),
('FTU','Trường Đại học Ngoại thương'),
('PTIT','Học viện Công nghệ Bưu chính Viễn thông');

-- Dữ liệu mẫu: Tổ hợp xét tuyển
INSERT INTO combinations (code, subject_names) VALUES
('A00','Toán, Vật lý, Hóa học'),
('A01','Toán, Vật lý, Tiếng Anh'),
('D01','Toán, Văn, Tiếng Anh'),
('C00','Văn, Sử, Địa'),
('B00','Toán, Hóa, Sinh');

-- Dữ liệu mẫu: Ngành học
INSERT INTO majors (university_id, code, name) VALUES
(1,'CNTT','Công nghệ thông tin'),
(1,'DTVT','Điện tử viễn thông'),
(1,'KTCK','Kỹ thuật cơ khí'),
(2,'QTKD','Quản trị kinh doanh'),
(2,'KT','Kế toán'),
(3,'LUAT','Luật'),
(4,'KTE','Kinh tế đối ngoại'),
(5,'CNTT','Công nghệ thông tin'),
(5,'ATTT','An toàn thông tin');

-- Tổ hợp cho từng ngành
INSERT INTO major_combinations (major_id, combination_id) VALUES
(1,1),(1,2),(2,1),(2,2),(3,1),(4,3),(4,1),(5,1),(5,3),(6,3),(7,3),(7,1),(8,1),(8,2),(9,1),(9,2);

-- Dữ liệu mẫu: Hồ sơ thí sinh với đủ trạng thái để test
INSERT INTO profiles (user_id, full_name, dob, gender, cccd_number, phone, permanent_address, priority_area, priority_object, score_subject_1, score_subject_2, score_subject_3, total_score, priority_score, final_score, status, reject_reason, cccd_front_url, cccd_back_url, avatar_url)
SELECT u.id, 'Nguyễn Văn Sinh Viên', '2006-05-15', 'MALE', '001234567890', '0123456789',
'123 Đường Lê Lợi, Quận 1, TP.HCM', 'KV1', 'UT2',
8.5, 7.0, 9.0, 24.5, 0.5, 25.0, 'PENDING', NULL,
'/uploads/cccd_front.jpg', '/uploads/cccd_back.jpg', '/uploads/avatar.jpg'
FROM users u WHERE u.username='student01';

