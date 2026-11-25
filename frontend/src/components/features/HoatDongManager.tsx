'use client';

import React, { useEffect, useState } from 'react';
import { hoatDongApi } from '../../api/hoatDongApi';
import type { HoatDong, DangKyHoatDong } from '../../types';
import {
  Plus,
  Trash2,
  QrCode,
  Search,
  CheckCircle,
  X,
  Eye,
  Edit,
  MapPin,
  Clock,
  Flag,
  Printer,
  Calendar,
  Image as ImageIcon,
  Check,
  Hourglass,
  User,
} from 'lucide-react';

export const HoatDongManager: React.FC = () => {
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SapDienRa' | 'DangDienRa' | 'DaKetThuc'>('ALL');
  const [loaiFilter, setLoaiFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal Tạo mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoatDong, setNewHoatDong] = useState({
    tenHoatDong: '',
    moTa: '',
    diaDiem: '',
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    diemCong: 5,
    imageUrl: '',
    trangThai: 'SapDienRa',
    loaiHoatDong: 'PhongTrao',
    soLuongGioiHan: 100,
  });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addPreviewUrl, setAddPreviewUrl] = useState<string>('');

  // Modal Chỉnh sửa (Edit)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHoatDong, setEditHoatDong] = useState<HoatDong | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>('');

  // Modal QR Code
  const [selectedQrActivity, setSelectedQrActivity] = useState<HoatDong | null>(null);

  // Modal Chi tiết hoạt động (Details) & Danh sách đăng ký
  const [detailsActivity, setDetailsActivity] = useState<HoatDong | null>(null);
  const [registrations, setRegistrations] = useState<DangKyHoatDong[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Quản lý trạng thái đang submit
  const [submitting, setSubmitting] = useState(false);

  const fetchHoatDongs = async () => {
    try {
      setLoading(true);
      const data = await hoatDongApi.getAll();
      setHoatDongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoatDongs();
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  // Convert for datetime-local input
  const toDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // 1. Tạo mới hoạt động
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let uploadedUrl = newHoatDong.imageUrl;

      if (addImageFile) {
        const uploadRes = await hoatDongApi.uploadImage(addImageFile);
        uploadedUrl = uploadRes.imageUrl;
      }

      await hoatDongApi.create({
        ...newHoatDong,
        imageUrl: uploadedUrl,
        diemCong: Number(newHoatDong.diemCong),
      });

      setShowAddModal(false);
      resetAddForm();
      await fetchHoatDongs();
      alert('Tạo mới hoạt động thành công!');
    } catch (err: any) {
      alert('Không thể tạo hoạt động: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setNewHoatDong({
      tenHoatDong: '',
      moTa: '',
      diaDiem: '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      diemCong: 5,
      imageUrl: '',
      trangThai: 'SapDienRa',
      loaiHoatDong: 'PhongTrao',
      soLuongGioiHan: 100,
    });
    setAddImageFile(null);
    setAddPreviewUrl('');
  };

  // 2. Chỉnh sửa hoạt động
  const openEditModal = (hd: HoatDong) => {
    setEditHoatDong({ ...hd });
    setEditImageFile(null);
    setEditPreviewUrl(hd.imageUrl ? (hd.imageUrl.startsWith('http') ? hd.imageUrl : hd.imageUrl) : '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHoatDong) return;

    try {
      setSubmitting(true);
      let currentImageUrl = editHoatDong.imageUrl;

      if (editImageFile) {
        const uploadRes = await hoatDongApi.uploadImage(editImageFile);
        currentImageUrl = uploadRes.imageUrl;
      }

      await hoatDongApi.update(editHoatDong.id, {
        ...editHoatDong,
        imageUrl: currentImageUrl,
        diemCong: Number(editHoatDong.diemCong),
      });

      setShowEditModal(false);
      setEditHoatDong(null);
      await fetchHoatDongs();
      alert('Cập nhật hoạt động thành công!');
    } catch (err: any) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Xóa hoạt động
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hoạt động này? Mọi lượt đăng ký liên quan cũng sẽ được xóa.')) return;
    try {
      await hoatDongApi.delete(id);
      setHoatDongs((prev) => prev.filter((h) => h.id !== id));
      alert('Đã xóa hoạt động thành công!');
    } catch (err: any) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // 4. Mở chi tiết (Details) & Danh sách đăng ký
  const handleOpenDetails = async (hd: HoatDong) => {
    setDetailsActivity(hd);
    try {
      setLoadingRegistrations(true);
      const data = await hoatDongApi.getDanhSachDangKy(hd.id);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // 5. Duyệt Check-in trực tiếp
  const handleCheckInAdmin = async (dangKyId: number) => {
    if (!window.confirm('Xác nhận sinh viên này đã tham gia hoạt động và cộng điểm?')) return;
    try {
      await hoatDongApi.checkInAdmin(dangKyId);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === dangKyId ? { ...r, trangThai: 'DaThamGia' } : r))
      );
      alert('Check-in thành công, đã cộng điểm cho sinh viên!');
    } catch (err: any) {
      alert('Lỗi duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  // In mã QR
  const handlePrintQr = () => {
    if (!selectedQrActivity) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const qrUrl = hoatDongApi.getQrCodeUrl(selectedQrActivity.id);
    printWindow.document.write(`
      <html>
        <head>
          <title>In Mã QR - ${selectedQrActivity.tenHoatDong}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
            .container { border: 2px dashed #000; border-radius: 20px; padding: 30px; display: inline-block; }
            h2 { margin: 0 0 10px 0; color: #1e3a8a; }
            p { margin: 5px 0; color: #555; }
            img { width: 300px; height: 300px; image-rendering: pixelated; margin: 20px 0; }
            .badge { display: inline-block; background: #f59e0b; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>ĐOÀN THANH NIÊN - HỘI SINH VIÊN</h2>
            <h3>MÃ QR ĐIỂM DANH HOẠT ĐỘNG</h3>
            <p><strong>Hoạt động:</strong> ${selectedQrActivity.tenHoatDong}</p>
            <p><strong>Địa điểm:</strong> ${selectedQrActivity.diaDiem || 'Chưa cập nhật'}</p>
            <p><span class="badge">+${selectedQrActivity.diemCong} Điểm Rèn Luyện</span></p>
            <img src="${qrUrl}" onload="window.print();" />
            <p style="font-size: 13px; color: #777;">Sinh viên dùng Ứng dụng Đoàn Viên trên điện thoại để quét mã này</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Lọc theo tìm kiếm, trạng thái và loại hoạt động
  const filteredHoatDongs = hoatDongs.filter((h) => {
    const matchSearch =
      h.tenHoatDong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.diaDiem?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || h.trangThai === statusFilter;
    const matchLoai = !loaiFilter || h.loaiHoatDong === loaiFilter;
    return matchSearch && matchStatus && matchLoai;
  });

  const renderLoaiHoatDongBadge = (loai?: string) => {
    switch (loai) {
      case 'TinhNguyen':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🌱 Tình nguyện</span>;
      case 'HocThuat':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">📚 Học thuật</span>;
      case 'VanTheMy':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">⚽ Văn thể mỹ</span>;
      case 'ChinhTriTuTuong':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">⭐ Chính trị</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">🎯 Phong trào</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER TRANG - Phù hợp với Views/Admin/HoatDong.cshtml */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            <span>Danh sách Hoạt động</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý phong trào đoàn hội, cập nhật thông tin, tạo mã QR và duyệt check-in
          </p>
        </div>

        <button
          onClick={() => {
            resetAddForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo mới hoạt động</span>
        </button>
      </div>

      {/* FILTER VÀ TÌM KIẾM */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search Input & Loại Hoạt Động */}
        <div className="flex items-center gap-2 max-w-lg w-full">
          <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 text-sm flex-1 focus-within:bg-white focus-within:border-blue-500 transition">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, địa điểm..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={loaiFilter}
            onChange={(e) => setLoaiFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="HocThuat">📚 Học thuật</option>
            <option value="TinhNguyen">🌱 Tình nguyện</option>
            <option value="VanTheMy">⚽ Văn thể mỹ</option>
            <option value="ChinhTriTuTuong">⭐ Chính trị</option>
            <option value="PhongTrao">🎯 Phong trào</option>
          </select>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({hoatDongs.length})
          </button>
          <button
            onClick={() => setStatusFilter('SapDienRa')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'SapDienRa'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>🟡 Sắp diễn ra</span>
          </button>
          <button
            onClick={() => setStatusFilter('DangDienRa')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'DangDienRa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>🟢 Đang diễn ra</span>
          </button>
          <button
            onClick={() => setStatusFilter('DaKetThuc')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
              statusFilter === 'DaKetThuc'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>⚫ Đã kết thúc</span>
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU HOẠT ĐỘNG (CHUẨN Views/Admin/HoatDong.cshtml) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2" />
            <p>Đang tải danh sách hoạt động...</p>
          </div>
        ) : filteredHoatDongs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold">Chưa có hoạt động nào được tạo hoặc không khớp kết quả tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 w-14">ID</th>
                  <th className="py-3.5 px-4">Tên hoạt động & Phân loại</th>
                  <th className="py-3.5 px-4">Thời gian & Địa điểm</th>
                  <th className="py-3.5 px-4 text-center">Suất Đăng Ký</th>
                  <th className="py-3.5 px-4 text-center">Điểm RL</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center w-52">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHoatDongs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-400 font-mono">
                      #{item.id}
                    </td>

                    {/* Tên & Loại hoạt động */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.tenHoatDong}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {renderLoaiHoatDongBadge(item.loaiHoatDong)}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span>{item.diaDiem || 'Chưa cập nhật'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{formatDate(item.thoiGianBatDau)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <Flag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(item.thoiGianKetThuc)}</span>
                      </div>
                    </td>

                    {/* Suất đăng ký */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block text-xs">
                        <div className="font-bold text-slate-800">
                          {item.soLuongDaDangKy || 0}
                          <span className="text-slate-400 font-normal">
                            {item.soLuongGioiHan ? ` / ${item.soLuongGioiHan}` : ' (Vô hạn)'}
                          </span>
                        </div>
                        {item.soLuongGioiHan && item.soLuongGioiHan > 0 && (
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 mx-auto overflow-hidden">
                            <div
                              className={`h-full rounded-full ${(item.soLuongDaDangKy || 0) >= item.soLuongGioiHan ? 'bg-rose-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(100, Math.round(((item.soLuongDaDangKy || 0) / item.soLuongGioiHan) * 100))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Điểm cộng */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-xs font-bold text-rose-600">
                        +{item.diemCong}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      {item.trangThai === 'SapDienRa' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                          Sắp diễn ra
                        </span>
                      ) : item.trangThai === 'DangDienRa' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Đang diễn ra
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                          Đã kết thúc
                        </span>
                      )}
                    </td>

                    {/* NHÓM NÚT TRÒN (btn-group rounded-pill) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 shadow-xs overflow-hidden">
                        {/* 1. Nút Xem chi tiết (Details) */}
                        <button
                          onClick={() => handleOpenDetails(item)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 transition border-r border-slate-100"
                          title="Xem chi tiết & danh sách sinh viên"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* 2. Nút Mã QR (QR Code) */}
                        <button
                          onClick={() => setSelectedQrActivity(item)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 transition border-r border-slate-100"
                          title="Mã QR điểm danh"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>

                        {/* 3. Nút Sửa (Edit) */}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 transition border-r border-slate-100"
                          title="Chỉnh sửa hoạt động"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* 4. Nút Xóa (Delete) */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa hoạt động"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: TẠO MỚI HOẠT ĐỘNG (CHUẨN Views/Admin/Create.cshtml) */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Tạo Hoạt động mới</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CỘT BÊN TRÁI */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Tên hoạt động *
                    </label>
                    <input
                      type="text"
                      required
                      value={newHoatDong.tenHoatDong}
                      onChange={(e) => setNewHoatDong({ ...newHoatDong, tenHoatDong: e.target.value })}
                      placeholder="Nhập tên hoạt động..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Địa điểm tổ chức *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={newHoatDong.diaDiem}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, diaDiem: e.target.value })}
                        placeholder="Ví dụ: Hội trường A, Sân trường..."
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      <span>Hình ảnh hoạt động</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setAddImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setAddPreviewUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setAddPreviewUrl('');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                    />

                    {/* Preview box */}
                    <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center">
                      {addPreviewUrl ? (
                        <img
                          src={addPreviewUrl}
                          alt="Preview"
                          className="h-32 w-full object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="py-6 text-slate-400 text-xs">
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                          <span>Xem trước hình ảnh (Khuyến khích tỉ lệ 16:9)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">
                        Bắt đầu *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newHoatDong.thoiGianBatDau}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, thoiGianBatDau: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-rose-700 mb-1">
                        Kết thúc *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newHoatDong.thoiGianKetThuc}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, thoiGianKetThuc: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CỘT BÊN PHẢI */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Loại hoạt động *
                      </label>
                      <select
                        value={newHoatDong.loaiHoatDong}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, loaiHoatDong: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="PhongTrao">🎯 Phong trào chung</option>
                        <option value="HocThuat">📚 Học thuật & NCKH</option>
                        <option value="TinhNguyen">🌱 Tình nguyện & Xã hội</option>
                        <option value="VanTheMy">⚽ Văn hóa - Thể thao</option>
                        <option value="ChinhTriTuTuong">⭐ Chính trị - Tư tưởng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Giới hạn số suất
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newHoatDong.soLuongGioiHan}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, soLuongGioiHan: Number(e.target.value) })}
                        placeholder="VD: 100 (0: vô hạn)"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Điểm cộng rèn luyện *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={newHoatDong.diemCong}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, diemCong: Number(e.target.value) })}
                        placeholder="Ví dụ: 5.0"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Trạng thái khởi tạo *
                      </label>
                      <select
                        value={newHoatDong.trangThai}
                        onChange={(e) => setNewHoatDong({ ...newHoatDong, trangThai: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="SapDienRa">🟡 Sắp diễn ra</option>
                        <option value="DangDienRa">🟢 Đang diễn ra</option>
                        <option value="DaKetThuc">⚫ Đã kết thúc</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Mô tả chi tiết hoạt động
                    </label>
                    <textarea
                      rows={6}
                      value={newHoatDong.moTa}
                      onChange={(e) => setNewHoatDong({ ...newHoatDong, moTa: e.target.value })}
                      placeholder="Viết mô tả chi tiết, kế hoạch, yêu cầu và quyền lợi khi đoàn viên tham gia..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Làm mới
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu hoạt động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CHỈNH SỬA HOẠT ĐỘNG (CHUẨN Views/Admin/Edit.cshtml) */}
      {/* ============================================================ */}
      {showEditModal && editHoatDong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Edit className="h-5 w-5 text-amber-500" />
                  <span>Chỉnh sửa Hoạt động</span>
                </h3>
                <p className="text-xs text-slate-500">Mã hoạt động: #{editHoatDong.id}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CỘT BÊN TRÁI */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Tên hoạt động *
                    </label>
                    <input
                      type="text"
                      required
                      value={editHoatDong.tenHoatDong}
                      onChange={(e) => setEditHoatDong({ ...editHoatDong, tenHoatDong: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Địa điểm tổ chức *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={editHoatDong.diaDiem || ''}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, diaDiem: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">
                        Bắt đầu
                      </label>
                      <input
                        type="datetime-local"
                        value={toDateTimeLocal(editHoatDong.thoiGianBatDau)}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, thoiGianBatDau: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-rose-700 mb-1">
                        Kết thúc
                      </label>
                      <input
                        type="datetime-local"
                        value={toDateTimeLocal(editHoatDong.thoiGianKetThuc)}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, thoiGianKetThuc: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Loại hoạt động
                      </label>
                      <select
                        value={editHoatDong.loaiHoatDong || 'PhongTrao'}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, loaiHoatDong: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="PhongTrao">🎯 Phong trào chung</option>
                        <option value="HocThuat">📚 Học thuật & NCKH</option>
                        <option value="TinhNguyen">🌱 Tình nguyện & Xã hội</option>
                        <option value="VanTheMy">⚽ Văn hóa - Thể thao</option>
                        <option value="ChinhTriTuTuong">⭐ Chính trị - Tư tưởng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Giới hạn số suất
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editHoatDong.soLuongGioiHan || ''}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, soLuongGioiHan: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="VD: 100 (để trống: vô hạn)"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Điểm rèn luyện
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editHoatDong.diemCong}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, diemCong: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={editHoatDong.trangThai || 'SapDienRa'}
                        onChange={(e) => setEditHoatDong({ ...editHoatDong, trangThai: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="SapDienRa">🟡 Sắp diễn ra</option>
                        <option value="DangDienRa">🟢 Đang diễn ra</option>
                        <option value="DaKetThuc">⚫ Đã kết thúc</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CỘT BÊN PHẢI (HÌNH ẢNH & MÔ TẢ) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      <span>Hình ảnh đại diện</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setEditPreviewUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                    />

                    {/* Preview box */}
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center relative overflow-hidden">
                      {editPreviewUrl ? (
                        <img
                          src={editPreviewUrl}
                          alt="Preview"
                          className="h-36 w-full object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="py-8 text-slate-400 text-xs">Chưa có ảnh đại diện</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Mô tả chi tiết hoạt động
                    </label>
                    <textarea
                      rows={5}
                      value={editHoatDong.moTa || ''}
                      onChange={(e) => setEditHoatDong({ ...editHoatDong, moTa: e.target.value })}
                      placeholder="Mô tả chi tiết nội dung hoạt động..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CHI TIẾT HOẠT ĐỘNG & CHECK-IN (Views/Admin/Details) */}
      {/* ============================================================ */}
      {detailsActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            {/* Header chi tiết */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="text-xs font-bold text-blue-600 mb-1">Hoạt động / Chi tiết</div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{detailsActivity.tenHoatDong}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    {formatDate(detailsActivity.thoiGianBatDau)}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {detailsActivity.diaDiem || 'Chưa cập nhật'}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700">
                    {registrations.length} sinh viên đăng ký
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDetailsActivity(null)}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 self-start sm:self-auto"
              >
                Quay lại
              </button>
            </div>

            {/* Bảng sinh viên đăng ký */}
            <div className="mt-5">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Danh sách sinh viên đăng ký tham gia</h4>

              {loadingRegistrations ? (
                <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách sinh viên...</div>
              ) : registrations.length === 0 ? (
                <div className="py-16 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50">
                  <User className="mx-auto h-10 w-10 text-slate-300 mb-1 stroke-[1.5]" />
                  <p className="text-xs font-medium">Chưa có sinh viên nào đăng ký hoạt động này.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="py-3 px-3">MSSV</th>
                        <th className="py-3 px-3">Họ tên</th>
                        <th className="py-3 px-3">Lớp</th>
                        <th className="py-3 px-3 text-center">Ngày đăng ký</th>
                        <th className="py-3 px-3 text-center">Trạng thái</th>
                        <th className="py-3 px-3 text-center w-32">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{reg.mssv}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                                {reg.hoTen ? reg.hoTen.charAt(0) : 'U'}
                              </div>
                              <span className="font-medium text-slate-800">{reg.hoTen}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">{reg.lop || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-center text-slate-400">
                            {formatDate(reg.ngayDangKy)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {reg.trangThai === 'DaThamGia' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-bold text-emerald-700 text-[11px]">
                                <Check className="h-3 w-3" />
                                Đã tham gia
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-bold text-amber-700 text-[11px]">
                                <Hourglass className="h-3 w-3" />
                                Chờ duyệt
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {reg.trangThai !== 'DaThamGia' ? (
                              <button
                                onClick={() => handleCheckInAdmin(reg.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 font-bold text-white shadow-xs hover:bg-emerald-700 transition text-[11px]"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Check-in</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Hoàn thành
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: MÃ QR ĐIỂM DANH (Views/Admin/HoatDong.cshtml qrModal) */}
      {/* ============================================================ */}
      {selectedQrActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden text-center">
            {/* Header đen chuẩn theme MVC */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-amber-400" />
                <span>Mã QR Điểm danh</span>
              </h4>
              <button
                onClick={() => setSelectedQrActivity(null)}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="inline-block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-3">
                <img
                  src={hoatDongApi.getQrCodeUrl(selectedQrActivity.id)}
                  alt="QR Code"
                  className="h-56 w-56 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <h4 className="text-base font-black text-blue-900 leading-tight">
                {selectedQrActivity.tenHoatDong}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Sinh viên dùng App Đoàn Viên để quét mã này
              </p>
            </div>

            {/* Footer nút in */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <button
                onClick={() => setSelectedQrActivity(null)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Đóng
              </button>
              <button
                onClick={handlePrintQr}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>In mã QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongManager;
