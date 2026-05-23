import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api/admin';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export interface ProfileListParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getProfiles = (params: ProfileListParams = {}) =>
  axios.get(`${API_URL}/profiles`, { params, ...authHeaders() });

export const getProfileDetail = (id: number) =>
  axios.get(`${API_URL}/profiles/${id}`, authHeaders());

export const approveProfile = (id: number) =>
  axios.put(`${API_URL}/profiles/${id}/approve`, {}, authHeaders());

export const rejectProfile = (id: number, reject_reason: string) =>
  axios.put(`${API_URL}/profiles/${id}/reject`, { reject_reason }, authHeaders());

export const getStatistics = () =>
  axios.get(`${API_URL}/statistics`, authHeaders());

export const getUniversities = () =>
  axios.get(`${API_URL}/universities`, authHeaders());

export const exportProfiles = (status?: string) =>
  axios.get(`${API_URL}/export/profiles`, { params: { status }, ...authHeaders() });
