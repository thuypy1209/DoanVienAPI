'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, User, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await login(username, password);
      if (res.role === 'Admin' || username === 'admin') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdmin = () => {
    setUsername('admin');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay về Trang Chủ</span>
          </Link>
          <br />
          <Link href="/" className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3 hover:scale-105 transition">
            <Sparkles className="h-8 w-8" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">HỆ THỐNG QUẢN LÝ ĐOÀN VIÊN</h1>
          <p className="text-sm text-slate-300 mt-1">Cổng thao tác nghiệp vụ & Đăng ký hoạt động</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Đăng Nhập</h2>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Tài khoản / MSSV
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập MSSV hoặc admin"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-70 mt-2 cursor-pointer"
            >
              {submitting ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Login test shortcut */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-2.5">Thao tác nhanh cho môi trường phát triển:</p>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Điền tài khoản Admin (admin / 123456)
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Chưa có tài khoản đoàn viên?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
