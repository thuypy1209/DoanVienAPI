import axiosClient from './axiosClient';
import type { HoatDong, DangKyHoatDong } from '../types';

export const hoatDongApi = {
  // Lấy danh sách hoạt động (Công khai / Sinh viên)
  getAll: async (): Promise<HoatDong[]> => {
    const response = await axiosClient.get<HoatDong[]>('/HoatDong');
    return response.data;
  },

  // Tạo hoạt động mới (Admin)
  create: async (data: Omit<HoatDong, 'id'>): Promise<HoatDong> => {
    const response = await axiosClient.post<HoatDong>('/HoatDong/them', data);
    return response.data;
  },

  // Cập nhật hoạt động (Admin)
  update: async (id: number, data: HoatDong): Promise<{ message: string }> => {
    const response = await axiosClient.put(`/HoatDong/${id}`, data);
    return response.data;
  },

  // Xóa hoạt động (Admin)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/HoatDong/${id}`);
    return response.data;
  },

  // Tải lên ảnh hoạt động (Admin)
  uploadImage: async (file: File): Promise<{ message: string; imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<{ message: string; imageUrl: string }>(
      '/HoatDong/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Sinh viên đăng ký hoạt động
  dangKy: async (hoatDongId: number): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/HoatDong/dangky/${hoatDongId}`);
    return response.data;
  },

  // Sinh viên xem lịch sử đăng ký của bản thân
  getLichSu: async (): Promise<DangKyHoatDong[]> => {
    const response = await axiosClient.get<DangKyHoatDong[]>('/HoatDong/lich-su');
    return response.data;
  },

  // Admin xem danh sách đăng ký theo hoạt động
  getDanhSachDangKy: async (hoatDongId: number): Promise<DangKyHoatDong[]> => {
    const response = await axiosClient.get<DangKyHoatDong[]>(`/HoatDong/${hoatDongId}/danhsach`);
    return response.data;
  },

  // Admin duyệt / Check-in và cộng điểm rèn luyện
  checkInAdmin: async (dangKyId: number): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/HoatDong/checkin/${dangKyId}`);
    return response.data;
  },

  // Sinh viên check-in trực tiếp qua mã hoạt động
  checkInByActivity: async (hoatDongId: number): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/HoatDong/checkin-by-activity/${hoatDongId}`);
    return response.data;
  },

  // URL ảnh QR Code để quét check-in
  getQrCodeUrl: (hoatDongId: number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    return `${baseUrl}/HoatDong/qr/${hoatDongId}`;
  },
};
