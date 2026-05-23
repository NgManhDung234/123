export type UserRole = 'manager' | 'student';

export interface AuthUser {
	id: number;
	full_name: string;
	email: string;
	username: string;
	role: UserRole;
	student_code?: string | null;
	phone?: string | null;
}

export const getCurrentUser = (): AuthUser | null => {
	const user = localStorage.getItem('user');

	if (!user) {
		return null;
	}

	try {
		return JSON.parse(user);
	} catch {
		return null;
	}
};

export const getToken = () => localStorage.getItem('token');

export const logout = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
};

export const redirectByRole = (role: UserRole) => {
	if (role === 'manager') {
		return '/manager';
	}

	return '/student';
};
