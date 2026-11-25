import axiosClient from './axiosClient';
import type { ChungNhanListResponse, StudentChungNhanResponse, VerifyCertificateResponse } from '../types';

export interface ChungNhanQueryParams {
  hoatDongId?: number;
  khoa?: string;
  lop?: string;
  search?: string;
}

export const chungNhanApi = {
  // Admin: Lấy danh sách chứng nhận điện tử
  getAll: async (params?: ChungNhanQueryParams): Promise<ChungNhanListResponse> => {
    const response = await axiosClient.get<ChungNhanListResponse>('/ChungNhan', { params });
    return response.data;
  },

  // Admin: Cấp chứng nhận cho 1 đoàn viên
  capDon: async (payload: { sinhVienId: number; hoatDongId: number }): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.post<{ message: string; data: any }>('/ChungNhan/cap-don', payload);
    return response.data;
  },

  // Admin: Cấp hàng loạt cho toàn bộ sinh viên đã check-in
  capHangLoat: async (payload: {
    hoatDongId: number;
  }): Promise<{ message: string; soLuongCapMoi: number; soLuongDaCo: number; tongThamGia: number }> => {
    const response = await axiosClient.post<{
      message: string;
      soLuongCapMoi: number;
      soLuongDaCo: number;
      tongThamGia: number;
    }>('/ChungNhan/cap-hang-loat', payload);
    return response.data;
  },

  // Admin: Thu hồi chứng nhận
  thuHoi: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/ChungNhan/${id}`);
    return response.data;
  },

  // Admin: Xuất danh sách chứng nhận ra file Excel
  exportExcel: async (params?: ChungNhanQueryParams): Promise<Blob> => {
    const response = await axiosClient.get('/ChungNhan/export-excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Sinh viên: Lấy danh sách chứng nhận cá nhân
  getMe: async (): Promise<StudentChungNhanResponse> => {
    const response = await axiosClient.get<StudentChungNhanResponse>('/ChungNhan/me');
    return response.data;
  },

  // Công khai: Tra cứu tính hợp lệ của mã chứng nhận
  verify: async (maChungNhan: string): Promise<VerifyCertificateResponse> => {
    const response = await axiosClient.get<VerifyCertificateResponse>(`/ChungNhan/verify/${encodeURIComponent(maChungNhan)}`);
    return response.data;
  },
};
