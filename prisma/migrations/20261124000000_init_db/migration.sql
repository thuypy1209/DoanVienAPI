BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[__EFMigrationsHistory] (
    [MigrationId] NVARCHAR(150) NOT NULL,
    [ProductVersion] NVARCHAR(32) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId])
);

-- CreateTable
CREATE TABLE [dbo].[ChatMessages] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [User] NVARCHAR(max) NOT NULL,
    [Message] NVARCHAR(max) NOT NULL,
    [Timestamp] DATETIME2 NOT NULL CONSTRAINT [ChatMessages_Timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [IsRead] BIT NOT NULL CONSTRAINT [ChatMessages_IsRead_df] DEFAULT 0,
    [Receiver] NVARCHAR(max),
    CONSTRAINT [ChatMessages_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[DangKyHoatDongs] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [SinhVienId] INT NOT NULL,
    [HoatDongId] INT NOT NULL,
    [NgayDangKy] DATETIME2 NOT NULL CONSTRAINT [DangKyHoatDongs_NgayDangKy_df] DEFAULT CURRENT_TIMESTAMP,
    [ThoiGianCheckIn] DATETIME2,
    [TrangThai] NVARCHAR(max) NOT NULL CONSTRAINT [DangKyHoatDongs_TrangThai_df] DEFAULT 'ChoDuyet',
    [MaChungNhan] NVARCHAR(max),
    [LinkTaiChungNhan] NVARCHAR(max),
    CONSTRAINT [DangKyHoatDongs_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[HoatDongs] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [TenHoatDong] NVARCHAR(max) NOT NULL,
    [MoTa] NVARCHAR(max) NOT NULL,
    [ThoiGianBatDau] DATETIME2 NOT NULL,
    [ThoiGianKetThuc] DATETIME2 NOT NULL,
    [DiaDiem] NVARCHAR(max) NOT NULL,
    [DiemCong] INT NOT NULL CONSTRAINT [HoatDongs_DiemCong_df] DEFAULT 0,
    [TrangThai] NVARCHAR(max) NOT NULL CONSTRAINT [HoatDongs_TrangThai_df] DEFAULT 'SapDienRa',
    [ImageUrl] NVARCHAR(max),
    CONSTRAINT [HoatDongs_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[SinhViens] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [MSSV] NVARCHAR(450) NOT NULL,
    [HoTen] NVARCHAR(max) NOT NULL,
    [Lop] NVARCHAR(max),
    [Khoa] NVARCHAR(max),
    [Email] NVARCHAR(max),
    [DiemRenLuyenTichLuy] INT NOT NULL CONSTRAINT [SinhViens_DiemRenLuyenTichLuy_df] DEFAULT 0,
    [Password] NVARCHAR(max) NOT NULL CONSTRAINT [SinhViens_Password_df] DEFAULT '',
    [AvatarUrl] NVARCHAR(max),
    CONSTRAINT [SinhViens_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [SinhViens_MSSV_key] UNIQUE NONCLUSTERED ([MSSV])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DangKyHoatDongs_HoatDongId_idx] ON [dbo].[DangKyHoatDongs]([HoatDongId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DangKyHoatDongs_SinhVienId_idx] ON [dbo].[DangKyHoatDongs]([SinhVienId]);

-- AddForeignKey
ALTER TABLE [dbo].[DangKyHoatDongs] ADD CONSTRAINT [DangKyHoatDongs_HoatDongId_fkey] FOREIGN KEY ([HoatDongId]) REFERENCES [dbo].[HoatDongs]([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DangKyHoatDongs] ADD CONSTRAINT [DangKyHoatDongs_SinhVienId_fkey] FOREIGN KEY ([SinhVienId]) REFERENCES [dbo].[SinhViens]([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
