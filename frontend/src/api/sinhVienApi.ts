import axiosClient from './axiosClient';
import type { User } from '../types';

export interface SinhVienListResponse {
  sinhViens: User[];
  danhSachKhoa: string[];
}

export const sinhVienApi = {
  // Admin: Lấy danh sách toàn bộ đoàn viên / sinh viên có lọc
  getAll: async (params?: { khoa?: string; lop?: string; search?: string }): Promise<SinhVienListResponse> => {
    const response = await axiosClient.get<SinhVienListResponse>('/SinhVien', { params });
    return response.data;
  },

  // Admin: Thêm mới sinh viên
  create: async (data: Partial<User> & { password?: string }): Promise<{ message: string; data: User }> => {
    const response = await axiosClient.post<{ message: string; data: User }>('/SinhVien', data);
    return response.data;
  },

  // Admin: Cập nhật thông tin sinh viên
  update: async (id: number, data: Partial<User> & { password?: string }): Promise<{ message: string }> => {
    const response = await axiosClient.put<{ message: string }>(`/SinhVien/${id}`, data);
    return response.data;
  },

  // Admin: Xóa sinh viên
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/SinhVien/${id}`);
    return response.data;
  },

  // Admin: Import sinh viên từ file Excel
  importExcel: async (file: File): Promise<{ message: string; success: number; updated: number; fail: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<{ message: string; success: number; updated: number; fail: number }>(
      '/SinhVien/import-excel',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Sinh viên: Lấy thông tin tài khoản hiện tại
  getMe: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/SinhVien/me');
    return response.data;
  },

  // Sinh viên: Tải lên avatar
  uploadAvatar: async (file: File): Promise<{ message: string; avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<{ message: string; avatarUrl: string }>(
      '/SinhVien/upload-avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadChatCount: async (): Promise<number> => {
    const response = await axiosClient.get<number>('/Chat/GetUnreadCount');
    return response.data;
  },
};
