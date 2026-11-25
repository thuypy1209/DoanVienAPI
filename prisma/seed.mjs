import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo & cập nhật dữ liệu mẫu nghiệp vụ Đoàn viên...');

  // Mật khẩu mã hóa BCrypt mặc định cho tất cả đoàn viên là: 123456
  const defaultPasswordHash = '$2a$11$jJnnUBAkMkouDqVOpVNBtenQLfh3dZYbObs7pcbWtKmKffzmuE08S';

  // 1. Danh sách đoàn viên mẫu với thông tin Đoàn chuyên sâu
  const defaultStudents = [
    {
      MSSV: '2280603134',
      HoTen: 'Trần Minh Khang',
      Lop: '22DTHC1',
      Khoa: 'CNTT',
      Email: 'minhkhang.tran@gmail.com',
      DiemRenLuyenTichLuy: 90,
      Password: defaultPasswordHash,
      ChucVuDoan: 'BiThu',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: true,
      NgayVaoDoan: new Date('2021-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Gia Định',
      SoDoanVien: 'DV-2280603134',
    },
    {
      MSSV: '2280602454',
      HoTen: 'Lê Hoàng Yến Nhi',
      Lop: '21DTHC1',
      Khoa: 'CNTT',
      Email: 'yennhi.le@gmail.com',
      DiemRenLuyenTichLuy: 95,
      Password: defaultPasswordHash,
      ChucVuDoan: 'PhoBiThu',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: true,
      NgayVaoDoan: new Date('2020-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Nguyễn Thị Minh Khai',
      SoDoanVien: 'DV-2280602454',
    },
    {
      MSSV: '2280604667',
      HoTen: 'Võ Quốc Huy',
      Lop: '22DTHC2',
      Khoa: 'QTKD',
      Email: 'quochuy.vo@gmail.com',
      DiemRenLuyenTichLuy: 70,
      Password: defaultPasswordHash,
      ChucVuDoan: 'UyVienBCH',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: false,
      NgayVaoDoan: new Date('2021-05-19'),
      NoiVaoDoan: 'Đoàn trường THPT Bùi Thị Xuân',
      SoDoanVien: 'DV-2280604667',
    },
    {
      MSSV: '2280602257',
      HoTen: 'Đặng Thùy Dương',
      Lop: '21DTHC2',
      Khoa: 'KTQT',
      Email: 'thuyduong.dang@gmail.com',
      DiemRenLuyenTichLuy: 80,
      Password: defaultPasswordHash,
      ChucVuDoan: 'DoanVien',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: false,
      NgayVaoDoan: new Date('2021-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Marie Curie',
      SoDoanVien: 'DV-2280602257',
    },
    {
      MSSV: '2280608853',
      HoTen: 'Nguyễn Gia Bảo',
      Lop: '21DBH02',
      Khoa: 'QTKD',
      Email: 'giabao.nguyen@gmail.com',
      DiemRenLuyenTichLuy: 75,
      Password: defaultPasswordHash,
      ChucVuDoan: 'DoanVien',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: false,
      NgayVaoDoan: new Date('2021-10-20'),
      NoiVaoDoan: 'Đoàn trường THPT Lê Hồng Phong',
      SoDoanVien: 'DV-2280608853',
    },
    {
      MSSV: '2280603135',
      HoTen: 'Phạm Trúc Mai',
      Lop: '22DTHC1',
      Khoa: 'CNTT',
      Email: 'trucmai.pham@gmail.com',
      DiemRenLuyenTichLuy: 85,
      Password: defaultPasswordHash,
      ChucVuDoan: 'DoanVien',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: true,
      NgayVaoDoan: new Date('2021-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Trần Phú',
      SoDoanVien: 'DV-2280603135',
    },
    {
      MSSV: '2280602445',
      HoTen: 'Bùi Anh Tuấn',
      Lop: '21DTHC1',
      Khoa: 'CNTT',
      Email: 'anhtuan.bui@gmail.com',
      DiemRenLuyenTichLuy: 65,
      Password: defaultPasswordHash,
      ChucVuDoan: 'DoanVien',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: false,
      NgayVaoDoan: new Date('2022-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Mạc Đĩnh Chi',
      SoDoanVien: 'DV-2280602445',
    },
    {
      MSSV: '2280604665',
      HoTen: 'Đỗ Thanh Thảo',
      Lop: '22DTHC2',
      Khoa: 'QTKD',
      Email: 'thanhthao.do@gmail.com',
      DiemRenLuyenTichLuy: 90,
      Password: defaultPasswordHash,
      ChucVuDoan: 'UyVienBCH',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: true,
      NgayVaoDoan: new Date('2021-03-26'),
      NoiVaoDoan: 'Đoàn trường THPT Hùng Vương',
      SoDoanVien: 'DV-2280604665',
    },
    {
      MSSV: '2380609124',
      HoTen: 'Hoàng Nhật Minh',
      Lop: '23DTHC3',
      Khoa: 'CNTT',
      Email: 'nhatminh.hoang@gmail.com',
      DiemRenLuyenTichLuy: 80,
      Password: defaultPasswordHash,
      ChucVuDoan: 'DoanVien',
      TrangThaiDoan: 'ChinhThuc',
      LaDoanVienUuTu: false,
      NgayVaoDoan: new Date('2022-05-19'),
      NoiVaoDoan: 'Đoàn trường THPT Nguyễn Hữu Huân',
      SoDoanVien: 'DV-2380609124',
    },
  ];

  for (const sv of defaultStudents) {
    const updated = await prisma.sinhViens.upsert({
      where: { MSSV: sv.MSSV },
      update: {
        HoTen: sv.HoTen,
        Lop: sv.Lop,
        Khoa: sv.Khoa,
        Email: sv.Email,
        DiemRenLuyenTichLuy: sv.DiemRenLuyenTichLuy,
        ChucVuDoan: sv.ChucVuDoan,
        TrangThaiDoan: sv.TrangThaiDoan,
        LaDoanVienUuTu: sv.LaDoanVienUuTu,
        NgayVaoDoan: sv.NgayVaoDoan,
        NoiVaoDoan: sv.NoiVaoDoan,
        SoDoanVien: sv.SoDoanVien,
      },
      create: sv,
    });
    console.log(`+ Cập nhật đoàn viên: ${sv.HoTen} (${sv.ChucVuDoan}) - MSSV: ${sv.MSSV}`);

    // Khởi tạo Sổ Đoàn (1-1)
    await prisma.soDoans.upsert({
      where: { SinhVienId: updated.Id },
      update: {},
      create: {
        SinhVienId: updated.Id,
        TrangThaiSoDoan: 'DaNop',
        NgayNop: new Date('2022-10-15'),
        ViTriLuuTru: `Tủ A - Ngăn Khoa ${sv.Khoa}`,
        GiayGioiThieuHe: true,
      },
    });

    // Khởi tạo Đoàn phí HK1 & HK2 2025-2026
    const dpCount = await prisma.doanPhis.count({ where: { SinhVienId: updated.Id } });
    if (dpCount === 0) {
      await prisma.doanPhis.createMany({
        data: [
          {
            SinhVienId: updated.Id,
            HocKy: 'HK1',
            NamHoc: '2025-2026',
            SoTien: 24000,
            TrangThai: 'DaNop',
            NgayNop: new Date('2025-10-01'),
            NguoiThu: 'Bí thư Chi đoàn',
          },
          {
            SinhVienId: updated.Id,
            HocKy: 'HK2',
            NamHoc: '2025-2026',
            SoTien: 24000,
            TrangThai: 'ChuaNop',
            NgayNop: null,
            NguoiThu: null,
          },
        ],
      });
    }

    // Khởi tạo Xếp loại Đoàn viên
    await prisma.xepLoaiDoanViens.upsert({
      where: {
        SinhVienId_NamHoc: {
          SinhVienId: updated.Id,
          NamHoc: '2024-2025',
        },
      },
      update: {},
      create: {
        SinhVienId: updated.Id,
        NamHoc: '2024-2025',
        XepLoai: sv.LaDoanVienUuTu ? 'XuatSac' : 'Kha',
        TuDanhGia: 'Hoàn thành tốt nhiệm vụ đoàn viên',
        ChiDoanDanhGia: 'Tích cực tham gia phong trào chi đoàn',
        DoanKhoaDuyet: true,
      },
    });
  }

  // 2. Khởi tạo Hoạt động mẫu phân loại theo Tiêu chí
  const defaultActivities = [
    {
      TenHoatDong: 'Hội thảo Kỹ năng mềm 4.0',
      MoTa: 'Trang bị kỹ năng giao tiếp và làm việc nhóm trong kỷ nguyên số.',
      ThoiGianBatDau: new Date('2026-05-01T08:00:00Z'),
      ThoiGianKetThuc: new Date('2026-05-01T11:30:00Z'),
      DiaDiem: 'Hội trường B - HUTECH',
      DiemCong: 40,
      TrangThai: 'DangDienRa',
      ImageUrl: '/uploads/activities/c1d09ff7-76e4-4e64-b8fa-b39b29e1dc64_kynangmem.jpg',
      LoaiHoatDong: 'HocThuat',
      SoLuongGioiHan: 150,
    },
    {
      TenHoatDong: 'Ngày Chủ Nhật Xanh',
      MoTa: 'Ra quân dọn dẹp vệ sinh khuôn viên trường và trồng cây xanh.',
      ThoiGianBatDau: new Date('2026-04-15T07:00:00Z'),
      ThoiGianKetThuc: new Date('2026-04-15T11:00:00Z'),
      DiaDiem: 'Sân trường',
      DiemCong: 40,
      TrangThai: 'DaKetThuc',
      ImageUrl: '/uploads/activities/8c72240a-8973-432c-99e6-203c14f589c4_hoatdongxahoi.jpg',
      LoaiHoatDong: 'TinhNguyen',
      SoLuongGioiHan: 200,
    },
    {
      TenHoatDong: 'Giải Bóng đá Sinh viên 2026',
      MoTa: 'Giải thể thao truyền thống chào mừng ngày thành lập Đoàn 26/3.',
      ThoiGianBatDau: new Date('2026-03-20T08:00:00Z'),
      ThoiGianKetThuc: new Date('2026-03-26T17:00:00Z'),
      DiaDiem: 'Sân bóng đá KTX',
      DiemCong: 40,
      TrangThai: 'DaKetThuc',
      ImageUrl: '/uploads/activities/d06a756e-7a53-43a8-9576-ac38bf15660a_bongda.jpg',
      LoaiHoatDong: 'VanTheMy',
      SoLuongGioiHan: 64,
    },
    {
      TenHoatDong: 'Tham quan Bảo tàng Hồ Chí Minh',
      MoTa: 'Hành trình về nguồn tìm hiểu lịch sử truyền thống cách mạng.',
      ThoiGianBatDau: new Date('2026-06-05T08:00:00Z'),
      ThoiGianKetThuc: new Date('2026-06-05T16:00:00Z'),
      DiaDiem: 'Bến Nhà Rồng',
      DiemCong: 60,
      TrangThai: 'SapDienRa',
      ImageUrl: '/uploads/activities/db9f1c2b-0789-482e-b35c-2e48c570a6b6_baotang.jpg',
      LoaiHoatDong: 'ChinhTriTuTuong',
      SoLuongGioiHan: 100,
    },
    {
      TenHoatDong: 'Giải Cầu Lông Thanh Niên 2026',
      MoTa: 'Giao lưu thể thao rèn luyện sức khỏe đoàn viên thanh niên.',
      ThoiGianBatDau: new Date('2026-05-15T08:00:00Z'),
      ThoiGianKetThuc: new Date('2026-05-15T17:00:00Z'),
      DiaDiem: 'Nhà thi đấu',
      DiemCong: 20,
      TrangThai: 'SapDienRa',
      ImageUrl: '',
      LoaiHoatDong: 'VanTheMy',
      SoLuongGioiHan: 50,
    },
  ];

  for (const hd of defaultActivities) {
    const existing = await prisma.hoatDongs.findFirst({
      where: { TenHoatDong: hd.TenHoatDong },
    });
    if (!existing) {
      await prisma.hoatDongs.create({ data: hd });
      console.log(`+ Đã thêm hoạt động: ${hd.TenHoatDong} (${hd.LoaiHoatDong})`);
    } else {
      await prisma.hoatDongs.update({
        where: { Id: existing.Id },
        data: {
          LoaiHoatDong: hd.LoaiHoatDong,
          SoLuongGioiHan: hd.SoLuongGioiHan,
        },
      });
    }
  }

  // 3. Khởi tạo tin nhắn Chat chào mừng
  const chatCount = await prisma.chatMessages.count();
  if (chatCount === 0) {
    await prisma.chatMessages.create({
      data: {
        User: 'Admin',
        Message: 'Chào mừng các bạn đoàn viên đến với hệ thống Quản lý Đoàn viên!',
        Timestamp: new Date(),
        IsRead: true,
      },
    });
    console.log('+ Đã thêm tin nhắn chào mừng');
  }

  console.log('✅ Khởi tạo và cập nhật dữ liệu mẫu nghiệp vụ Đoàn viên thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
