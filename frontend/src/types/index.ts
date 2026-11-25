export interface User {
  id?: number;
  mssv: string;
  hoTen: string;
  email?: string;
  lop?: string;
  khoa?: string;
  diemRenLuyenTichLuy?: number;
  avatarUrl?: string;
  role: 'Admin' | 'SinhVien';
  chucVuDoan?: string;
  trangThaiDoan?: string;
  laDoanVienUuTu?: boolean;
  ngayVaoDoan?: string;
  noiVaoDoan?: string;
  soDoanVien?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  role?: 'Admin' | 'SinhVien';
  hoTen?: string;
  mssv?: string;
  lop?: string;
}

export interface HoatDong {
  id: number;
  tenHoatDong: string;
  moTa?: string;
  diaDiem?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  diemCong: number;
  trangThai?: string;
  imageUrl?: string;
  soLuongGioiHan?: number;
  loaiHoatDong?: string;
  soLuongDaDangKy?: number;
}

export interface DangKyHoatDong {
  id: number;
  hoatDongId: number;
  sinhVienId?: number;
  ngayDangKy: string;
  trangThai: string;
  thoiGianCheckIn?: string;
  tenHoatDong?: string;
  diaDiem?: string;
  thoiGian?: string;
  diemCong?: number;
  imageUrl?: string;
  hoTen?: string;
  mssv?: string;
  lop?: string;
}

export interface ChatMessage {
  id?: number;
  user: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface DoanPhi {
  id: number;
  sinhVienId: number;
  mssv?: string;
  hoTen?: string;
  lop?: string;
  khoa?: string;
  chucVuDoan?: string;
  hocKy: string;
  namHoc: string;
  soTien: number;
  trangThai: 'ChuaNop' | 'DaNop';
  ngayNop?: string;
  nguoiThu?: string;
}

export interface DoanPhiStats {
  tongSo: number;
  soLuongDaNop: number;
  soLuongChuaNop: number;
  tongTienDaThu: number;
  tongTienChuaThu: number;
  tyLeHoanThanh: number;
}

export interface DoanPhiFilters {
  danhSachNamHoc: string[];
  danhSachHocKy: string[];
  danhSachKhoa: string[];
  danhSachLop: string[];
}

export interface DoanPhiListResponse {
  items: DoanPhi[];
  stats: DoanPhiStats;
  filters: DoanPhiFilters;
}

export interface StudentDoanPhiResponse {
  sinhVien: {
    mssv: string;
    hoTen: string;
    lop?: string;
    khoa?: string;
    chucVuDoan?: string;
    trangThaiDoan?: string;
    soDoanVien?: string;
  };
  summary: {
    tongDaNop: number;
    tongChuaNop: number;
    soKyDaNop: number;
    soKyChuaNop: number;
    daHoanTatTatCa: boolean;
  };
  records: Array<{
    id: number;
    hocKy: string;
    namHoc: string;
    soTien: number;
    trangThai: 'ChuaNop' | 'DaNop';
    ngayNop?: string;
    nguoiThu?: string;
  }>;
}

export interface SoDoan {
  id: number;
  sinhVienId: number;
  mssv?: string;
  hoTen?: string;
  lop?: string;
  khoa?: string;
  email?: string;
  chucVuDoan?: string;
  soDoanVien?: string;
  trangThaiSoDoan: 'DaNop' | 'ChuaNop' | 'DaRut';
  ngayNop?: string;
  viTriLuuTru?: string;
  giayGioiThieuHe: boolean;
}

export interface SoDoanStats {
  tongSo: number;
  soLuongDaNop: number;
  soLuongChuaNop: number;
  soLuongDaRut: number;
  soLuongGiayGioiThieuHe: number;
  tyLeNop: number;
}

export interface SoDoanFilters {
  danhSachKhoa: string[];
  danhSachLop: string[];
  danhSachViTri: string[];
}

export interface SoDoanListResponse {
  items: SoDoan[];
  stats: SoDoanStats;
  filters: SoDoanFilters;
}

export interface StudentSoDoanResponse {
  sinhVien: {
    mssv: string;
    hoTen: string;
    lop?: string;
    khoa?: string;
    chucVuDoan?: string;
    soDoanVien?: string;
    ngayVaoDoan?: string;
    noiVaoDoan?: string;
  };
  soDoan?: {
    id: number;
    trangThaiSoDoan: 'DaNop' | 'ChuaNop' | 'DaRut';
    ngayNop?: string;
    viTriLuuTru?: string;
    giayGioiThieuHe: boolean;
  };
  daNopSo: boolean;
}

export interface XepLoaiDoanVien {
  id: number;
  sinhVienId: number;
  mssv?: string;
  hoTen?: string;
  lop?: string;
  khoa?: string;
  chucVuDoan?: string;
  laDoanVienUuTu?: boolean;
  diemRenLuyenTichLuy?: number;
  namHoc: string;
  xepLoai: 'XuatSac' | 'Kha' | 'TrungBinh' | 'Yeu';
  tuDanhGia?: string;
  chiDoanDanhGia?: string;
  doanKhoaDuyet: boolean;
}

export interface XepLoaiStats {
  tongSo: number;
  soLuongXuatSac: number;
  soLuongKha: number;
  soLuongTrungBinh: number;
  soLuongYeu: number;
  soLuongDaDuyet: number;
  soLuongChoDuyet: number;
  soLuongUuTu: number;
  tyLeDuyet: number;
}

export interface XepLoaiFilters {
  danhSachNamHoc: string[];
  danhSachKhoa: string[];
  danhSachLop: string[];
}

export interface XepLoaiListResponse {
  items: XepLoaiDoanVien[];
  stats: XepLoaiStats;
  filters: XepLoaiFilters;
}

export interface StudentXepLoaiResponse {
  sinhVien: {
    mssv: string;
    hoTen: string;
    lop?: string;
    khoa?: string;
    chucVuDoan?: string;
    laDoanVienUuTu?: boolean;
    diemRenLuyenTichLuy?: number;
  };
  currentRating?: XepLoaiDoanVien;
  history: XepLoaiDoanVien[];
}

export interface ChungNhan {
  id: number;
  maChungNhan: string;
  ngayCap: string;
  sinhVienId: number;
  mssv?: string;
  hoTen?: string;
  lop?: string;
  khoa?: string;
  chucVuDoan?: string;
  hoatDongId: number;
  tenHoatDong?: string;
  loaiHoatDong?: string;
  diemCong?: number;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  diaDiem?: string;
  moTa?: string;
}

export interface ChungNhanStats {
  tongSo: number;
  soHoatDong: number;
  soSinhVien: number;
}

export interface ChungNhanFilters {
  danhSachHoatDong: Array<{ id: number; tenHoatDong: string }>;
  danhSachKhoa: string[];
  danhSachLop: string[];
}

export interface ChungNhanListResponse {
  items: ChungNhan[];
  stats: ChungNhanStats;
  filters: ChungNhanFilters;
}

export interface StudentChungNhanResponse {
  sinhVien: {
    mssv: string;
    hoTen: string;
    lop?: string;
    khoa?: string;
    chucVuDoan?: string;
    soDoanVien?: string;
  };
  tongChungNhan: number;
  items: ChungNhan[];
}

export interface VerifyCertificateResponse {
  valid: boolean;
  message: string;
  data?: {
    maChungNhan: string;
    ngayCap: string;
    hoTen: string;
    mssv: string;
    lop?: string;
    khoa?: string;
    chucVuDoan?: string;
    soDoanVien?: string;
    tenHoatDong: string;
    loaiHoatDong?: string;
    diemCong?: number;
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    diaDiem?: string;
    donViCap: string;
    nguoiKy: string;
  };
}
