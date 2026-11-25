import axiosClient from './axiosClient';
import type { SoDoanListResponse, StudentSoDoanResponse } from '../types';

export interface SoDoanQueryParams {
  khoa?: string;
  lop?: string;
  trangThai?: string;
  giayGioiThieuHe?: boolean;
  viTriLuuTru?: string;
  search?: string;
}

export interface TiepNhanSoDoanPayload {
  sinhVienId: number;
  viTriLuuTru?: string;
  ngayNop?: string;
  giayGioiThieuHe?: boolean;
}

export const soDoanApi = {
  // Admin: Lấy danh sách sổ đoàn có lọc và thống kê
  getAll: async (params?: SoDoanQueryParams): Promise<SoDoanListResponse> => {
    const response = await axiosClient.get<SoDoanListResponse>('/SoDoan', { params });
    return response.data;
  },

  // Admin: Tiếp nhận sổ đoàn
  tiepNhan: async (payload: TiepNhanSoDoanPayload): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.post<{ message: string; data: any }>('/SoDoan/tiep-nhan', payload);
    return response.data;
  },

  // Admin: Rút sổ đoàn
  rutSo: async (id: number): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/SoDoan/${id}/rut-so`);
    return response.data;
  },

  // Admin: Cập nhật vị trí lưu trữ
  capNhatViTri: async (id: number, viTriLuuTru: string): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/SoDoan/${id}/vi-tri`, {
      viTriLuuTru,
    });
    return response.data;
  },

  // Admin: Cập nhật cấp giấy giới thiệu hè
  capGiayGioiThieuHe: async (id: number, giayGioiThieuHe: boolean): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/SoDoan/${id}/giay-gioi-thieu-he`, {
      giayGioiThieuHe,
    });
    return response.data;
  },

  // Admin: Đồng bộ bản ghi sổ đoàn cho toàn bộ sinh viên
  dongBo: async (): Promise<{ message: string; soLuongTaoMoi: number; tongSinhVien: number }> => {
    const response = await axiosClient.post<{ message: string; soLuongTaoMoi: number; tongSinhVien: number }>(
      '/SoDoan/dong-bo'
    );
    return response.data;
  },

  // Admin: Xuất danh sách sổ đoàn ra Excel
  exportExcel: async (params?: SoDoanQueryParams): Promise<Blob> => {
    const response = await axiosClient.get('/SoDoan/export-excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Sinh viên: Xem thông tin sổ đoàn của mình
  getMe: async (): Promise<StudentSoDoanResponse> => {
    const response = await axiosClient.get<StudentSoDoanResponse>('/SoDoan/me');
    return response.data;
  },
};
