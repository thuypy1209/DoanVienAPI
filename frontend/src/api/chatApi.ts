import axiosClient from './axiosClient';
import type { ChatMessage } from '../types';

export const chatApi = {
  // Lấy 100 tin nhắn lịch sử gần nhất
  getMessages: async (): Promise<ChatMessage[]> => {
    const response = await axiosClient.get<ChatMessage[]>('/Chat/messages');
    return response.data;
  },

  // Đánh dấu đã đọc tất cả tin nhắn
  markRead: async (): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/Chat/mark-read');
    return response.data;
  },

  // Lấy số lượng tin nhắn chưa đọc
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get<number>('/Chat/unread-count');
    return response.data;
  },
};
