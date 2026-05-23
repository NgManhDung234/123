import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export interface LoginPayload {
	username: string;
	password: string;
}

export interface RegisterPayload {
	fullName: string;
	email: string;
	username: string;
	password: string;
	studentCode?: string;
	phone?: string;
}

export const login = (payload: LoginPayload) => {
	return axios.post(`${API_URL}/login`, payload);
};

export const register = (payload: RegisterPayload) => {
	return axios.post(`${API_URL}/register`, payload);
};

export const forgotPassword = (email: string) => {
	return axios.post(`${API_URL}/forgot-password`, { email });
};

export const resetPassword = (token: string, newPassword: string) => {
	return axios.post(`${API_URL}/reset-password`, { token, newPassword });
};
