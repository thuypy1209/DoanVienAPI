import axiosClient from './axiosClient';
import type { DoanPhiListResponse, StudentDoanPhiResponse } from '../types';

export interface DoanPhiQueryParams {
  namHoc?: string;
  hocKy?: string;
  khoa?: string;
  lop?: string;
  trangThai?: string;
  search?: string;
}

export interface TaoDotThuPayload {
  namHoc: string;
  hocKy: string;
  soTien?: number;
  khoa?: string;
  lop?: string;
}

export const doanPhiApi = {
  // Admin: Lấy danh sách thu nộp đoàn phí có bộ lọc và thống kê
  getAll: async (params?: DoanPhiQueryParams): Promise<DoanPhiListResponse> => {
    const response = await axiosClient.get<DoanPhiListResponse>('/DoanPhi', { params });
    return response.data;
  },

  // Admin: Xác nhận 1 đoàn viên đã nộp tiền
  xacNhan: async (id: number, nguoiThu?: string): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/DoanPhi/${id}/xac-nhan`, {
      nguoiThu,
    });
    return response.data;
  },

  // Admin: Hủy xác nhận (chuyển về Chưa nộp)
  huyXacNhan: async (id: number): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/DoanPhi/${id}/huy`);
    return response.data;
  },

  // Admin: Xác nhận nhiều đoàn viên cùng lúc
  xacNhanHangLoat: async (ids: number[], nguoiThu?: string): Promise<{ message: string; soLuong: number }> => {
    const response = await axiosClient.post<{ message: string; soLuong: number }>('/DoanPhi/xac-nhan-hang-loat', {
      ids,
      nguoiThu,
    });
    return response.data;
  },

  // Admin: Khởi tạo đợt thu đoàn phí mới
  taoDotThu: async (
    payload: TaoDotThuPayload
  ): Promise<{ message: string; soLuongTaoMoi: number; soLuongBoQua: number; tongSinhVien: number }> => {
    const response = await axiosClient.post<{
      message: string;
      soLuongTaoMoi: number;
      soLuongBoQua: number;
      tongSinhVien: number;
    }>('/DoanPhi/tao-dot-thu', payload);
    return response.data;
  },

  // Admin: Xuất danh sách ra file Excel
  exportExcel: async (params?: DoanPhiQueryParams): Promise<Blob> => {
    const response = await axiosClient.get('/DoanPhi/export-excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Sinh viên: Xem lịch sử & tình trạng đóng đoàn phí của chính mình
  getMe: async (): Promise<StudentDoanPhiResponse> => {
    const response = await axiosClient.get<StudentDoanPhiResponse>('/DoanPhi/me');
    return response.data;
  },
};
