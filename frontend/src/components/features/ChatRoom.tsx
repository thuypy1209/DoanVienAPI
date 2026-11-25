'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSignalR } from '../../hooks/useSignalR';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  MessageSquare,
  Radio,
  Shield,
  User,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';

export const ChatRoom: React.FC = () => {
  const { messages, connected, loadingHistory, sendMessage, clearBell, reloadHistory } = useSignalR();
  const { user, isAdmin } = useAuth();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Khi vào phòng chat, xóa chuông thông báo (đánh dấu đã đọc)
  useEffect(() => {
    clearBell();
  }, [clearBell]);

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới hoặc tải xong lịch sử
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingHistory]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !connected || sending) return;

    try {
      setSending(true);
      await sendMessage(inputText.trim());
      setInputText('');
    } catch (err: any) {
      alert(err.message || 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  // Kiểm tra tin nhắn có phải do mình gửi không
  const checkIsMe = (sender: string) => {
    if (!sender) return false;
    const s = sender.trim().toLowerCase();
    if (isAdmin) {
      return s === 'admin' || s === 'quản trị viên' || s === 'quan tri vien';
    }
    const myName = (user?.hoTen || '').toLowerCase();
    const myMssv = (user?.mssv || '').toLowerCase();
    return s === myName || s === myMssv;
  };

  const isSenderAdmin = (sender: string) => {
    if (!sender) return false;
    const s = sender.toLowerCase();
    return s.includes('admin') || s.includes('quản trị');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7.5rem)] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* HEADER PHÒNG CHAT - Chuẩn Views/Chat/Index.cshtml */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 text-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
              <span>Hỗ Trợ Sinh Viên & Đoàn Hội HUTECH</span>
            </h2>
            <p className="text-[11px] text-slate-300">
              Kênh trao đổi thời gian thực giữa Ban Chấp Hành và Đoàn viên
            </p>
          </div>
        </div>

        {/* Trạng thái kết nối & Nút thao tác */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => reloadHistory()}
            className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Tải lại lịch sử tin nhắn"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => clearBell()}
            className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Đánh dấu đã đọc"
          >
            <CheckCheck className="h-4 w-4" />
          </button>

          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              connected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <Radio className={`h-3 w-3 ${connected ? 'animate-pulse text-emerald-400' : 'text-rose-400'}`} />
            <span className="hidden sm:inline">{connected ? 'SignalR Đã kết nối' : 'Đang kết nối lại...'}</span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH TIN NHẮN (messagesList) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {loadingHistory ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2" />
            <p className="text-xs font-medium">Đang tải lịch sử tin nhắn từ máy chủ...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <MessageSquare className="h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-600">Chưa có tin nhắn nào trong lịch sử...</p>
            <p className="text-xs text-slate-400 mt-1">Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = checkIsMe(msg.user);
            const isAdminSender = isSenderAdmin(msg.user);

            return (
              <div
                key={msg.id || index}
                className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                    isAdminSender
                      ? 'bg-blue-600 text-white'
                      : isMe
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAdminSender ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                {/* Bong bóng tin nhắn */}
                <div className={`max-w-[80%] sm:max-w-md ${isMe ? 'text-right' : 'text-left'}`}>
                  {/* Tên người gửi */}
                  <div className="text-[11px] font-bold text-slate-500 mb-1 px-1 flex items-center gap-1.5 justify-start">
                    {isAdminSender ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span>{msg.user}</span>
                    )}
                  </div>

                  {/* Nội dung */}
                  <div
                    className={`inline-block rounded-2xl p-3 shadow-xs text-left ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>

                    {/* Thời gian */}
                    <div
                      className={`text-[10px] mt-1 text-right font-medium ${
                        isMe ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* FORM NHẬP TIN NHẮN (input-group) */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-xs overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
          {/* Badge người gửi ở bên trái */}
          <span className="bg-slate-100 border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-blue-700 shrink-0 flex items-center gap-1">
            {isAdmin ? (
              <>
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="max-w-[100px] truncate">{user?.hoTen || 'Tôi'}</span>
              </>
            )}
          </span>

          {/* Ô nhập tin nhắn */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={connected ? 'Nhập nội dung phản hồi...' : 'Đang kết nối lại máy chủ...'}
            disabled={!connected || sending}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:bg-slate-50"
          />

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={!connected || !inputText.trim() || sending}
            className="inline-flex items-center gap-1.5 bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-40 shrink-0"
          >
            <span>{sending ? 'Đang gửi...' : 'Gửi'}</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
