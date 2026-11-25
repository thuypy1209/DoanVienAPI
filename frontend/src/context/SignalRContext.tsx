'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { chatApi } from '../api/chatApi';
import type { ChatMessage } from '../types';

export interface SignalRContextType {
  messages: ChatMessage[];
  bellCount: number;
  connected: boolean;
  loadingHistory: boolean;
  sendMessage: (messageText: string) => Promise<void>;
  clearBell: () => Promise<void>;
  reloadHistory: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bellCount, setBellCount] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || '/chathub';

  // 1. Tải lịch sử tin nhắn từ database khi khởi động
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingHistory(true);
      const history = await chatApi.getMessages();
      setMessages(history);
      const count = await chatApi.getUnreadCount();
      setBellCount(count);
    } catch (err) {
      console.warn('Lỗi tải lịch sử tin nhắn:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 2. Quản lý kết nối SignalR Hub duy nhất toàn ứng dụng
  useEffect(() => {
    if (!token) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
        setConnected(false);
      }
      return;
    }

    let isMounted = true;

    // Custom logger để lọc bỏ thông báo abort do StrictMode của React / Next.js
    const customLogger: signalR.ILogger = {
      log: (logLevel, message) => {
        if (
          message.includes('stopped during negotiation') ||
          message.includes('stopped by user') ||
          message.includes('The connection was stopped during negotiation')
        ) {
          return;
        }
        if (logLevel >= signalR.LogLevel.Error) {
          console.error(`[SignalR] ${message}`);
        } else if (logLevel >= signalR.LogLevel.Warning) {
          console.warn(`[SignalR] ${message}`);
        }
      },
    };

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(customLogger)
      .build();

    // Nhận tin nhắn Realtime
    connection.on('ReceiveMessage', (senderUser: string, messageText: string) => {
      if (!isMounted) return;
      const newMsg: ChatMessage = {
        user: senderUser,
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    // Cập nhật chuông thông báo
    connection.on('UpdateBellCount', () => {
      if (!isMounted) return;
      chatApi.getUnreadCount().then(setBellCount).catch(() => {
        setBellCount((prev) => prev + 1);
      });
    });

    connection
      .start()
      .then(() => {
        if (isMounted) {
          setConnected(true);
        }
      })
      .catch((err: any) => {
        const msg = String(err?.message || err || '');
        if (!isMounted || msg.includes('stopped during negotiation')) {
          // React StrictMode dọn dẹp và kết nối lại ngay sau đó -> Bỏ qua không ném console error
          return;
        }
        console.warn('SignalR Hub Connection error:', err);
        if (isMounted) {
          setConnected(false);
        }
      });

    connectionRef.current = connection;

    return () => {
      isMounted = false;
      if (
        connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting
      ) {
        connection.stop().catch(() => {});
      }
    };
  }, [token, hubUrl]);

  // 3. Gửi tin nhắn
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
        const sender = isAdmin ? 'Admin' : (user?.hoTen || user?.mssv || 'Sinh viên');
        await connectionRef.current.invoke('SendMessage', sender, messageText);
      } else {
        throw new Error('Chưa kết nối được đến máy chủ trò chuyện realtime!');
      }
    },
    [user, isAdmin]
  );

  // 4. Xóa chuông thông báo
  const clearBell = useCallback(async () => {
    try {
      await chatApi.markRead();
      setBellCount(0);
    } catch {
      setBellCount(0);
    }
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        messages,
        bellCount,
        connected,
        loadingHistory,
        sendMessage,
        clearBell,
        reloadHistory: fetchHistory,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};
