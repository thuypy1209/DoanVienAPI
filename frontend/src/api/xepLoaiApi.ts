import axiosClient from './axiosClient';
import type { XepLoaiListResponse, StudentXepLoaiResponse } from '../types';

export interface XepLoaiQueryParams {
  namHoc?: string;
  khoa?: string;
  lop?: string;
  xepLoai?: string;
  doanKhoaDuyet?: boolean;
  search?: string;
}

export interface ChiDoanDanhGiaPayload {
  xepLoai: string;
  chiDoanDanhGia?: string;
}

export interface DuyetXepLoaiPayload {
  doanKhoaDuyet: boolean;
  setDoanVienUuTu?: boolean;
}

export interface KhoiTaoDotPayload {
  namHoc: string;
  khoa?: string;
  lop?: string;
}

export interface TuDanhGiaPayload {
  namHoc: string;
  xepLoai: string;
  tuDanhGia?: string;
}

export const xepLoaiApi = {
  // Admin: Lấy danh sách bình bầu & phân loại đoàn viên có bộ lọc
  getAll: async (params?: XepLoaiQueryParams): Promise<XepLoaiListResponse> => {
    const response = await axiosClient.get<XepLoaiListResponse>('/XepLoai', { params });
    return response.data;
  },

  // Admin/Chi đoàn: Đánh giá & nhận xét của chi đoàn
  chiDoanDanhGia: async (id: number, payload: ChiDoanDanhGiaPayload): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/XepLoai/${id}/chi-doan-danh-gia`, payload);
    return response.data;
  },

  // Admin: Phê duyệt kết quả phân loại (tùy chọn xét Đoàn viên Ưu tú)
  duyet: async (id: number, payload: DuyetXepLoaiPayload): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.put<{ message: string; data: any }>(`/XepLoai/${id}/duyet`, payload);
    return response.data;
  },

  // Admin: Duyệt hàng loạt kết quả phân loại
  duyetHangLoat: async (payload: { ids: number[]; doanKhoaDuyet: boolean }): Promise<{ message: string; soLuong: number }> => {
    const response = await axiosClient.post<{ message: string; soLuong: number }>('/XepLoai/duyet-hang-loat', payload);
    return response.data;
  },

  // Admin: Khởi tạo đợt đánh giá cho năm học mới
  khoiTaoDot: async (
    payload: KhoiTaoDotPayload
  ): Promise<{ message: string; soLuongTaoMoi: number; soLuongBoQua: number; tongSinhVien: number }> => {
    const response = await axiosClient.post<{
      message: string;
      soLuongTaoMoi: number;
      soLuongBoQua: number;
      tongSinhVien: number;
    }>('/XepLoai/khoi-tao-dot', payload);
    return response.data;
  },

  // Admin: Xuất danh sách phân loại ra Excel
  exportExcel: async (params?: XepLoaiQueryParams): Promise<Blob> => {
    const response = await axiosClient.get('/XepLoai/export-excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Sinh viên: Xem lịch sử phân loại của chính mình
  getMe: async (): Promise<StudentXepLoaiResponse> => {
    const response = await axiosClient.get<StudentXepLoaiResponse>('/XepLoai/me');
    return response.data;
  },

  // Sinh viên: Tự đánh giá & nhận xét
  tuDanhGia: async (payload: TuDanhGiaPayload): Promise<{ message: string; data: any }> => {
    const response = await axiosClient.post<{ message: string; data: any }>('/XepLoai/tu-danh-gia', payload);
    return response.data;
  },
};
