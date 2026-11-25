BEGIN TRY

BEGIN TRAN;

-- AlterTable SinhViens
ALTER TABLE [dbo].[SinhViens] ADD [ChucVuDoan] NVARCHAR(MAX) NOT NULL CONSTRAINT [DF__SinhViens__ChucV] DEFAULT N'DoanVien';
ALTER TABLE [dbo].[SinhViens] ADD [LaDoanVienUuTu] BIT NOT NULL CONSTRAINT [DF__SinhViens__LaDoa] DEFAULT 0;
ALTER TABLE [dbo].[SinhViens] ADD [NgayVaoDoan] DATETIME2 NULL;
ALTER TABLE [dbo].[SinhViens] ADD [NoiVaoDoan] NVARCHAR(MAX) NULL;
ALTER TABLE [dbo].[SinhViens] ADD [SoDoanVien] NVARCHAR(MAX) NULL;
ALTER TABLE [dbo].[SinhViens] ADD [TrangThaiDoan] NVARCHAR(MAX) NOT NULL CONSTRAINT [DF__SinhViens__Trang] DEFAULT N'ChinhThuc';

-- AlterTable HoatDongs
ALTER TABLE [dbo].[HoatDongs] ADD [LoaiHoatDong] NVARCHAR(MAX) NOT NULL CONSTRAINT [DF__HoatDongs__LoaiH] DEFAULT N'PhongTrao';
ALTER TABLE [dbo].[HoatDongs] ADD [SoLuongGioiHan] INT NULL;

-- CreateTable ChungNhans (if not exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChungNhans')
BEGIN
    CREATE TABLE [dbo].[ChungNhans] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [MaChungNhan] NVARCHAR(MAX) NOT NULL,
        [NgayCap] DATETIME2 NOT NULL,
        [SinhVienId] INT NOT NULL,
        [HoatDongId] INT NOT NULL,
        CONSTRAINT [PK_ChungNhans] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_ChungNhans_HoatDongs_HoatDongId] FOREIGN KEY ([HoatDongId]) REFERENCES [dbo].[HoatDongs] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ChungNhans_SinhViens_SinhVienId] FOREIGN KEY ([SinhVienId]) REFERENCES [dbo].[SinhViens] ([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_ChungNhans_HoatDongId] ON [dbo].[ChungNhans] ([HoatDongId]);
    CREATE NONCLUSTERED INDEX [IX_ChungNhans_SinhVienId] ON [dbo].[ChungNhans] ([SinhVienId]);
END;

-- CreateTable DoanPhis (if not exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DoanPhis')
BEGIN
    CREATE TABLE [dbo].[DoanPhis] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [SinhVienId] INT NOT NULL,
        [HocKy] NVARCHAR(MAX) NOT NULL,
        [NamHoc] NVARCHAR(MAX) NOT NULL,
        [SoTien] DECIMAL(18,2) NOT NULL,
        [TrangThai] NVARCHAR(MAX) NOT NULL,
        [NgayNop] DATETIME2 NULL,
        [NguoiThu] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_DoanPhis] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_DoanPhis_SinhViens_SinhVienId] FOREIGN KEY ([SinhVienId]) REFERENCES [dbo].[SinhViens] ([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_DoanPhis_SinhVienId] ON [dbo].[DoanPhis] ([SinhVienId]);
END;

-- CreateTable SoDoans (if not exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SoDoans')
BEGIN
    CREATE TABLE [dbo].[SoDoans] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [SinhVienId] INT NOT NULL,
        [TrangThaiSoDoan] NVARCHAR(MAX) NOT NULL,
        [NgayNop] DATETIME2 NULL,
        [ViTriLuuTru] NVARCHAR(MAX) NULL,
        [GiayGioiThieuHe] BIT NOT NULL,
        CONSTRAINT [PK_SoDoans] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_SoDoans_SinhViens_SinhVienId] FOREIGN KEY ([SinhVienId]) REFERENCES [dbo].[SinhViens] ([Id]) ON DELETE CASCADE
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SoDoans_SinhVienId] ON [dbo].[SoDoans] ([SinhVienId]);
END;

-- CreateTable XepLoaiDoanViens (if not exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'XepLoaiDoanViens')
BEGIN
    CREATE TABLE [dbo].[XepLoaiDoanViens] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [SinhVienId] INT NOT NULL,
        [NamHoc] NVARCHAR(450) NOT NULL,
        [XepLoai] NVARCHAR(MAX) NOT NULL,
        [TuDanhGia] NVARCHAR(MAX) NULL,
        [ChiDoanDanhGia] NVARCHAR(MAX) NULL,
        [DoanKhoaDuyet] BIT NOT NULL,
        CONSTRAINT [PK_XepLoaiDoanViens] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_XepLoaiDoanViens_SinhViens_SinhVienId] FOREIGN KEY ([SinhVienId]) REFERENCES [dbo].[SinhViens] ([Id]) ON DELETE CASCADE
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_XepLoaiDoanViens_SinhVienId_NamHoc] ON [dbo].[XepLoaiDoanViens] ([SinhVienId], [NamHoc]);
END;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
