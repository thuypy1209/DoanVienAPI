'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../api/authApi';
import { Sparkles, User, Lock, Mail, GraduationCap, Building2, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    mssv: '',
    hoTen: '',
    password: '',
    confirmPassword: '',
    lop: '',
    khoa: '',
    email: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.mssv || !formData.hoTen || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không trùng khớp!');
      return;
    }

    try {
      setSubmitting(true);
      await authApi.register({
        mssv: formData.mssv.trim(),
        hoTen: formData.hoTen.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        lop: formData.lop.trim(),
        khoa: formData.khoa.trim(),
        email: formData.email.trim(),
      });

      setSuccess('Đăng ký tài khoản đoàn viên thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Đăng ký không thành công. Mã sinh viên có thể đã tồn tại trong hệ thống!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3 hover:scale-105 transition">
            <Sparkles className="h-7 w-7" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">ĐĂNG KÝ TÀI KHOẢN ĐOÀN VIÊN</h1>
          <p className="text-xs text-slate-300 mt-1">Gia nhập hệ thống để đăng ký hoạt động phong trào và tích lũy điểm rèn luyện</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mã Số Sinh Viên (MSSV) *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="mssv"
                    value={formData.mssv}
                    onChange={handleChange}
                    placeholder="Ví dụ: 20DTH12345"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  required
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Chi Đoàn / Lớp
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="lop"
                    value={formData.lop}
                    onChange={handleChange}
                    placeholder="Ví dụ: 20DTH01"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Khoa / Viện
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleChange}
                    placeholder="Ví dụ: Công nghệ thông tin"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sinhvien@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Nhập lại Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-60 mt-4 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>{submitting ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng Ký'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            Đã có tài khoản đoàn viên?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
