import axiosClient from './axiosClient';
import type { LoginResponse } from '../types';

export interface RegisterPayload {
  mssv: string;
  password: string;
  confirmPassword: string;
  hoTen: string;
  email?: string;
  lop?: string;
  khoa?: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/Auth/login', {
      username,
      password,
    });
    return response.data;
  },

  register: async (data: RegisterPayload) => {
    const response = await axiosClient.post('/Auth/register', data);
    return response.data;
  },
};
