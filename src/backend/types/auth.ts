export type UserRole = 'manager' | 'student';

export interface RegisterPayload {
	fullName: string;
	email: string;
	username: string;
	password: string;
	studentCode?: string;
	phone?: string;
}

export interface LoginPayload {
	username: string;
	password: string;
}

export interface UserRecord {
	id: number;
	full_name: string;
	email: string;
	username: string;
	password_hash: string;
	role: UserRole;
	student_code?: string | null;
	phone?: string | null;
	avatar?: string | null;
	is_active: boolean;
}
