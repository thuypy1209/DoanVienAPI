import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SignalRProvider } from '../context/SignalRContext';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Đoàn Viên & Hoạt Động',
  description: 'Cổng thông tin đăng ký hoạt động phong trào, điểm danh QR và quản lý điểm rèn luyện',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>
        <AuthProvider>
          <SignalRProvider>
            {children}
          </SignalRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
