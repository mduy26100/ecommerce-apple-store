-- ====================================================================================================
-- URBAN STITCH - APPLE STORE E-COMMERCE PLATFORM
-- PRODUCTION SEED & INITIALIZATION SCRIPT (2022-2026 OFFICIAL LINEUP)
-- File: seed-data.sql
-- ====================================================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'AppleStoreDb')
BEGIN
    PRINT '[INIT] Tạo mới cơ sở dữ liệu AppleStoreDb...';
    CREATE DATABASE [AppleStoreDb];
END
GO

USE [AppleStoreDb];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
GO

-- ====================================================================================================
-- PHẦN 1: SCHEMA & MIGRATIONS HISTORY (IDEMPOTENT DDL)
-- ====================================================================================================
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    IF SCHEMA_ID(N'identity') IS NULL EXEC(N'CREATE SCHEMA [identity];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Token] nvarchar(256) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [IsRevoked] bit NOT NULL,
        [CreatedByIp] nvarchar(100) NULL,
        [RevokedByIp] nvarchar(100) NULL,
        [RevokedAt] datetime2 NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[Roles] (
        [Id] int NOT NULL IDENTITY,
        [Description] nvarchar(500) NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[Users] (
        [Id] int NOT NULL IDENTITY,
        [FirstName] nvarchar(100) NULL,
        [LastName] nvarchar(100) NULL,
        [AvatarUrl] nvarchar(500) NULL,
        [IsActive] bit NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[RoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] int NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_RoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RoleClaims_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [identity].[Roles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[UserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_UserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserClaims_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[UserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_UserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_UserLogins_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[UserRoles] (
        [UserId] int NOT NULL,
        [RoleId] int NOT NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [identity].[Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE TABLE [identity].[UserTokens] (
        [UserId] int NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_UserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_UserTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [identity].[RefreshTokens] ([Token]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [identity].[RefreshTokens] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [IX_RoleClaims_RoleId] ON [identity].[RoleClaims] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [identity].[Roles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [IX_UserClaims_UserId] ON [identity].[UserClaims] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [IX_UserLogins_UserId] ON [identity].[UserLogins] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [identity].[UserRoles] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [identity].[Users] ([NormalizedEmail]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [identity].[Users] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017152009_InitialIdentity'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261017152009_InitialIdentity', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    IF SCHEMA_ID(N'sales') IS NULL EXEC(N'CREATE SCHEMA [sales];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    IF SCHEMA_ID(N'catalog') IS NULL EXEC(N'CREATE SCHEMA [catalog];');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [sales].[Carts] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Status] varchar(20) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Carts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Carts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Slug] varchar(120) NOT NULL,
        [Description] nvarchar(500) NULL,
        [ImageUrl] nvarchar(500) NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[Colors] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Code] varchar(50) NOT NULL,
        [HexCode] varchar(7) NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Colors] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [sales].[Orders] (
        [Id] int NOT NULL IDENTITY,
        [OrderNumber] varchar(40) NOT NULL,
        [UserId] int NOT NULL,
        [Status] varchar(30) NOT NULL,
        [PaymentMethod] varchar(30) NOT NULL,
        [PaymentStatus] varchar(30) NOT NULL,
        [RecipientName] nvarchar(150) NOT NULL,
        [RecipientPhone] varchar(20) NOT NULL,
        [ShippingAddressLine] nvarchar(250) NOT NULL,
        [ShippingWard] nvarchar(100) NULL,
        [ShippingDistrict] nvarchar(100) NULL,
        [ShippingProvince] nvarchar(100) NOT NULL,
        [CustomerNote] nvarchar(500) NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        [ShippingFee] decimal(18,2) NOT NULL DEFAULT 0.0,
        [TotalAmount] decimal(18,2) NOT NULL,
        [PlacedAt] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[StorageOptions] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [CapacityValue] bigint NULL,
        [Unit] varchar(10) NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_StorageOptions] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[Products] (
        [Id] int NOT NULL IDENTITY,
        [CategoryId] int NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Slug] varchar(280) NOT NULL,
        [ModelCode] varchar(100) NULL,
        [ShortDescription] nvarchar(500) NULL,
        [Description] nvarchar(max) NULL,
        [WarrantyMonths] smallint NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [catalog].[Categories] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[ProductVariants] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [SKU] varchar(100) NOT NULL,
        [VariantName] nvarchar(200) NULL,
        [ColorId] int NULL,
        [StorageOptionId] int NULL,
        [Price] decimal(18,2) NOT NULL,
        [CompareAtPrice] decimal(18,2) NULL,
        [QuantityInStock] int NOT NULL DEFAULT 0,
        [RowVersion] rowversion NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductVariants] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductVariants_Colors_ColorId] FOREIGN KEY ([ColorId]) REFERENCES [catalog].[Colors] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_ProductVariants_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProductVariants_StorageOptions_StorageOptionId] FOREIGN KEY ([StorageOptionId]) REFERENCES [catalog].[StorageOptions] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [sales].[CartItems] (
        [Id] int NOT NULL IDENTITY,
        [CartId] int NOT NULL,
        [ProductVariantId] int NOT NULL,
        [Quantity] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_CartItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CartItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [sales].[Carts] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_CartItems_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [catalog].[ProductVariants] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [sales].[OrderItems] (
        [Id] int NOT NULL IDENTITY,
        [OrderId] int NOT NULL,
        [ProductVariantId] int NULL,
        [ProductName] nvarchar(250) NOT NULL,
        [SKU] varchar(100) NOT NULL,
        [ColorName] nvarchar(100) NULL,
        [StorageName] nvarchar(50) NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [Quantity] int NOT NULL,
        [LineTotal] decimal(18,2) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [sales].[Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [catalog].[ProductVariants] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[ProductSpecifications] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [ProductVariantId] int NULL,
        [GroupName] nvarchar(100) NULL,
        [Name] nvarchar(150) NOT NULL,
        [Value] nvarchar(1000) NOT NULL,
        [Unit] nvarchar(30) NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductSpecifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductSpecifications_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [catalog].[ProductVariants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProductSpecifications_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE TABLE [catalog].[VariantImages] (
        [Id] int NOT NULL IDENTITY,
        [ProductVariantId] int NOT NULL,
        [ImageUrl] nvarchar(1000) NOT NULL,
        [AltText] nvarchar(250) NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsPrimary] bit NOT NULL DEFAULT CAST(0 AS bit),
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_VariantImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_VariantImages_ProductVariants_ProductVariantId] FOREIGN KEY ([ProductVariantId]) REFERENCES [catalog].[ProductVariants] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CartItems_CartId_ProductVariantId] ON [sales].[CartItems] ([CartId], [ProductVariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_CartItems_ProductVariantId] ON [sales].[CartItems] ([ProductVariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Carts_UserId_Status] ON [sales].[Carts] ([UserId], [Status]) WHERE [Status] = ''Active''');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Slug] ON [catalog].[Categories] ([Slug]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Colors_Code] ON [catalog].[Colors] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [sales].[OrderItems] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_OrderItems_ProductVariantId] ON [sales].[OrderItems] ([ProductVariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [sales].[Orders] ([OrderNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId] ON [sales].[Orders] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [catalog].[Products] ([CategoryId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Products_Slug] ON [catalog].[Products] ([Slug]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_ProductSpecifications_ProductId] ON [catalog].[ProductSpecifications] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_ProductSpecifications_ProductVariantId] ON [catalog].[ProductSpecifications] ([ProductVariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_ProductVariants_ColorId] ON [catalog].[ProductVariants] ([ColorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_ProductVariants_ProductId] ON [catalog].[ProductVariants] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProductVariants_SKU] ON [catalog].[ProductVariants] ([SKU]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_ProductVariants_StorageOptionId] ON [catalog].[ProductVariants] ([StorageOptionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    CREATE INDEX [IX_VariantImages_ProductVariantId] ON [catalog].[VariantImages] ([ProductVariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_VariantImages_ProductVariantId_IsPrimary] ON [catalog].[VariantImages] ([ProductVariantId], [IsPrimary]) WHERE [IsPrimary] = 1');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261017155423_AddCatalogAndSalesModules'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261017155423_AddCatalogAndSalesModules', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    ALTER TABLE [catalog].[ProductVariants] DROP CONSTRAINT [FK_ProductVariants_Colors_ColorId];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    ALTER TABLE [catalog].[ProductVariants] DROP CONSTRAINT [FK_ProductVariants_StorageOptions_StorageOptionId];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    DROP INDEX [IX_VariantImages_ProductVariantId_IsPrimary] ON [catalog].[VariantImages];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE TABLE [catalog].[ProductOptions] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductOptions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductOptions_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE TABLE [catalog].[ProductOptionValues] (
        [Id] int NOT NULL IDENTITY,
        [OptionId] int NOT NULL,
        [Value] nvarchar(150) NOT NULL,
        [ColorHexCode] nvarchar(50) NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductOptionValues] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductOptionValues_ProductOptions_OptionId] FOREIGN KEY ([OptionId]) REFERENCES [catalog].[ProductOptions] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE TABLE [catalog].[ProductVariantValues] (
        [VariantId] int NOT NULL,
        [OptionValueId] int NOT NULL,
        CONSTRAINT [PK_ProductVariantValues] PRIMARY KEY ([VariantId], [OptionValueId]),
        CONSTRAINT [FK_ProductVariantValues_ProductOptionValues_OptionValueId] FOREIGN KEY ([OptionValueId]) REFERENCES [catalog].[ProductOptionValues] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProductVariantValues_ProductVariants_VariantId] FOREIGN KEY ([VariantId]) REFERENCES [catalog].[ProductVariants] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_VariantImages_ProductVariantId_IsPrimary] ON [catalog].[VariantImages] ([ProductVariantId], [IsPrimary]) WHERE [IsPrimary] = 1 AND [IsDeleted] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE INDEX [IX_ProductOptions_ProductId] ON [catalog].[ProductOptions] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE INDEX [IX_ProductOptionValues_OptionId] ON [catalog].[ProductOptionValues] ([OptionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE INDEX [IX_ProductVariantValues_OptionValueId] ON [catalog].[ProductVariantValues] ([OptionValueId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    CREATE INDEX [IX_ProductVariantValues_VariantId] ON [catalog].[ProductVariantValues] ([VariantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    ALTER TABLE [catalog].[ProductVariants] ADD CONSTRAINT [FK_ProductVariants_Colors_ColorId] FOREIGN KEY ([ColorId]) REFERENCES [catalog].[Colors] ([Id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    ALTER TABLE [catalog].[ProductVariants] ADD CONSTRAINT [FK_ProductVariants_StorageOptions_StorageOptionId] FOREIGN KEY ([StorageOptionId]) REFERENCES [catalog].[StorageOptions] ([Id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022093919_AddDynamicProductOptions'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261022093919_AddDynamicProductOptions', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN
    CREATE TABLE [catalog].[ProductImages] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [OptionValueId] int NULL,
        [ImageUrl] nvarchar(1000) NOT NULL,
        [AltText] nvarchar(250) NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsPrimary] bit NOT NULL DEFAULT CAST(0 AS bit),
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductImages_ProductOptionValues_OptionValueId] FOREIGN KEY ([OptionValueId]) REFERENCES [catalog].[ProductOptionValues] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN
    CREATE INDEX [IX_ProductImages_OptionValueId] ON [catalog].[ProductImages] ([OptionValueId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN
    CREATE INDEX [IX_ProductImages_ProductId] ON [catalog].[ProductImages] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN

                    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VariantImages' AND schema_id = SCHEMA_ID('catalog'))
                    BEGIN
                        INSERT INTO [catalog].[ProductImages] 
                            ([ProductId], [OptionValueId], [ImageUrl], [AltText], [DisplayOrder], [IsPrimary], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy])
                        SELECT DISTINCT
                            v.[ProductId],
                            ov.[Id] AS [OptionValueId],
                            vi.[ImageUrl],
                            vi.[AltText],
                            vi.[DisplayOrder],
                            vi.[IsPrimary],
                            vi.[IsActive],
                            vi.[CreatedOn],
                            vi.[CreatedBy],
                            vi.[LastModifiedOn],
                            vi.[LastModifiedBy],
                            vi.[IsDeleted],
                            vi.[DeletedOn],
                            vi.[DeletedBy]
                        FROM [catalog].[VariantImages] vi
                        JOIN [catalog].[ProductVariants] v ON vi.[ProductVariantId] = v.[Id]
                        LEFT JOIN (
                            SELECT pvv.[VariantId], pov.[Id]
                            FROM [catalog].[ProductVariantValues] pvv
                            JOIN [catalog].[ProductOptionValues] pov ON pvv.[OptionValueId] = pov.[Id]
                            JOIN [catalog].[ProductOptions] po ON pov.[OptionId] = po.[Id]
                            WHERE po.[Name] LIKE N'%Màu%' OR po.[Name] LIKE N'%Color%'
                        ) ov ON v.[Id] = ov.[VariantId];
                    END
                
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN
    DROP TABLE [catalog].[VariantImages];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261022101810_MoveImagesToProductAndColor'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261022101810_MoveImagesToProductAndColor', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [FK_ProductSpecifications_ProductVariants_ProductVariantId];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [FK_ProductSpecifications_Products_ProductId];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    DROP INDEX [IX_ProductSpecifications_ProductVariantId] ON [catalog].[ProductSpecifications];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[catalog].[ProductSpecifications]') AND [c].[name] = N'GroupName');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [catalog].[ProductSpecifications] DROP COLUMN [GroupName];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[catalog].[ProductSpecifications]') AND [c].[name] = N'ProductVariantId');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [catalog].[ProductSpecifications] DROP COLUMN [ProductVariantId];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    EXEC sp_rename N'[catalog].[ProductSpecifications].[ProductId]', N'GroupId', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    EXEC sp_rename N'[catalog].[ProductSpecifications].[IX_ProductSpecifications_ProductId]', N'IX_ProductSpecifications_GroupId', N'INDEX';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    CREATE TABLE [catalog].[ProductSpecificationGroups] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] int NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [DisplayOrder] int NOT NULL DEFAULT 0,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_ProductSpecificationGroups] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductSpecificationGroups_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    CREATE INDEX [IX_ProductSpecificationGroups_ProductId] ON [catalog].[ProductSpecificationGroups] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] ADD CONSTRAINT [FK_ProductSpecifications_ProductSpecificationGroups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [catalog].[ProductSpecificationGroups] ([Id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023110738_AddProductSpecificationGroups'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261023110738_AddProductSpecificationGroups', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    DROP INDEX [IX_Carts_UserId_Status] ON [sales].[Carts];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    DROP INDEX [IX_CartItems_CartId_ProductVariantId] ON [sales].[CartItems];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[sales].[Carts]') AND [c].[name] = N'Status');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [sales].[Carts] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [sales].[Carts] DROP COLUMN [Status];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[catalog].[ProductImages]') AND [c].[name] = N'ImageUrl');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [catalog].[ProductImages] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [catalog].[ProductImages] ALTER COLUMN [ImageUrl] nvarchar(1000) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    DECLARE @var4 sysname;
    SELECT @var4 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[sales].[Carts]') AND [c].[name] = N'UserId');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [sales].[Carts] DROP CONSTRAINT [' + @var4 + '];');
    ALTER TABLE [sales].[Carts] ALTER COLUMN [UserId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    ALTER TABLE [sales].[Carts] ADD [ExpiresOn] datetimeoffset NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    ALTER TABLE [sales].[Carts] ADD [GuestId] varchar(100) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    ALTER TABLE [sales].[CartItems] ADD [IsSelected] bit NOT NULL DEFAULT CAST(1 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    ALTER TABLE [sales].[CartItems] ADD [UnitPrice] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Carts_GuestId] ON [sales].[Carts] ([GuestId]) WHERE [GuestId] IS NOT NULL AND [IsDeleted] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Carts_UserId] ON [sales].[Carts] ([UserId]) WHERE [UserId] IS NOT NULL AND [IsDeleted] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_CartItems_CartId_ProductVariantId] ON [sales].[CartItems] ([CartId], [ProductVariantId]) WHERE [IsDeleted] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[CartItems] ADD CONSTRAINT [CK_CartItems_Quantity] CHECK ([Quantity] > 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026041941_OptimizeCartAndSupportGuestCart'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261026041941_OptimizeCartAndSupportGuestCart', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [catalog].[ProductVariants] ADD [CostPrice] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    DECLARE @var5 sysname;
    SELECT @var5 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[sales].[Orders]') AND [c].[name] = N'UserId');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [sales].[Orders] DROP CONSTRAINT [' + @var5 + '];');
    ALTER TABLE [sales].[Orders] ALTER COLUMN [UserId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    DECLARE @var6 sysname;
    SELECT @var6 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[sales].[Orders]') AND [c].[name] = N'PlacedAt');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [sales].[Orders] DROP CONSTRAINT [' + @var6 + '];');
    ALTER TABLE [sales].[Orders] ALTER COLUMN [PlacedAt] datetimeoffset NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [DiscountAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [GuestId] varchar(100) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [RecipientEmail] varchar(150) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [RowVersion] rowversion NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [VoucherCode] varchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [VoucherId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[OrderItems] ADD [CostPrice] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[OrderItems] ADD [SelectedAttributesJson] nvarchar(1000) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[OrderItems] ADD [ThumbnailUrl] nvarchar(500) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[OrderItems] ADD [VariantName] nvarchar(250) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE TABLE [sales].[Vouchers] (
        [Id] int NOT NULL IDENTITY,
        [Code] varchar(50) NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [Description] nvarchar(500) NULL,
        [DiscountType] varchar(30) NOT NULL,
        [DiscountValue] decimal(18,2) NOT NULL,
        [MinOrderAmount] decimal(18,2) NULL,
        [MaxDiscountAmount] decimal(18,2) NULL,
        [StartDate] datetimeoffset NOT NULL,
        [EndDate] datetimeoffset NOT NULL,
        [UsageLimit] int NULL,
        [UsageCount] int NOT NULL DEFAULT 0,
        [PerUserLimit] int NOT NULL DEFAULT 1,
        [RowVersion] rowversion NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Vouchers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Vouchers_DiscountValue] CHECK ([DiscountValue] > 0),
        CONSTRAINT [CK_Vouchers_PerUserLimit] CHECK ([PerUserLimit] > 0),
        CONSTRAINT [CK_Vouchers_UsageCount] CHECK ([UsageCount] >= 0)
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE TABLE [sales].[VoucherUsages] (
        [Id] int NOT NULL IDENTITY,
        [VoucherId] int NOT NULL,
        [OrderId] int NOT NULL,
        [UserId] int NULL,
        [GuestId] varchar(100) NULL,
        [CustomerPhone] varchar(20) NULL,
        [CustomerEmail] varchar(150) NULL,
        [DiscountAmount] decimal(18,2) NOT NULL,
        [UsedAt] datetimeoffset NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_VoucherUsages] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_VoucherUsages_DiscountAmount] CHECK ([DiscountAmount] >= 0),
        CONSTRAINT [FK_VoucherUsages_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [sales].[Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_VoucherUsages_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VoucherUsages_Vouchers_VoucherId] FOREIGN KEY ([VoucherId]) REFERENCES [sales].[Vouchers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_Orders_GuestId] ON [sales].[Orders] ([GuestId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_Orders_VoucherId] ON [sales].[Orders] ([VoucherId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[Orders] ADD CONSTRAINT [CK_Orders_DiscountAmount] CHECK ([DiscountAmount] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[Orders] ADD CONSTRAINT [CK_Orders_ShippingFee] CHECK ([ShippingFee] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[Orders] ADD CONSTRAINT [CK_Orders_Subtotal] CHECK ([Subtotal] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[Orders] ADD CONSTRAINT [CK_Orders_TotalAmount] CHECK ([TotalAmount] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[OrderItems] ADD CONSTRAINT [CK_OrderItems_CostPrice] CHECK ([CostPrice] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[OrderItems] ADD CONSTRAINT [CK_OrderItems_LineTotal] CHECK ([LineTotal] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[OrderItems] ADD CONSTRAINT [CK_OrderItems_Quantity] CHECK ([Quantity] > 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    EXEC(N'ALTER TABLE [sales].[OrderItems] ADD CONSTRAINT [CK_OrderItems_UnitPrice] CHECK ([UnitPrice] >= 0)');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Vouchers_Code] ON [sales].[Vouchers] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_Vouchers_EndDate] ON [sales].[Vouchers] ([EndDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_Vouchers_StartDate] ON [sales].[Vouchers] ([StartDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_VoucherUsages_GuestId] ON [sales].[VoucherUsages] ([GuestId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_VoucherUsages_OrderId] ON [sales].[VoucherUsages] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_VoucherUsages_UserId] ON [sales].[VoucherUsages] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    CREATE INDEX [IX_VoucherUsages_VoucherId] ON [sales].[VoucherUsages] ([VoucherId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD CONSTRAINT [FK_Orders_Vouchers_VoucherId] FOREIGN KEY ([VoucherId]) REFERENCES [sales].[Vouchers] ([Id]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026073559_EnhanceOrdersAndAddVouchers'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261026073559_EnhanceOrdersAndAddVouchers', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    ALTER TABLE [sales].[Vouchers] ADD [TargetType] varchar(30) NOT NULL DEFAULT '';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    CREATE TABLE [sales].[UserVouchers] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [VoucherId] int NOT NULL,
        [AssignedUsageLimit] int NOT NULL DEFAULT 1,
        [UsedCount] int NOT NULL DEFAULT 0,
        [AssignedAt] datetimeoffset NOT NULL,
        [ExpiresAt] datetimeoffset NULL,
        [AssignedBy] nvarchar(150) NULL,
        [Note] nvarchar(250) NULL,
        [IsActive] bit NOT NULL,
        [CreatedOn] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [LastModifiedOn] datetimeoffset NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedOn] datetimeoffset NULL,
        [DeletedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_UserVouchers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_UserVouchers_AssignedUsageLimit] CHECK ([AssignedUsageLimit] > 0),
        CONSTRAINT [CK_UserVouchers_UsedCount] CHECK ([UsedCount] >= 0),
        CONSTRAINT [FK_UserVouchers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserVouchers_Vouchers_VoucherId] FOREIGN KEY ([VoucherId]) REFERENCES [sales].[Vouchers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    CREATE INDEX [IX_Vouchers_TargetType] ON [sales].[Vouchers] ([TargetType]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    CREATE INDEX [IX_UserVouchers_ExpiresAt] ON [sales].[UserVouchers] ([ExpiresAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    CREATE INDEX [IX_UserVouchers_UserId] ON [sales].[UserVouchers] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_UserVouchers_UserId_VoucherId] ON [sales].[UserVouchers] ([UserId], [VoucherId]) WHERE [IsDeleted] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    CREATE INDEX [IX_UserVouchers_VoucherId] ON [sales].[UserVouchers] ([VoucherId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026074746_AddUserVouchersAndTargetType'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261026074746_AddUserVouchersAndTargetType', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026094234_AddOrderStatusCompletedAndHistoryJson'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [StatusHistoryJson] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026094234_AddOrderStatusCompletedAndHistoryJson'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261026094234_AddOrderStatusCompletedAndHistoryJson', N'8.0.32');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026103150_AddOrderShippingAddressUpdateCount'
)
BEGIN
    ALTER TABLE [sales].[Orders] ADD [ShippingAddressUpdateCount] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261026103150_AddOrderShippingAddressUpdateCount'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261026103150_AddOrderShippingAddressUpdateCount', N'8.0.32');
END;
GO

COMMIT;
GO



GO

-- ====================================================================================================
-- PHẦN 2: PRODUCTION SEED DATA (IDEMPOTENT DML)
-- ====================================================================================================

IF NOT EXISTS (SELECT 1 FROM [catalog].[Products])
BEGIN
    PRINT '[INFO] [SEED] Bắt đầu nạp toàn bộ danh mục sản phẩm, biến thể, thông số, voucher và đơn hàng 2026...';

    EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";
    ALTER TABLE [catalog].[ProductImages] ALTER COLUMN [ImageUrl] nvarchar(1000) NULL;

    DELETE FROM [sales].[VoucherUsages];
    DELETE FROM [sales].[UserVouchers];
    DELETE FROM [sales].[OrderItems];
    DELETE FROM [sales].[Orders];
    DELETE FROM [sales].[CartItems];
    DELETE FROM [sales].[Carts];
    DELETE FROM [sales].[Vouchers];
    DELETE FROM [catalog].[ProductImages];
    DELETE FROM [catalog].[ProductSpecifications];
    DELETE FROM [catalog].[ProductSpecificationGroups];
    DELETE FROM [catalog].[ProductVariantValues];
    DELETE FROM [catalog].[ProductVariants];
    DELETE FROM [catalog].[ProductOptionValues];
    DELETE FROM [catalog].[ProductOptions];
    DELETE FROM [catalog].[Products];
    DELETE FROM [catalog].[StorageOptions];
    DELETE FROM [catalog].[Colors];
    DELETE FROM [catalog].[Categories];
    DELETE FROM [identity].[UserTokens];
    DELETE FROM [identity].[UserRoles];
    DELETE FROM [identity].[UserLogins];
    DELETE FROM [identity].[UserClaims];
    DELETE FROM [identity].[RoleClaims];
    DELETE FROM [identity].[RefreshTokens];
    DELETE FROM [identity].[Users];
    DELETE FROM [identity].[Roles];

    -- 1. ROLES
SET IDENTITY_INSERT [identity].[Roles] ON;
INSERT INTO [identity].[Roles] ([Id], [Description], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES
(1, N'SuperAdmin', N'SuperAdmin', N'SUPERADMIN', NULL),
(2, N'User', N'User', N'USER', NULL);
SET IDENTITY_INSERT [identity].[Roles] OFF;

    -- 2. USERS
SET IDENTITY_INSERT [identity].[Users] ON;
INSERT INTO [identity].[Users] ([Id], [FirstName], [LastName], [AvatarUrl], [IsActive], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES
(1001, N'Quản trị viên', N'Apple', NULL, 1, N'admin@apple-store.com', N'ADMIN@APPLE-STORE.COM', N'admin@apple-store.com', N'ADMIN@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAECA3GT7TbjWlZSpuIbtQ916TsuEG6JULJf+9kkLaygtciSNk1TOg+V2Z2YqcRZ+euQ==', N'MMGCPFNL6254RVICZV3QHQ6BHS5KH637', N'60217900-fe85-4e6f-8585-3549131f2afc', N'0988889999', 1, 0, NULL, 1, 0),
(1002, N'Khách hàng', N'Apple VIP', NULL, 1, N'user@apple-store.com', N'USER@APPLE-STORE.COM', N'user@apple-store.com', N'USER@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAEM9zrW3M709L783PoesMbGzW3KFm3VBnzUd5ybBLSprmcYUa3EJOJVZVUqLO0O3cZg==', N'DCSAPYMF247W6MUVZP5FR2QGCQ53EBID', N'75f9cade-e5c9-47ff-801d-c7d73f56a749', N'0912345678', 1, 0, NULL, 1, 0),
(1003, N'Hoàng Nam', N'Trần', NULL, 1, N'hoang.nam@apple-store.com', N'HOANG.NAM@APPLE-STORE.COM', N'hoang.nam@apple-store.com', N'HOANG.NAM@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAEM9zrW3M709L783PoesMbGzW3KFm3VBnzUd5ybBLSprmcYUa3EJOJVZVUqLO0O3cZg==', N'SECSTAMP1003', N'CONCUR1003', N'0903112233', 1, 0, NULL, 1, 0),
(1004, N'Thu Trang', N'Nguyễn', NULL, 1, N'thu.trang@apple-store.com', N'THU.TRANG@APPLE-STORE.COM', N'thu.trang@apple-store.com', N'THU.TRANG@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAEM9zrW3M709L783PoesMbGzW3KFm3VBnzUd5ybBLSprmcYUa3EJOJVZVUqLO0O3cZg==', N'SECSTAMP1004', N'CONCUR1004', N'0938445566', 1, 0, NULL, 1, 0),
(1005, N'Quốc Bảo', N'Lê', NULL, 1, N'quoc.bao@apple-store.com', N'QUOC.BAO@APPLE-STORE.COM', N'quoc.bao@apple-store.com', N'QUOC.BAO@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAEM9zrW3M709L783PoesMbGzW3KFm3VBnzUd5ybBLSprmcYUa3EJOJVZVUqLO0O3cZg==', N'SECSTAMP1005', N'CONCUR1005', N'0977889900', 1, 0, NULL, 1, 0),
(1006, N'Khánh Linh', N'Vũ', NULL, 1, N'khanh.linh@apple-store.com', N'KHANH.LINH@APPLE-STORE.COM', N'khanh.linh@apple-store.com', N'KHANH.LINH@APPLE-STORE.COM', 1, N'AQAAAAIAAYagAAAAEM9zrW3M709L783PoesMbGzW3KFm3VBnzUd5ybBLSprmcYUa3EJOJVZVUqLO0O3cZg==', N'SECSTAMP1006', N'CONCUR1006', N'0966554433', 1, 0, NULL, 1, 0);
SET IDENTITY_INSERT [identity].[Users] OFF;

    -- 3. USER ROLES
INSERT INTO [identity].[UserRoles] ([UserId], [RoleId]) VALUES
(1001, 1),
(1002, 2),
(1003, 2),
(1004, 2),
(1005, 2),
(1006, 2);

    -- 4. CATEGORIES
SET IDENTITY_INSERT [catalog].[Categories] ON;
INSERT INTO [catalog].[Categories] ([Id], [Name], [Slug], [Description], [ImageUrl], [DisplayOrder], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, N'iPhone', 'iphone', N'Điện thoại thông minh Apple iPhone chính hãng VN/A bảo hành 12 tháng.', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, N'MacBook', 'macbook', N'Máy tính xách tay Apple MacBook Pro và MacBook Air hiệu năng Apple Silicon vượt bậc.', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, N'iPad', 'ipad', N'Máy tính bảng iPad Pro M4, iPad Air M3, iPad mini 7 sáng tạo và đa năng không giới hạn.', NULL, 3, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, N'Apple Watch', 'apple-watch', N'Đồng hồ thông minh Apple Watch Series 10, Series 11 và Ultra 2 theo dõi sức khỏe và phong cách.', NULL, 4, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, N'AirPods & Âm thanh', 'airpods-am-thanh', N'Tai nghe AirPods 4, AirPods Pro 2 USB-C và AirPods Max với chất âm không gian sống động.', NULL, 5, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, N'iMac & Mac Desktop', 'imac-mac-desktop', N'Máy tính để bàn iMac M4, Mac mini M4 và Mac Studio xử lý chuyên nghiệp đồ họa và AI.', NULL, 6, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, N'Phụ kiện Apple', 'phu-kien-apple', N'Bàn phím Magic Keyboard, bút Apple Pencil Pro, củ cáp sạc MagSafe chính hãng Apple.', NULL, 7, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[Categories] OFF;

    -- 5. COLORS
SET IDENTITY_INSERT [catalog].[Colors] ON;
INSERT INTO [catalog].[Colors] ([Id], [Name], [Code], [HexCode], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, N'Titan Sa Mạc', 'DESERT_TITAN', '#C4A482', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, N'Titan Tự Nhiên', 'NATURAL_TITAN', '#9E9A95', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, N'Titan Đen', 'BLACK_TITAN', '#282828', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, N'Titan Trắng', 'WHITE_TITAN', '#F2F1ED', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, N'Xanh Titan', 'BLUE_TITAN', '#4A5568', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, N'Bạc Silver', 'SILVER', '#E3E4E5', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, N'Xám Không Gian', 'SPACE_GRAY', '#5E5E5E', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, N'Đen Không Gian', 'SPACE_BLACK', '#1E1E1E', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, N'Vàng Gold', 'GOLD', '#F5E7D0', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, N'Midnight Tối Thượng', 'MIDNIGHT', '#1F2937', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, N'Starlight Ánh Sao', 'STARLIGHT', '#FAF7F2', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, N'Xanh Mòng Két Teal', 'TEAL', '#005960', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, N'Xanh Lưu Ly Ultramarine', 'ULTRAMARINE', '#3B4E7A', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, N'Hồng Pastel', 'PINK_PASTEL', '#F4C2C2', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, N'Cosmic Gold Ánh Kim', 'COSMIC_GOLD', '#D4AF37', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, N'Jet Black Đen Bóng', 'JET_BLACK', '#0A0A0A', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[Colors] OFF;

    -- 6. STORAGE OPTIONS
SET IDENTITY_INSERT [catalog].[StorageOptions] ON;
INSERT INTO [catalog].[StorageOptions] ([Id], [Name], [CapacityValue], [Unit], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, N'128GB', 128, 'GB', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, N'256GB', 256, 'GB', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, N'512GB', 512, 'GB', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, N'1TB', 1024, 'GB', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, N'2TB', 2048, 'GB', 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[StorageOptions] OFF;

    -- 7. PRODUCTS
SET IDENTITY_INSERT [catalog].[Products] ON;
INSERT INTO [catalog].[Products] ([Id], [CategoryId], [Name], [Slug], [ModelCode], [ShortDescription], [Description], [WarrantyMonths], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, N'iPhone 16 Pro Max', 'iphone-16-pro-max', 'IP16PM', N'iPhone 16 Pro Max màn 6.9 inch, chip A18 Pro, Nút Điều Khiển Camera.', N'iPhone 16 Pro Max với màn hình 6.9 inch viền mỏng kỷ lục, chip A18 Pro, Nút Điều Khiển Camera và pin lớn nhất từ trước đến nay.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, N'iPhone 16 Pro', 'iphone-16-pro', 'IP16P', N'iPhone 16 Pro 6.3 inch, chip A18 Pro 3nm, camera telephoto 5x.', N'iPhone 16 Pro kích thước 6.3 inch, chip A18 Pro 3nm thế hệ hai, camera telephoto 5x và khung viền Titan siêu bền.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 1, N'iPhone 16 Plus', 'iphone-16-plus', 'IP16PL', N'iPhone 16 Plus màn 6.7 inch, chip A18, camera Fusion 48MP.', N'iPhone 16 Plus màn hình 6.7 inch, chip A18, camera Fusion 48MP và Nút Tác Vụ đa năng.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 1, N'iPhone 16', 'iphone-16', 'IP16', N'iPhone 16 chip A18 kiến trúc mới, Apple Intelligence.', N'iPhone 16 chip A18 kiến trúc mới, hỗ trợ Apple Intelligence toàn diện, Nút Điều Khiển Camera tiện lợi.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 1, N'iPhone 15 Pro Max', 'iphone-15-pro-max', 'IP15PM', N'iPhone 15 Pro Max khung vỏ Titan, chip A17 Pro.', N'iPhone 15 Pro Max thiết kế khung vỏ Titan cao cấp, chip A17 Pro chơi game đồ họa đỉnh cao, cổng USB-C 10Gbps.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 1, N'iPhone 15 Pro', 'iphone-15-pro', 'IP15P', N'iPhone 15 Pro ProMotion 120Hz mượt mà, khung viền Titan nhẹ.', N'iPhone 15 Pro màn hình ProMotion 120Hz mượt mà, khung viền Titan nhẹ nhất dòng Pro.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 1, N'iPhone 15 Plus', 'iphone-15-plus', 'IP15PL', N'iPhone 15 Plus 6.7 inch, Dynamic Island, camera 48MP.', N'iPhone 15 Plus màn hình lớn 6.7 inch, Dynamic Island, camera 48MP và thời lượng pin xuất sắc.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 1, N'iPhone 15', 'iphone-15', 'IP15', N'iPhone 15 kính pha màu bền bỉ, cổng USB-C.', N'iPhone 15 thiết kế mặt lưng kính pha màu bền bỉ, Dynamic Island và cổng USB-C tiêu chuẩn.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 1, N'iPhone 17', 'iphone-17', 'IP17', N'iPhone 17 chip A19 2nm, màn ProMotion 120Hz toàn diện.', N'iPhone 17 trang bị chip Apple A19 tiến trình 2nm, màn hình ProMotion 120Hz trên dòng tiêu chuẩn và camera trước 24MP.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 1, N'iPhone 17 Air', 'iphone-17-air', 'IP17AIR', N'iPhone 17 Air siêu mỏng 5.5mm, chip modem Apple C1.', N'iPhone 17 Air độ mỏng ấn tượng chỉ 5.5mm, khung viền Titanium siêu nhẹ, chip modem 5G Apple C1 độc quyền.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 1, N'iPhone 17 Pro', 'iphone-17-pro', 'IP17P', N'iPhone 17 Pro cụm 3 camera 48MP, A19 Pro tản nhiệt buồng hơi.', N'iPhone 17 Pro tích hợp cụm ba camera 48MP toàn diện, chip A19 Pro tản nhiệt buồng hơi và Apple Intelligence nâng cao.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 1, N'iPhone 17 Pro Max', 'iphone-17-pro-max', 'IP17PM', N'iPhone 17 Pro Max màn sáng 3000 nits, tele 10x quang học.', N'iPhone 17 Pro Max màn hình siêu sáng 3000 nits, cảm biến telephoto 10x quang học và thời lượng pin 35 giờ.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 1, N'iPhone 18 Pro', 'iphone-18-pro', 'IP18P', N'iPhone 18 Pro 2026 chip A20 2nm GAA, Face ID ẩn dưới màn hình.', N'iPhone 18 Pro thế hệ 2026 với chip A20 2nm GAA, hệ thống Face ID ẩn dưới màn hình và ống kính khẩu độ biến thiên.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 1, N'iPhone 18 Pro Max', 'iphone-18-pro-max', 'IP18PM', N'Flagship Apple 2026 iPhone 18 Pro Max, A20 Pro dung lượng tới 2TB.', N'Siêu phẩm Apple 2026: iPhone 18 Pro Max, màn hình micro-lens 6.9 inch, chip A20 Pro và dung lượng lên tới 2TB.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 2, N'MacBook Pro 14 inch M4', 'macbook-pro-14-m4', 'MBP14M4', N'MacBook Pro 14 inch chip M4, kính Nano-texture, pin 24 giờ.', N'MacBook Pro 14 inch trang bị chip M4, màn hình Liquid Retina XDR Nano-texture chống chói và thời lượng pin tới 24 giờ.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 2, N'MacBook Pro 14 inch M4 Pro', 'macbook-pro-14-m4-pro', 'MBP14M4P', N'MacBook Pro 14 M4 Pro, Thunderbolt 5 120Gbps, RAM 24GB.', N'MacBook Pro 14 inch với chip M4 Pro cực mạnh, cổng Thunderbolt 5 tốc độ 120Gbps, bộ nhớ Unified 24GB.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 2, N'MacBook Pro 16 inch M4 Pro', 'macbook-pro-16-m4-pro', 'MBP16M4P', N'MacBook Pro 16 M4 Pro đồ họa 3D, dựng phim 8K và AI.', N'MacBook Pro 16 inch M4 Pro hiệu năng đẳng cấp cho đồ họa 3D, dựng phim 8K và lập trình trí tuệ nhân tạo.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 2, N'MacBook Pro 16 inch M4 Max', 'macbook-pro-16-m4-max', 'MBP16M4M', N'MacBook Pro 16 M4 Max 16-core CPU, 40-core GPU, RAM 128GB.', N'MacBook Pro 16 inch chip M4 Max lên tới 16 nhân CPU, 40 nhân GPU, hỗ trợ tối đa 128GB bộ nhớ thống nhất.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 2, N'MacBook Air 13 inch M3', 'macbook-air-13-m3', 'MBA13M3', N'MacBook Air 13 M3 mỏng nhẹ, xuất 2 màn hình ngoài khi gập.', N'MacBook Air 13 M3 thiết kế mỏng nhẹ không quạt gió, hỗ trợ xuất đồng thời hai màn hình ngoài khi gập máy.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 2, N'MacBook Air 15 inch M3', 'macbook-air-15-m3', 'MBA15M3', N'MacBook Air 15 M3 màn 15.3 inch rộng rãi, 6 loa âm thanh vòm.', N'MacBook Air 15 M3 màn hình Liquid Retina 15.3 inch rộng rãi, hệ thống 6 loa âm thanh vòm sống động.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 2, N'MacBook Air 13 inch M4', 'macbook-air-13-m4', 'MBA13M4', N'MacBook Air 13 M4 RAM 16GB mặc định, màu Sky Blue.', N'MacBook Air 13 M4 thế hệ mới với RAM mặc định 16GB, chip M4 tiến trình mới và màu Sky Blue độc đáo.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 2, N'MacBook Pro 14 inch M5 Pro', 'macbook-pro-14-m5-pro', 'MBP14M5P', N'MacBook Pro 14 M5 Pro màn Tandem OLED, chip Apple M5.', N'MacBook Pro 14 inch M5 Pro công nghệ màn hình Tandem OLED, chip Apple M5 băng thông bộ nhớ cực lớn.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 2, N'MacBook Pro 16 inch M5 Max', 'macbook-pro-16-m5-max', 'MBP16M5M', N'MacBook Pro 16 M5 Max cỗ máy sáng tạo 2026, Wi-Fi 7, Thunderbolt 5.', N'MacBook Pro 16 inch M5 Max cỗ máy sáng tạo nội dung hàng đầu 2026 với Wi-Fi 7 và kết nối Thunderbolt 5.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 2, N'MacBook Pro 16 inch M6 Ultra', 'macbook-pro-16-m6-ultra', 'MBP16M6U', N'Flagship 2026: MacBook Pro M6 Ultra 24 CPU, 60 GPU, RAM 256GB.', N'Đỉnh cao máy tính xách tay 2026: MacBook Pro M6 Ultra 24-core CPU, 60-core GPU và băng thông 1TB/s.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 3, N'iPad Pro 11 inch M4', 'ipad-pro-11-m4', 'IPP11M4', N'iPad Pro 11 M4 siêu mỏng 5.3mm, màn Tandem OLED.', N'iPad Pro 11 M4 thiết kế mỏng không tưởng chỉ 5.3mm, màn hình Ultra Retina XDR Tandem OLED đột phá.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 3, N'iPad Pro 13 inch M4', 'ipad-pro-13-m4', 'IPP13M4', N'iPad Pro 13 M4 OLED kép 1600 nits, đồ họa Ray-tracing.', N'iPad Pro 13 M4 màn hình OLED kép siêu sáng 1600 nits, chip M4 sức mạnh đồ họa Ray-tracing thời gian thực.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 3, N'iPad Air 11 inch M2', 'ipad-air-11-m2', 'IPA11M2', N'iPad Air 11 M2 hỗ trợ Pencil Pro, camera trước nằm ngang.', N'iPad Air 11 M2 hỗ trợ bút Apple Pencil Pro, camera trước Ultra Wide ngang tối ưu gọi video họp nhóm.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 3, N'iPad Air 13 inch M2', 'ipad-air-13-m2', 'IPA13M2', N'iPad Air 13 M2 kích thước hiển thị lớn hơn 30%, loa bass gấp đôi.', N'iPad Air 13 M2 kích thước hiển thị rộng hơn 30%, loa stereo tăng cường âm trầm gấp đôi.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 3, N'iPad Air 13 inch M3', 'ipad-air-13-m3', 'IPA13M3', N'iPad Air 13 M3 chip Apple M3 học tập và vẽ Procreate chuyên nghiệp.', N'iPad Air 13 M3 chip Apple M3 xử lý mượt các tác vụ học tập thông minh và thiết kế đồ họa Procreate.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 3, N'iPad mini 7 A17 Pro', 'ipad-mini-7-a17-pro', 'IPM7', N'iPad mini 7 nhỏ gọn trong lòng bàn tay, chip A17 Pro, Apple Intelligence.', N'iPad mini 7 nhỏ gọn trong lòng bàn tay, chip A17 Pro mạnh mẽ, hỗ trợ Apple Intelligence và Pencil Pro.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 3, N'iPad Pro 13 inch M5', 'ipad-pro-13-m5', 'IPP13M5', N'iPad Pro 13 M5 2026 Tandem Micro-Lens OLED, Apple Intelligence Pro.', N'iPad Pro 13 M5 thế hệ 2026 tích hợp màn hình Tandem Micro-Lens OLED, hỗ trợ AI thời gian thực.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 4, N'Apple Watch Ultra 2 Titanium 49mm', 'apple-watch-ultra-2-titanium', 'AWU2', N'Apple Watch Ultra 2 Titanium 49mm, màu Đen Satin, GPS tần số kép.', N'Apple Watch Ultra 2 vỏ Titanium 49mm, phiên bản màu Đen Satin sang trọng, màn hình 3000 nits và GPS đa băng tần.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 4, N'Apple Watch Series 10 Nhôm 46mm', 'apple-watch-series-10-nhom-46mm', 'AWS10AL', N'Apple Watch Series 10 mỏng hơn 10%, OLED góc rộng, Jet Black.', N'Apple Watch Series 10 mỏng hơn 10%, màn hình OLED góc rộng sáng hơn 40% khi nhìn nghiêng, màu Jet Black ấn tượng.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 4, N'Apple Watch Series 10 Titan 46mm', 'apple-watch-series-10-titan-46mm', 'AWS10TI', N'Apple Watch Series 10 Titanium hàng không vũ trụ, Sapphire.', N'Apple Watch Series 10 Titanium chuẩn hàng không vũ trụ đánh bóng tỉ mỉ, mặt kính Sapphire chống xước tuyệt đối.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 4, N'Apple Watch Series 11 46mm', 'apple-watch-series-11-46mm', 'AWS11', N'Apple Watch Series 11 2026 phân tích huyết áp liên tục và trợ lý AI.', N'Apple Watch Series 11 thế hệ 2026 trang bị cảm biến sức khỏe phân tích huyết áp liên tục và trợ lý AI.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 4, N'Apple Watch Ultra 3 Titanium Vệ Tinh', 'apple-watch-ultra-3-titanium-ve-tinh', 'AWU3', N'Apple Watch Ultra 3 2026 kết nối vệ tinh 2 chiều, màn 4000 nits, pin 96h.', N'Apple Watch Ultra 3 năm 2026 trang bị kết nối vệ tinh SOS độc lập hai chiều, màn hình 4000 nits và pin 96 giờ.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 5, N'AirPods Pro 2 MagSafe USB-C', 'airpods-pro-2-magsafe-usb-c', 'APP2C', N'AirPods Pro 2 USB-C, chống ồn gấp 2 lần, chống bụi nước IP54.', N'AirPods Pro 2 nâng cấp cổng sạc USB-C, chống ồn chủ động gấp 2 lần, chống bụi nước IP54 cho cả tai nghe và hộp sạc.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 5, N'AirPods 4 Bản Chống Ồn ANC', 'airpods-4-chong-on-anc', 'AP4ANC', N'AirPods 4 ANC thiết kế mở chống ồn chủ động, hộp sạc có loa Find My.', N'AirPods 4 ANC thiết kế mở đầu tiên tích hợp Chống Ồn Chủ Động, Chế Độ Thích Ứng và hộp sạc có loa định vị Find My.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 5, N'AirPods 4 Tiêu Chuẩn', 'airpods-4-tieu-chuan', 'AP4STD', N'AirPods 4 chip H2 cuộc gọi trong trẻo với Tách Lời Nói.', N'AirPods 4 chip H2 mang lại chất lượng cuộc gọi trong trẻo với Tách Lời Nói và Âm Thanh Không Gian Cá Nhân Hóa.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 5, N'AirPods Max Cổng USB-C', 'airpods-max-usb-c', 'APMAXC', N'AirPods Max USB-C màu mới, âm thanh chuẩn phòng thu Hi-Res.', N'AirPods Max phiên bản cổng sạc USB-C với các tông màu mới, âm thanh chuẩn phòng thu và đệm tai bọc vải lưới êm ái.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 5, N'AirPods Pro 3 2026', 'airpods-pro-3-2026', 'APP3', N'AirPods Pro 3 đo nhịp tim trong tai, chống ồn AI nhịp sinh học.', N'AirPods Pro 3 trang bị cảm biến theo dõi nhịp tim trong tai, chống ồn AI thích ứng theo nhịp sinh học.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 6, N'iMac 24 inch M4', 'imac-24-inch-m4', 'IMAC24M4', N'iMac 24 inch chip M4 siêu tốc, màn Retina 4.5K Nano-texture.', N'iMac 24 inch chip M4 siêu tốc, màn hình Retina 4.5K tùy chọn kính phủ Nano-texture và camera 12MP Center Stage.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 6, N'Mac mini M4', 'mac-mini-m4', 'MMINIM4', N'Mac mini M4 siêu gọn 12.7cm, RAM 16GB mặc định.', N'Mac mini M4 kích thước siêu gọn 12.7cm, RAM mặc định 16GB, đầy đủ cổng kết nối trước sau tiện lợi.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 6, N'Mac mini M4 Pro', 'mac-mini-m4-pro', 'MMINIM4P', N'Mac mini M4 Pro nhỏ bé sức mạnh lớn, 3 cổng Thunderbolt 5.', N'Mac mini M4 Pro cỗ máy nhỏ bé với sức mạnh khủng khiếp, ba cổng Thunderbolt 5 băng thông 120Gbps.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 6, N'Mac Studio M4 Ultra', 'mac-studio-m4-ultra', 'MSTUDIOM4U', N'Mac Studio M4 Ultra chuyên dụng studio phim ảnh Hollywood và AI.', N'Mac Studio M4 Ultra chuyên dụng cho studio phim ảnh Hollywood và huấn luyện mô hình trí tuệ nhân tạo cục bộ.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 7, N'Bút Apple Pencil Pro', 'but-apple-pencil-pro', 'PENPRO', N'Apple Pencil Pro bóp haptic, xoay con quay hồi chuyển, Find My.', N'Apple Pencil Pro với cảm biến bóp haptic, con quay hồi chuyển xoay thân bút và tìm kiếm Find My thông minh.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 7, N'Magic Keyboard cho iPad Pro M4 13 inch', 'magic-keyboard-ipad-pro-m4-13-inch', 'MKB13M4', N'Magic Keyboard iPad Pro M4 nhôm nguyên khối, trackpad haptic.', N'Bàn phím Magic Keyboard iPad Pro M4 chất liệu nhôm nguyên khối, trackpad phản hồi xúc giác cực êm ái.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 7, N'Củ sạc đôi Apple 35W Dual USB-C Port Compact', 'cu-sac-apple-35w-dual-usb-c', 'CHG35W', N'Củ sạc đôi 35W hai cổng USB-C chân cắm gập nhỏ gọn.', N'Củ sạc chính hãng Apple 35W hai cổng USB-C chân cắm gập nhỏ gọn, sạc nhanh đồng thời iPhone và Apple Watch.', 12, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[Products] OFF;

    -- 8. PRODUCT OPTIONS
SET IDENTITY_INSERT [catalog].[ProductOptions] ON;
INSERT INTO [catalog].[ProductOptions] ([Id], [ProductId], [Name], [DisplayOrder], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 2, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 2, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 3, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 3, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 4, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 4, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 5, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 5, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 6, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 6, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 7, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 7, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 8, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 8, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 9, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 9, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 10, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 10, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 11, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 11, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 12, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 12, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 13, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 13, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 14, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 14, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 15, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 15, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 16, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 16, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 17, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 17, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 18, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 18, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 19, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 19, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 20, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 20, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 21, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 21, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 22, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 22, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 23, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 23, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 24, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 24, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 25, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 25, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 26, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 26, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 27, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 27, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 28, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 28, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 29, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 29, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 30, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 30, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 31, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 31, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 32, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 33, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 34, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 35, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 36, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 37, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 38, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 39, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 40, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 41, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 42, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 42, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 43, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 43, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 44, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 44, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 45, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 45, N'Dung lượng', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 46, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 47, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 48, N'Màu sắc', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductOptions] OFF;

    -- 9. PRODUCT OPTION VALUES
SET IDENTITY_INSERT [catalog].[ProductOptionValues] ON;
INSERT INTO [catalog].[ProductOptionValues] ([Id], [OptionId], [Value], [ColorHexCode], [DisplayOrder], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 1, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 1, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 2, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 2, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 2, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 3, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 3, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 3, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 3, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 4, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 4, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 4, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 5, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 5, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 5, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 5, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 6, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 6, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 6, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 7, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 7, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 7, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 7, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 8, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 8, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 8, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 9, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 9, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 9, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 9, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 10, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 10, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 10, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 11, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 11, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 11, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 11, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 12, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 12, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 12, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 13, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 13, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 13, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 13, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 14, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 14, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 14, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 15, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 15, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 15, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 15, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 16, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 16, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 16, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 17, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 17, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 17, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 17, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 18, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 18, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 18, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 19, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 19, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 19, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 19, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 20, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 20, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 20, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 21, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 21, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 21, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 21, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 22, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 22, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 22, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 23, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 23, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 23, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 23, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 24, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 24, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(84, 24, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(85, 25, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(86, 25, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(87, 25, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(88, 25, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 26, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(90, 26, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(91, 26, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(92, 27, N'Titan Sa Mạc', '#C4A482', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(93, 27, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(94, 27, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(95, 27, N'Titan Trắng', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(96, 28, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(97, 28, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(98, 28, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(99, 29, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(100, 29, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(101, 30, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(102, 30, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(103, 30, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(104, 31, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(105, 31, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(106, 32, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(107, 32, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(108, 32, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(109, 33, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(110, 33, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(111, 34, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(112, 34, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(113, 34, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(114, 35, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(115, 35, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(116, 36, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(117, 36, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(118, 36, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(119, 37, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(120, 37, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(121, 38, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(122, 38, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(123, 38, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(124, 39, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(125, 39, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(126, 40, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(127, 40, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(128, 40, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(129, 41, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(130, 41, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(131, 42, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(132, 42, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(133, 42, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(134, 43, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(135, 43, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(136, 44, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(137, 44, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(138, 44, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(139, 45, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(140, 45, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(141, 46, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(142, 46, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(143, 46, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(144, 47, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(145, 47, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(146, 48, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(147, 48, N'1TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(148, 48, N'2TB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(149, 49, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(150, 49, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(151, 50, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(152, 50, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(153, 51, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(154, 51, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(155, 52, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(156, 52, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(157, 53, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(158, 53, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(159, 54, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(160, 54, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(161, 55, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(162, 55, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(163, 56, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(164, 56, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(165, 57, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(166, 57, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(167, 58, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(168, 58, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(169, 59, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(170, 59, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(171, 60, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(172, 60, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(173, 61, N'Xám Không Gian', '#5E5E5E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(174, 61, N'Starlight Ánh Sao', '#FAF7F2', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(175, 62, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(176, 62, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(177, 63, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(178, 63, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(179, 64, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(180, 64, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(181, 65, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(182, 65, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(183, 66, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(184, 66, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(185, 67, N'Titan Đen', '#282828', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(186, 67, N'Titan Tự Nhiên', '#9E9A95', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(187, 68, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(188, 68, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(189, 69, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(190, 69, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(191, 70, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(192, 70, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(193, 71, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(194, 71, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(195, 72, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(196, 72, N'Đen Không Gian', '#1E1E1E', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(197, 73, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(198, 73, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(199, 74, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(200, 74, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(201, 75, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(202, 75, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(203, 76, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(204, 76, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(205, 77, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(206, 77, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(207, 78, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(208, 78, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(209, 79, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(210, 79, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(211, 80, N'256GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(212, 80, N'512GB', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(213, 81, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(214, 81, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(215, 82, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(216, 82, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(217, 83, N'Trắng White', '#F2F1ED', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(218, 83, N'Bạc Silver', '#E3E4E5', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductOptionValues] OFF;

    -- 10. PRODUCT IMAGES (All ImageUrl = NULL for null-safety verification)
SET IDENTITY_INSERT [catalog].[ProductImages] ON;
INSERT INTO [catalog].[ProductImages] ([Id], [ProductId], [OptionValueId], [ImageUrl], [AltText], [DisplayOrder], [IsPrimary], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, 1, NULL, N'iPhone 16 Pro Max Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, 2, NULL, N'iPhone 16 Pro Max Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 1, 3, NULL, N'iPhone 16 Pro Max Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 1, 4, NULL, N'iPhone 16 Pro Max Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 2, 8, NULL, N'iPhone 16 Pro Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 2, 9, NULL, N'iPhone 16 Pro Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 2, 10, NULL, N'iPhone 16 Pro Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 2, 11, NULL, N'iPhone 16 Pro Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 3, 15, NULL, N'iPhone 16 Plus Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 3, 16, NULL, N'iPhone 16 Plus Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 3, 17, NULL, N'iPhone 16 Plus Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 3, 18, NULL, N'iPhone 16 Plus Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 4, 22, NULL, N'iPhone 16 Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 4, 23, NULL, N'iPhone 16 Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 4, 24, NULL, N'iPhone 16 Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 4, 25, NULL, N'iPhone 16 Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 5, 29, NULL, N'iPhone 15 Pro Max Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 5, 30, NULL, N'iPhone 15 Pro Max Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 5, 31, NULL, N'iPhone 15 Pro Max Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 5, 32, NULL, N'iPhone 15 Pro Max Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 6, 36, NULL, N'iPhone 15 Pro Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 6, 37, NULL, N'iPhone 15 Pro Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 6, 38, NULL, N'iPhone 15 Pro Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 6, 39, NULL, N'iPhone 15 Pro Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 7, 43, NULL, N'iPhone 15 Plus Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 7, 44, NULL, N'iPhone 15 Plus Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 7, 45, NULL, N'iPhone 15 Plus Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 7, 46, NULL, N'iPhone 15 Plus Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 8, 50, NULL, N'iPhone 15 Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 8, 51, NULL, N'iPhone 15 Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 8, 52, NULL, N'iPhone 15 Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 8, 53, NULL, N'iPhone 15 Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 9, 57, NULL, N'iPhone 17 Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 9, 58, NULL, N'iPhone 17 Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 9, 59, NULL, N'iPhone 17 Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 9, 60, NULL, N'iPhone 17 Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 10, 64, NULL, N'iPhone 17 Air Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 10, 65, NULL, N'iPhone 17 Air Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 10, 66, NULL, N'iPhone 17 Air Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 10, 67, NULL, N'iPhone 17 Air Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 11, 71, NULL, N'iPhone 17 Pro Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 11, 72, NULL, N'iPhone 17 Pro Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 11, 73, NULL, N'iPhone 17 Pro Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 11, 74, NULL, N'iPhone 17 Pro Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 12, 78, NULL, N'iPhone 17 Pro Max Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 12, 79, NULL, N'iPhone 17 Pro Max Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 12, 80, NULL, N'iPhone 17 Pro Max Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 12, 81, NULL, N'iPhone 17 Pro Max Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 13, 85, NULL, N'iPhone 18 Pro Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 13, 86, NULL, N'iPhone 18 Pro Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 13, 87, NULL, N'iPhone 18 Pro Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 13, 88, NULL, N'iPhone 18 Pro Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 14, 92, NULL, N'iPhone 18 Pro Max Titan Sa Mạc', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 14, 93, NULL, N'iPhone 18 Pro Max Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 14, 94, NULL, N'iPhone 18 Pro Max Titan Đen', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 14, 95, NULL, N'iPhone 18 Pro Max Titan Trắng', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 15, 99, NULL, N'MacBook Pro 14 inch M4 Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 15, 100, NULL, N'MacBook Pro 14 inch M4 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 16, 104, NULL, N'MacBook Pro 14 inch M4 Pro Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 16, 105, NULL, N'MacBook Pro 14 inch M4 Pro Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 17, 109, NULL, N'MacBook Pro 16 inch M4 Pro Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 17, 110, NULL, N'MacBook Pro 16 inch M4 Pro Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 18, 114, NULL, N'MacBook Pro 16 inch M4 Max Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 18, 115, NULL, N'MacBook Pro 16 inch M4 Max Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 19, 119, NULL, N'MacBook Air 13 inch M3 Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 19, 120, NULL, N'MacBook Air 13 inch M3 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 20, 124, NULL, N'MacBook Air 15 inch M3 Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 20, 125, NULL, N'MacBook Air 15 inch M3 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 21, 129, NULL, N'MacBook Air 13 inch M4 Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 21, 130, NULL, N'MacBook Air 13 inch M4 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 22, 134, NULL, N'MacBook Pro 14 inch M5 Pro Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 22, 135, NULL, N'MacBook Pro 14 inch M5 Pro Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 23, 139, NULL, N'MacBook Pro 16 inch M5 Max Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 23, 140, NULL, N'MacBook Pro 16 inch M5 Max Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 24, 144, NULL, N'MacBook Pro 16 inch M6 Ultra Đen Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 24, 145, NULL, N'MacBook Pro 16 inch M6 Ultra Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 25, 149, NULL, N'iPad Pro 11 inch M4 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 25, 150, NULL, N'iPad Pro 11 inch M4 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 26, 153, NULL, N'iPad Pro 13 inch M4 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 26, 154, NULL, N'iPad Pro 13 inch M4 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 27, 157, NULL, N'iPad Air 11 inch M2 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 27, 158, NULL, N'iPad Air 11 inch M2 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 28, 161, NULL, N'iPad Air 13 inch M2 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(84, 28, 162, NULL, N'iPad Air 13 inch M2 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(85, 29, 165, NULL, N'iPad Air 13 inch M3 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(86, 29, 166, NULL, N'iPad Air 13 inch M3 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(87, 30, 169, NULL, N'iPad mini 7 A17 Pro Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(88, 30, 170, NULL, N'iPad mini 7 A17 Pro Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 31, 173, NULL, N'iPad Pro 13 inch M5 Xám Không Gian', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(90, 31, 174, NULL, N'iPad Pro 13 inch M5 Starlight Ánh Sao', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(91, 32, 177, NULL, N'Apple Watch Ultra 2 Titanium 49mm Titan Đen', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(92, 32, 178, NULL, N'Apple Watch Ultra 2 Titanium 49mm Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(93, 33, 179, NULL, N'Apple Watch Series 10 Nhôm 46mm Titan Đen', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(94, 33, 180, NULL, N'Apple Watch Series 10 Nhôm 46mm Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(95, 34, 181, NULL, N'Apple Watch Series 10 Titan 46mm Titan Đen', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(96, 34, 182, NULL, N'Apple Watch Series 10 Titan 46mm Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(97, 35, 183, NULL, N'Apple Watch Series 11 46mm Titan Đen', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(98, 35, 184, NULL, N'Apple Watch Series 11 46mm Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(99, 36, 185, NULL, N'Apple Watch Ultra 3 Titanium Vệ Tinh Titan Đen', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(100, 36, 186, NULL, N'Apple Watch Ultra 3 Titanium Vệ Tinh Titan Tự Nhiên', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(101, 37, 187, NULL, N'AirPods Pro 2 MagSafe USB-C Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(102, 37, 188, NULL, N'AirPods Pro 2 MagSafe USB-C Đen Không Gian', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(103, 38, 189, NULL, N'AirPods 4 Bản Chống Ồn ANC Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(104, 38, 190, NULL, N'AirPods 4 Bản Chống Ồn ANC Đen Không Gian', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(105, 39, 191, NULL, N'AirPods 4 Tiêu Chuẩn Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(106, 39, 192, NULL, N'AirPods 4 Tiêu Chuẩn Đen Không Gian', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(107, 40, 193, NULL, N'AirPods Max Cổng USB-C Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(108, 40, 194, NULL, N'AirPods Max Cổng USB-C Đen Không Gian', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(109, 41, 195, NULL, N'AirPods Pro 3 2026 Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(110, 41, 196, NULL, N'AirPods Pro 3 2026 Đen Không Gian', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(111, 42, 197, NULL, N'iMac 24 inch M4 Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(112, 42, 198, NULL, N'iMac 24 inch M4 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(113, 43, 201, NULL, N'Mac mini M4 Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(114, 43, 202, NULL, N'Mac mini M4 Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(115, 44, 205, NULL, N'Mac mini M4 Pro Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(116, 44, 206, NULL, N'Mac mini M4 Pro Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(117, 45, 209, NULL, N'Mac Studio M4 Ultra Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(118, 45, 210, NULL, N'Mac Studio M4 Ultra Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(119, 46, 213, NULL, N'Bút Apple Pencil Pro Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(120, 46, 214, NULL, N'Bút Apple Pencil Pro Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(121, 47, 215, NULL, N'Magic Keyboard cho iPad Pro M4 13 inch Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(122, 47, 216, NULL, N'Magic Keyboard cho iPad Pro M4 13 inch Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(123, 48, 217, NULL, N'Củ sạc đôi Apple 35W Dual USB-C Port Compact Trắng White', 1, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(124, 48, 218, NULL, N'Củ sạc đôi Apple 35W Dual USB-C Port Compact Bạc Silver', 1, 0, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductImages] OFF;

    -- 11. PRODUCT VARIANTS
SET IDENTITY_INSERT [catalog].[ProductVariants] ON;
INSERT INTO [catalog].[ProductVariants] ([Id], [ProductId], [SKU], [VariantName], [ColorId], [StorageOptionId], [Price], [CompareAtPrice], [QuantityInStock], [CostPrice], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, 'VN-001-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 31990000.00, 34990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, 'VN-001-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 31990000.00, 34990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 1, 'VN-001-3-2', N'Titan Đen / 256GB', 3, 2, 31990000.00, 34990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 1, 'VN-001-4-2', N'Titan Trắng / 256GB', 4, 2, 31990000.00, 34990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 1, 'VN-001-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 36990000.00, 39990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 1, 'VN-001-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 36990000.00, 39990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 1, 'VN-001-3-3', N'Titan Đen / 512GB', 3, 3, 36990000.00, 39990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 1, 'VN-001-4-3', N'Titan Trắng / 512GB', 4, 3, 36990000.00, 39990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 1, 'VN-001-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 41990000.00, 44990000.00, 100, 35691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 1, 'VN-001-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 41990000.00, 44990000.00, 100, 35691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 1, 'VN-001-3-4', N'Titan Đen / 1TB', 3, 4, 41990000.00, 44990000.00, 100, 35691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 1, 'VN-001-4-4', N'Titan Trắng / 1TB', 4, 4, 41990000.00, 44990000.00, 100, 35691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 2, 'VN-002-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 2, 'VN-002-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 2, 'VN-002-3-2', N'Titan Đen / 256GB', 3, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 2, 'VN-002-4-2', N'Titan Trắng / 256GB', 4, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 2, 'VN-002-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 2, 'VN-002-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 2, 'VN-002-3-3', N'Titan Đen / 512GB', 3, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 2, 'VN-002-4-3', N'Titan Trắng / 512GB', 4, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 2, 'VN-002-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 36990000.00, 38990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 2, 'VN-002-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 36990000.00, 38990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 2, 'VN-002-3-4', N'Titan Đen / 1TB', 3, 4, 36990000.00, 38990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 2, 'VN-002-4-4', N'Titan Trắng / 1TB', 4, 4, 36990000.00, 38990000.00, 100, 31441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 3, 'VN-003-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 23990000.00, 25990000.00, 100, 20391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 3, 'VN-003-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 23990000.00, 25990000.00, 100, 20391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 3, 'VN-003-3-2', N'Titan Đen / 256GB', 3, 2, 23990000.00, 25990000.00, 100, 20391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 3, 'VN-003-4-2', N'Titan Trắng / 256GB', 4, 2, 23990000.00, 25990000.00, 100, 20391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 3, 'VN-003-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 28990000.00, 30990000.00, 100, 24641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 3, 'VN-003-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 28990000.00, 30990000.00, 100, 24641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 3, 'VN-003-3-3', N'Titan Đen / 512GB', 3, 3, 28990000.00, 30990000.00, 100, 24641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 3, 'VN-003-4-3', N'Titan Trắng / 512GB', 4, 3, 28990000.00, 30990000.00, 100, 24641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 3, 'VN-003-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 33990000.00, 35990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 3, 'VN-003-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 33990000.00, 35990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 3, 'VN-003-3-4', N'Titan Đen / 1TB', 3, 4, 33990000.00, 35990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 3, 'VN-003-4-4', N'Titan Trắng / 1TB', 4, 4, 33990000.00, 35990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 4, 'VN-004-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 20990000.00, 22990000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 4, 'VN-004-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 20990000.00, 22990000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 4, 'VN-004-3-2', N'Titan Đen / 256GB', 3, 2, 20990000.00, 22990000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 4, 'VN-004-4-2', N'Titan Trắng / 256GB', 4, 2, 20990000.00, 22990000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 4, 'VN-004-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 25990000.00, 27990000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 4, 'VN-004-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 25990000.00, 27990000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 4, 'VN-004-3-3', N'Titan Đen / 512GB', 3, 3, 25990000.00, 27990000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 4, 'VN-004-4-3', N'Titan Trắng / 512GB', 4, 3, 25990000.00, 27990000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 4, 'VN-004-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 4, 'VN-004-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 4, 'VN-004-3-4', N'Titan Đen / 1TB', 3, 4, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 4, 'VN-004-4-4', N'Titan Trắng / 1TB', 4, 4, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 5, 'VN-005-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 5, 'VN-005-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 5, 'VN-005-3-2', N'Titan Đen / 256GB', 3, 2, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 5, 'VN-005-4-2', N'Titan Trắng / 256GB', 4, 2, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 5, 'VN-005-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 5, 'VN-005-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 5, 'VN-005-3-3', N'Titan Đen / 512GB', 3, 3, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 5, 'VN-005-4-3', N'Titan Trắng / 512GB', 4, 3, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 5, 'VN-005-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 5, 'VN-005-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 5, 'VN-005-3-4', N'Titan Đen / 1TB', 3, 4, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 5, 'VN-005-4-4', N'Titan Trắng / 1TB', 4, 4, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 6, 'VN-006-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 23490000.00, 25990000.00, 100, 19966500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 6, 'VN-006-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 23490000.00, 25990000.00, 100, 19966500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 6, 'VN-006-3-2', N'Titan Đen / 256GB', 3, 2, 23490000.00, 25990000.00, 100, 19966500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 6, 'VN-006-4-2', N'Titan Trắng / 256GB', 4, 2, 23490000.00, 25990000.00, 100, 19966500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 6, 'VN-006-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 28490000.00, 30990000.00, 100, 24216500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 6, 'VN-006-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 28490000.00, 30990000.00, 100, 24216500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 6, 'VN-006-3-3', N'Titan Đen / 512GB', 3, 3, 28490000.00, 30990000.00, 100, 24216500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 6, 'VN-006-4-3', N'Titan Trắng / 512GB', 4, 3, 28490000.00, 30990000.00, 100, 24216500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 6, 'VN-006-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 33490000.00, 35990000.00, 100, 28466500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 6, 'VN-006-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 33490000.00, 35990000.00, 100, 28466500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 6, 'VN-006-3-4', N'Titan Đen / 1TB', 3, 4, 33490000.00, 35990000.00, 100, 28466500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 6, 'VN-006-4-4', N'Titan Trắng / 1TB', 4, 4, 33490000.00, 35990000.00, 100, 28466500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 7, 'VN-007-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 19990000.00, 22990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 7, 'VN-007-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 19990000.00, 22990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 7, 'VN-007-3-2', N'Titan Đen / 256GB', 3, 2, 19990000.00, 22990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 7, 'VN-007-4-2', N'Titan Trắng / 256GB', 4, 2, 19990000.00, 22990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 7, 'VN-007-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 24990000.00, 27990000.00, 100, 21241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 7, 'VN-007-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 24990000.00, 27990000.00, 100, 21241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 7, 'VN-007-3-3', N'Titan Đen / 512GB', 3, 3, 24990000.00, 27990000.00, 100, 21241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 7, 'VN-007-4-3', N'Titan Trắng / 512GB', 4, 3, 24990000.00, 27990000.00, 100, 21241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 7, 'VN-007-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 29990000.00, 32990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 7, 'VN-007-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 29990000.00, 32990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 7, 'VN-007-3-4', N'Titan Đen / 1TB', 3, 4, 29990000.00, 32990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(84, 7, 'VN-007-4-4', N'Titan Trắng / 1TB', 4, 4, 29990000.00, 32990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(85, 8, 'VN-008-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 17490000.00, 19990000.00, 100, 14866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(86, 8, 'VN-008-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 17490000.00, 19990000.00, 100, 14866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(87, 8, 'VN-008-3-2', N'Titan Đen / 256GB', 3, 2, 17490000.00, 19990000.00, 100, 14866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(88, 8, 'VN-008-4-2', N'Titan Trắng / 256GB', 4, 2, 17490000.00, 19990000.00, 100, 14866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 8, 'VN-008-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 22490000.00, 24990000.00, 100, 19116500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(90, 8, 'VN-008-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 22490000.00, 24990000.00, 100, 19116500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(91, 8, 'VN-008-3-3', N'Titan Đen / 512GB', 3, 3, 22490000.00, 24990000.00, 100, 19116500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(92, 8, 'VN-008-4-3', N'Titan Trắng / 512GB', 4, 3, 22490000.00, 24990000.00, 100, 19116500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(93, 8, 'VN-008-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(94, 8, 'VN-008-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(95, 8, 'VN-008-3-4', N'Titan Đen / 1TB', 3, 4, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(96, 8, 'VN-008-4-4', N'Titan Trắng / 1TB', 4, 4, 27490000.00, 29990000.00, 100, 23366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(97, 9, 'VN-009-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(98, 9, 'VN-009-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(99, 9, 'VN-009-3-2', N'Titan Đen / 256GB', 3, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(100, 9, 'VN-009-4-2', N'Titan Trắng / 256GB', 4, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(101, 9, 'VN-009-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(102, 9, 'VN-009-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(103, 9, 'VN-009-3-3', N'Titan Đen / 512GB', 3, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(104, 9, 'VN-009-4-3', N'Titan Trắng / 512GB', 4, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(105, 9, 'VN-009-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(106, 9, 'VN-009-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(107, 9, 'VN-009-3-4', N'Titan Đen / 1TB', 3, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(108, 9, 'VN-009-4-4', N'Titan Trắng / 1TB', 4, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(109, 10, 'VN-010-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 29990000.00, 31990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(110, 10, 'VN-010-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 29990000.00, 31990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(111, 10, 'VN-010-3-2', N'Titan Đen / 256GB', 3, 2, 29990000.00, 31990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(112, 10, 'VN-010-4-2', N'Titan Trắng / 256GB', 4, 2, 29990000.00, 31990000.00, 100, 25491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(113, 10, 'VN-010-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 34990000.00, 36990000.00, 100, 29741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(114, 10, 'VN-010-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 34990000.00, 36990000.00, 100, 29741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(115, 10, 'VN-010-3-3', N'Titan Đen / 512GB', 3, 3, 34990000.00, 36990000.00, 100, 29741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(116, 10, 'VN-010-4-3', N'Titan Trắng / 512GB', 4, 3, 34990000.00, 36990000.00, 100, 29741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(117, 10, 'VN-010-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 39990000.00, 41990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(118, 10, 'VN-010-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 39990000.00, 41990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(119, 10, 'VN-010-3-4', N'Titan Đen / 1TB', 3, 4, 39990000.00, 41990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(120, 10, 'VN-010-4-4', N'Titan Trắng / 1TB', 4, 4, 39990000.00, 41990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(121, 11, 'VN-011-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(122, 11, 'VN-011-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(123, 11, 'VN-011-3-2', N'Titan Đen / 256GB', 3, 2, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(124, 11, 'VN-011-4-2', N'Titan Trắng / 256GB', 4, 2, 30990000.00, 32990000.00, 100, 26341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(125, 11, 'VN-011-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 35990000.00, 37990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(126, 11, 'VN-011-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 35990000.00, 37990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(127, 11, 'VN-011-3-3', N'Titan Đen / 512GB', 3, 3, 35990000.00, 37990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(128, 11, 'VN-011-4-3', N'Titan Trắng / 512GB', 4, 3, 35990000.00, 37990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(129, 11, 'VN-011-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 40990000.00, 42990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(130, 11, 'VN-011-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 40990000.00, 42990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(131, 11, 'VN-011-3-4', N'Titan Đen / 1TB', 3, 4, 40990000.00, 42990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(132, 11, 'VN-011-4-4', N'Titan Trắng / 1TB', 4, 4, 40990000.00, 42990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(133, 12, 'VN-012-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 35990000.00, 38990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(134, 12, 'VN-012-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 35990000.00, 38990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(135, 12, 'VN-012-3-2', N'Titan Đen / 256GB', 3, 2, 35990000.00, 38990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(136, 12, 'VN-012-4-2', N'Titan Trắng / 256GB', 4, 2, 35990000.00, 38990000.00, 100, 30591500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(137, 12, 'VN-012-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 40990000.00, 43990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(138, 12, 'VN-012-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 40990000.00, 43990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(139, 12, 'VN-012-3-3', N'Titan Đen / 512GB', 3, 3, 40990000.00, 43990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(140, 12, 'VN-012-4-3', N'Titan Trắng / 512GB', 4, 3, 40990000.00, 43990000.00, 100, 34841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(141, 12, 'VN-012-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 45990000.00, 48990000.00, 100, 39091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(142, 12, 'VN-012-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 45990000.00, 48990000.00, 100, 39091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(143, 12, 'VN-012-3-4', N'Titan Đen / 1TB', 3, 4, 45990000.00, 48990000.00, 100, 39091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(144, 12, 'VN-012-4-4', N'Titan Trắng / 1TB', 4, 4, 45990000.00, 48990000.00, 100, 39091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(145, 13, 'VN-013-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 33990000.00, 36990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(146, 13, 'VN-013-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 33990000.00, 36990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(147, 13, 'VN-013-3-2', N'Titan Đen / 256GB', 3, 2, 33990000.00, 36990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(148, 13, 'VN-013-4-2', N'Titan Trắng / 256GB', 4, 2, 33990000.00, 36990000.00, 100, 28891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(149, 13, 'VN-013-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(150, 13, 'VN-013-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(151, 13, 'VN-013-3-3', N'Titan Đen / 512GB', 3, 3, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(152, 13, 'VN-013-4-3', N'Titan Trắng / 512GB', 4, 3, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(153, 13, 'VN-013-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(154, 13, 'VN-013-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(155, 13, 'VN-013-3-4', N'Titan Đen / 1TB', 3, 4, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(156, 13, 'VN-013-4-4', N'Titan Trắng / 1TB', 4, 4, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(157, 14, 'VN-014-1-2', N'Titan Sa Mạc / 256GB', 1, 2, 39990000.00, 42990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(158, 14, 'VN-014-2-2', N'Titan Tự Nhiên / 256GB', 2, 2, 39990000.00, 42990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(159, 14, 'VN-014-3-2', N'Titan Đen / 256GB', 3, 2, 39990000.00, 42990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(160, 14, 'VN-014-4-2', N'Titan Trắng / 256GB', 4, 2, 39990000.00, 42990000.00, 100, 33991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(161, 14, 'VN-014-1-3', N'Titan Sa Mạc / 512GB', 1, 3, 44990000.00, 47990000.00, 100, 38241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(162, 14, 'VN-014-2-3', N'Titan Tự Nhiên / 512GB', 2, 3, 44990000.00, 47990000.00, 100, 38241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(163, 14, 'VN-014-3-3', N'Titan Đen / 512GB', 3, 3, 44990000.00, 47990000.00, 100, 38241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(164, 14, 'VN-014-4-3', N'Titan Trắng / 512GB', 4, 3, 44990000.00, 47990000.00, 100, 38241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(165, 14, 'VN-014-1-4', N'Titan Sa Mạc / 1TB', 1, 4, 49990000.00, 52990000.00, 100, 42491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(166, 14, 'VN-014-2-4', N'Titan Tự Nhiên / 1TB', 2, 4, 49990000.00, 52990000.00, 100, 42491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(167, 14, 'VN-014-3-4', N'Titan Đen / 1TB', 3, 4, 49990000.00, 52990000.00, 100, 42491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(168, 14, 'VN-014-4-4', N'Titan Trắng / 1TB', 4, 4, 49990000.00, 52990000.00, 100, 42491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(169, 15, 'VN-015-8-3', N'Đen Không Gian / 512GB', 8, 3, 37990000.00, 39990000.00, 100, 32291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(170, 15, 'VN-015-6-3', N'Bạc Silver / 512GB', 6, 3, 37990000.00, 39990000.00, 100, 32291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(171, 15, 'VN-015-8-4', N'Đen Không Gian / 1TB', 8, 4, 42990000.00, 44990000.00, 100, 36541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(172, 15, 'VN-015-6-4', N'Bạc Silver / 1TB', 6, 4, 42990000.00, 44990000.00, 100, 36541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(173, 15, 'VN-015-8-5', N'Đen Không Gian / 2TB', 8, 5, 47990000.00, 49990000.00, 100, 40791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(174, 15, 'VN-015-6-5', N'Bạc Silver / 2TB', 6, 5, 47990000.00, 49990000.00, 100, 40791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(175, 16, 'VN-016-8-3', N'Đen Không Gian / 512GB', 8, 3, 47490000.00, 49990000.00, 100, 40366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(176, 16, 'VN-016-6-3', N'Bạc Silver / 512GB', 6, 3, 47490000.00, 49990000.00, 100, 40366500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(177, 16, 'VN-016-8-4', N'Đen Không Gian / 1TB', 8, 4, 52490000.00, 54990000.00, 100, 44616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(178, 16, 'VN-016-6-4', N'Bạc Silver / 1TB', 6, 4, 52490000.00, 54990000.00, 100, 44616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(179, 16, 'VN-016-8-5', N'Đen Không Gian / 2TB', 8, 5, 57490000.00, 59990000.00, 100, 48866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(180, 16, 'VN-016-6-5', N'Bạc Silver / 2TB', 6, 5, 57490000.00, 59990000.00, 100, 48866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(181, 17, 'VN-017-8-3', N'Đen Không Gian / 512GB', 8, 3, 61990000.00, 64990000.00, 100, 52691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(182, 17, 'VN-017-6-3', N'Bạc Silver / 512GB', 6, 3, 61990000.00, 64990000.00, 100, 52691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(183, 17, 'VN-017-8-4', N'Đen Không Gian / 1TB', 8, 4, 66990000.00, 69990000.00, 100, 56941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(184, 17, 'VN-017-6-4', N'Bạc Silver / 1TB', 6, 4, 66990000.00, 69990000.00, 100, 56941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(185, 17, 'VN-017-8-5', N'Đen Không Gian / 2TB', 8, 5, 71990000.00, 74990000.00, 100, 61191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(186, 17, 'VN-017-6-5', N'Bạc Silver / 2TB', 6, 5, 71990000.00, 74990000.00, 100, 61191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(187, 18, 'VN-018-8-3', N'Đen Không Gian / 512GB', 8, 3, 84990000.00, 89990000.00, 100, 72241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(188, 18, 'VN-018-6-3', N'Bạc Silver / 512GB', 6, 3, 84990000.00, 89990000.00, 100, 72241500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(189, 18, 'VN-018-8-4', N'Đen Không Gian / 1TB', 8, 4, 89990000.00, 94990000.00, 100, 76491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(190, 18, 'VN-018-6-4', N'Bạc Silver / 1TB', 6, 4, 89990000.00, 94990000.00, 100, 76491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(191, 18, 'VN-018-8-5', N'Đen Không Gian / 2TB', 8, 5, 94990000.00, 99990000.00, 100, 80741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(192, 18, 'VN-018-6-5', N'Bạc Silver / 2TB', 6, 5, 94990000.00, 99990000.00, 100, 80741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(193, 19, 'VN-019-8-3', N'Đen Không Gian / 512GB', 8, 3, 25490000.00, 27990000.00, 100, 21666500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(194, 19, 'VN-019-6-3', N'Bạc Silver / 512GB', 6, 3, 25490000.00, 27990000.00, 100, 21666500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(195, 19, 'VN-019-8-4', N'Đen Không Gian / 1TB', 8, 4, 30490000.00, 32990000.00, 100, 25916500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(196, 19, 'VN-019-6-4', N'Bạc Silver / 1TB', 6, 4, 30490000.00, 32990000.00, 100, 25916500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(197, 19, 'VN-019-8-5', N'Đen Không Gian / 2TB', 8, 5, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(198, 19, 'VN-019-6-5', N'Bạc Silver / 2TB', 6, 5, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(199, 20, 'VN-020-8-3', N'Đen Không Gian / 512GB', 8, 3, 30490000.00, 32990000.00, 100, 25916500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(200, 20, 'VN-020-6-3', N'Bạc Silver / 512GB', 6, 3, 30490000.00, 32990000.00, 100, 25916500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(201, 20, 'VN-020-8-4', N'Đen Không Gian / 1TB', 8, 4, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(202, 20, 'VN-020-6-4', N'Bạc Silver / 1TB', 6, 4, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(203, 20, 'VN-020-8-5', N'Đen Không Gian / 2TB', 8, 5, 40490000.00, 42990000.00, 100, 34416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(204, 20, 'VN-020-6-5', N'Bạc Silver / 2TB', 6, 5, 40490000.00, 42990000.00, 100, 34416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(205, 21, 'VN-021-8-3', N'Đen Không Gian / 512GB', 8, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(206, 21, 'VN-021-6-3', N'Bạc Silver / 512GB', 6, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(207, 21, 'VN-021-8-4', N'Đen Không Gian / 1TB', 8, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(208, 21, 'VN-021-6-4', N'Bạc Silver / 1TB', 6, 4, 32990000.00, 34990000.00, 100, 28041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(209, 21, 'VN-021-8-5', N'Đen Không Gian / 2TB', 8, 5, 37990000.00, 39990000.00, 100, 32291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(210, 21, 'VN-021-6-5', N'Bạc Silver / 2TB', 6, 5, 37990000.00, 39990000.00, 100, 32291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(211, 22, 'VN-022-8-3', N'Đen Không Gian / 512GB', 8, 3, 51990000.00, 54990000.00, 100, 44191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(212, 22, 'VN-022-6-3', N'Bạc Silver / 512GB', 6, 3, 51990000.00, 54990000.00, 100, 44191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(213, 22, 'VN-022-8-4', N'Đen Không Gian / 1TB', 8, 4, 56990000.00, 59990000.00, 100, 48441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(214, 22, 'VN-022-6-4', N'Bạc Silver / 1TB', 6, 4, 56990000.00, 59990000.00, 100, 48441500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(215, 22, 'VN-022-8-5', N'Đen Không Gian / 2TB', 8, 5, 61990000.00, 64990000.00, 100, 52691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(216, 22, 'VN-022-6-5', N'Bạc Silver / 2TB', 6, 5, 61990000.00, 64990000.00, 100, 52691500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(217, 23, 'VN-023-8-3', N'Đen Không Gian / 512GB', 8, 3, 89990000.00, 94990000.00, 100, 76491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(218, 23, 'VN-023-6-3', N'Bạc Silver / 512GB', 6, 3, 89990000.00, 94990000.00, 100, 76491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(219, 23, 'VN-023-8-4', N'Đen Không Gian / 1TB', 8, 4, 94990000.00, 99990000.00, 100, 80741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(220, 23, 'VN-023-6-4', N'Bạc Silver / 1TB', 6, 4, 94990000.00, 99990000.00, 100, 80741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(221, 23, 'VN-023-8-5', N'Đen Không Gian / 2TB', 8, 5, 99990000.00, 104990000.00, 100, 84991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(222, 23, 'VN-023-6-5', N'Bạc Silver / 2TB', 6, 5, 99990000.00, 104990000.00, 100, 84991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(223, 24, 'VN-024-8-3', N'Đen Không Gian / 512GB', 8, 3, 129990000.00, 139990000.00, 100, 110491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(224, 24, 'VN-024-6-3', N'Bạc Silver / 512GB', 6, 3, 129990000.00, 139990000.00, 100, 110491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(225, 24, 'VN-024-8-4', N'Đen Không Gian / 1TB', 8, 4, 134990000.00, 144990000.00, 100, 114741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(226, 24, 'VN-024-6-4', N'Bạc Silver / 1TB', 6, 4, 134990000.00, 144990000.00, 100, 114741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(227, 24, 'VN-024-8-5', N'Đen Không Gian / 2TB', 8, 5, 139990000.00, 149990000.00, 100, 118991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(228, 24, 'VN-024-6-5', N'Bạc Silver / 2TB', 6, 5, 139990000.00, 149990000.00, 100, 118991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(229, 25, 'VN-025-7-2', N'Xám Không Gian / 256GB', 7, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(230, 25, 'VN-025-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 26990000.00, 28990000.00, 100, 22941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(231, 25, 'VN-025-7-3', N'Xám Không Gian / 512GB', 7, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(232, 25, 'VN-025-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 31990000.00, 33990000.00, 100, 27191500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(233, 26, 'VN-026-7-2', N'Xám Không Gian / 256GB', 7, 2, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(234, 26, 'VN-026-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 35490000.00, 37990000.00, 100, 30166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(235, 26, 'VN-026-7-3', N'Xám Không Gian / 512GB', 7, 3, 40490000.00, 42990000.00, 100, 34416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(236, 26, 'VN-026-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 40490000.00, 42990000.00, 100, 34416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(237, 27, 'VN-027-7-2', N'Xám Không Gian / 256GB', 7, 2, 15490000.00, 16990000.00, 100, 13166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(238, 27, 'VN-027-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 15490000.00, 16990000.00, 100, 13166500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(239, 27, 'VN-027-7-3', N'Xám Không Gian / 512GB', 7, 3, 20490000.00, 21990000.00, 100, 17416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(240, 27, 'VN-027-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 20490000.00, 21990000.00, 100, 17416500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(241, 28, 'VN-028-7-2', N'Xám Không Gian / 256GB', 7, 2, 20990000.00, 22490000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(242, 28, 'VN-028-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 20990000.00, 22490000.00, 100, 17841500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(243, 28, 'VN-028-7-3', N'Xám Không Gian / 512GB', 7, 3, 25990000.00, 27490000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(244, 28, 'VN-028-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 25990000.00, 27490000.00, 100, 22091500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(245, 29, 'VN-029-7-2', N'Xám Không Gian / 256GB', 7, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(246, 29, 'VN-029-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(247, 29, 'VN-029-7-3', N'Xám Không Gian / 512GB', 7, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(248, 29, 'VN-029-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 27990000.00, 29990000.00, 100, 23791500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(249, 30, 'VN-030-7-2', N'Xám Không Gian / 256GB', 7, 2, 12990000.00, 13990000.00, 100, 11041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(250, 30, 'VN-030-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 12990000.00, 13990000.00, 100, 11041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(251, 30, 'VN-030-7-3', N'Xám Không Gian / 512GB', 7, 3, 17990000.00, 18990000.00, 100, 15291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(252, 30, 'VN-030-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 17990000.00, 18990000.00, 100, 15291500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(253, 31, 'VN-031-7-2', N'Xám Không Gian / 256GB', 7, 2, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(254, 31, 'VN-031-11-2', N'Starlight Ánh Sao / 256GB', 11, 2, 38990000.00, 41990000.00, 100, 33141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(255, 31, 'VN-031-7-3', N'Xám Không Gian / 512GB', 7, 3, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(256, 31, 'VN-031-11-3', N'Starlight Ánh Sao / 512GB', 11, 3, 43990000.00, 46990000.00, 100, 37391500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(257, 32, 'VN-032-3', N'Titan Đen', 3, NULL, 19990000.00, 21990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(258, 32, 'VN-032-2', N'Titan Tự Nhiên', 2, NULL, 19990000.00, 21990000.00, 100, 16991500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(259, 33, 'VN-033-3', N'Titan Đen', 3, NULL, 10990000.00, 11990000.00, 100, 9341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(260, 33, 'VN-033-2', N'Titan Tự Nhiên', 2, NULL, 10990000.00, 11990000.00, 100, 9341500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(261, 34, 'VN-034-3', N'Titan Đen', 3, NULL, 18490000.00, 19990000.00, 100, 15716500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(262, 34, 'VN-034-2', N'Titan Tự Nhiên', 2, NULL, 18490000.00, 19990000.00, 100, 15716500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(263, 35, 'VN-035-3', N'Titan Đen', 3, NULL, 12490000.00, 13990000.00, 100, 10616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(264, 35, 'VN-035-2', N'Titan Tự Nhiên', 2, NULL, 12490000.00, 13990000.00, 100, 10616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(265, 36, 'VN-036-3', N'Titan Đen', 3, NULL, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(266, 36, 'VN-036-2', N'Titan Tự Nhiên', 2, NULL, 22990000.00, 24990000.00, 100, 19541500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(267, 37, 'VN-037-4', N'Trắng White', 4, NULL, 5490000.00, 6190000.00, 100, 4666500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(268, 37, 'VN-037-8', N'Đen Không Gian', 8, NULL, 5490000.00, 6190000.00, 100, 4666500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(269, 38, 'VN-038-4', N'Trắng White', 4, NULL, 4290000.00, 4790000.00, 100, 3646500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(270, 38, 'VN-038-8', N'Đen Không Gian', 8, NULL, 4290000.00, 4790000.00, 100, 3646500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(271, 39, 'VN-039-4', N'Trắng White', 4, NULL, 3190000.00, 3490000.00, 100, 2711500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(272, 39, 'VN-039-8', N'Đen Không Gian', 8, NULL, 3190000.00, 3490000.00, 100, 2711500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(273, 40, 'VN-040-4', N'Trắng White', 4, NULL, 12990000.00, 13990000.00, 100, 11041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(274, 40, 'VN-040-8', N'Đen Không Gian', 8, NULL, 12990000.00, 13990000.00, 100, 11041500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(275, 41, 'VN-041-4', N'Trắng White', 4, NULL, 6990000.00, 7490000.00, 100, 5941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(276, 41, 'VN-041-8', N'Đen Không Gian', 8, NULL, 6990000.00, 7490000.00, 100, 5941500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(277, 42, 'VN-042-4-2', N'Trắng White / 256GB', 4, 2, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(278, 42, 'VN-042-6-2', N'Bạc Silver / 256GB', 6, 2, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(279, 42, 'VN-042-4-3', N'Trắng White / 512GB', 4, 3, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(280, 42, 'VN-042-6-3', N'Bạc Silver / 512GB', 6, 3, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(281, 43, 'VN-043-4-2', N'Trắng White / 256GB', 4, 2, 13990000.00, 14990000.00, 100, 11891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(282, 43, 'VN-043-6-2', N'Bạc Silver / 256GB', 6, 2, 13990000.00, 14990000.00, 100, 11891500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(283, 43, 'VN-043-4-3', N'Trắng White / 512GB', 4, 3, 18990000.00, 19990000.00, 100, 16141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(284, 43, 'VN-043-6-3', N'Bạc Silver / 512GB', 6, 3, 18990000.00, 19990000.00, 100, 16141500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(285, 44, 'VN-044-4-2', N'Trắng White / 256GB', 4, 2, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(286, 44, 'VN-044-6-2', N'Bạc Silver / 256GB', 6, 2, 32490000.00, 34990000.00, 100, 27616500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(287, 44, 'VN-044-4-3', N'Trắng White / 512GB', 4, 3, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(288, 44, 'VN-044-6-3', N'Bạc Silver / 512GB', 6, 3, 37490000.00, 39990000.00, 100, 31866500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(289, 45, 'VN-045-4-2', N'Trắng White / 256GB', 4, 2, 109990000.00, 114990000.00, 100, 93491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(290, 45, 'VN-045-6-2', N'Bạc Silver / 256GB', 6, 2, 109990000.00, 114990000.00, 100, 93491500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(291, 45, 'VN-045-4-3', N'Trắng White / 512GB', 4, 3, 114990000.00, 119990000.00, 100, 97741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(292, 45, 'VN-045-6-3', N'Bạc Silver / 512GB', 6, 3, 114990000.00, 119990000.00, 100, 97741500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(293, 46, 'VN-046-4', N'Trắng White', 4, NULL, 3190000.00, 3490000.00, 100, 2711500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(294, 46, 'VN-046-6', N'Bạc Silver', 6, NULL, 3190000.00, 3490000.00, 100, 2711500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(295, 47, 'VN-047-4', N'Trắng White', 4, NULL, 8990000.00, 9790000.00, 100, 7641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(296, 47, 'VN-047-6', N'Bạc Silver', 6, NULL, 8990000.00, 9790000.00, 100, 7641500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(297, 48, 'VN-048-4', N'Trắng White', 4, NULL, 1290000.00, 1490000.00, 100, 1096500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(298, 48, 'VN-048-6', N'Bạc Silver', 6, NULL, 1290000.00, 1490000.00, 100, 1096500.00, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductVariants] OFF;

    -- 12. PRODUCT VARIANT VALUES
INSERT INTO [catalog].[ProductVariantValues] ([VariantId], [OptionValueId]) VALUES
(1, 1),
(1, 5),
(2, 2),
(2, 5),
(3, 3),
(3, 5),
(4, 4),
(4, 5),
(5, 1),
(5, 6),
(6, 2),
(6, 6),
(7, 3),
(7, 6),
(8, 4),
(8, 6),
(9, 1),
(9, 7),
(10, 2),
(10, 7),
(11, 3),
(11, 7),
(12, 4),
(12, 7),
(13, 8),
(13, 12),
(14, 9),
(14, 12),
(15, 10),
(15, 12),
(16, 11),
(16, 12),
(17, 8),
(17, 13),
(18, 9),
(18, 13),
(19, 10),
(19, 13),
(20, 11),
(20, 13),
(21, 8),
(21, 14),
(22, 9),
(22, 14),
(23, 10),
(23, 14),
(24, 11),
(24, 14),
(25, 15),
(25, 19),
(26, 16),
(26, 19),
(27, 17),
(27, 19),
(28, 18),
(28, 19),
(29, 15),
(29, 20),
(30, 16),
(30, 20),
(31, 17),
(31, 20),
(32, 18),
(32, 20),
(33, 15),
(33, 21),
(34, 16),
(34, 21),
(35, 17),
(35, 21),
(36, 18),
(36, 21),
(37, 22),
(37, 26),
(38, 23),
(38, 26),
(39, 24),
(39, 26),
(40, 25),
(40, 26),
(41, 22),
(41, 27),
(42, 23),
(42, 27),
(43, 24),
(43, 27),
(44, 25),
(44, 27),
(45, 22),
(45, 28),
(46, 23),
(46, 28),
(47, 24),
(47, 28),
(48, 25),
(48, 28),
(49, 29),
(49, 33),
(50, 30),
(50, 33),
(51, 31),
(51, 33),
(52, 32),
(52, 33),
(53, 29),
(53, 34),
(54, 30),
(54, 34),
(55, 31),
(55, 34),
(56, 32),
(56, 34),
(57, 29),
(57, 35),
(58, 30),
(58, 35),
(59, 31),
(59, 35),
(60, 32),
(60, 35),
(61, 36),
(61, 40),
(62, 37),
(62, 40),
(63, 38),
(63, 40),
(64, 39),
(64, 40),
(65, 36),
(65, 41),
(66, 37),
(66, 41),
(67, 38),
(67, 41),
(68, 39),
(68, 41),
(69, 36),
(69, 42),
(70, 37),
(70, 42),
(71, 38),
(71, 42),
(72, 39),
(72, 42),
(73, 43),
(73, 47),
(74, 44),
(74, 47),
(75, 45),
(75, 47),
(76, 46),
(76, 47),
(77, 43),
(77, 48),
(78, 44),
(78, 48),
(79, 45),
(79, 48),
(80, 46),
(80, 48),
(81, 43),
(81, 49),
(82, 44),
(82, 49),
(83, 45),
(83, 49),
(84, 46),
(84, 49),
(85, 50),
(85, 54),
(86, 51),
(86, 54),
(87, 52),
(87, 54),
(88, 53),
(88, 54),
(89, 50),
(89, 55),
(90, 51),
(90, 55),
(91, 52),
(91, 55),
(92, 53),
(92, 55),
(93, 50),
(93, 56),
(94, 51),
(94, 56),
(95, 52),
(95, 56),
(96, 53),
(96, 56),
(97, 57),
(97, 61),
(98, 58),
(98, 61),
(99, 59),
(99, 61),
(100, 60),
(100, 61),
(101, 57),
(101, 62),
(102, 58),
(102, 62),
(103, 59),
(103, 62),
(104, 60),
(104, 62),
(105, 57),
(105, 63),
(106, 58),
(106, 63),
(107, 59),
(107, 63),
(108, 60),
(108, 63),
(109, 64),
(109, 68),
(110, 65),
(110, 68),
(111, 66),
(111, 68),
(112, 67),
(112, 68),
(113, 64),
(113, 69),
(114, 65),
(114, 69),
(115, 66),
(115, 69),
(116, 67),
(116, 69),
(117, 64),
(117, 70),
(118, 65),
(118, 70),
(119, 66),
(119, 70),
(120, 67),
(120, 70),
(121, 71),
(121, 75),
(122, 72),
(122, 75),
(123, 73),
(123, 75),
(124, 74),
(124, 75),
(125, 71),
(125, 76),
(126, 72),
(126, 76),
(127, 73),
(127, 76),
(128, 74),
(128, 76),
(129, 71),
(129, 77),
(130, 72),
(130, 77),
(131, 73),
(131, 77),
(132, 74),
(132, 77),
(133, 78),
(133, 82),
(134, 79),
(134, 82),
(135, 80),
(135, 82),
(136, 81),
(136, 82),
(137, 78),
(137, 83),
(138, 79),
(138, 83),
(139, 80),
(139, 83),
(140, 81),
(140, 83),
(141, 78),
(141, 84),
(142, 79),
(142, 84),
(143, 80),
(143, 84),
(144, 81),
(144, 84),
(145, 85),
(145, 89),
(146, 86),
(146, 89),
(147, 87),
(147, 89),
(148, 88),
(148, 89),
(149, 85),
(149, 90),
(150, 86),
(150, 90),
(151, 87),
(151, 90),
(152, 88),
(152, 90),
(153, 85),
(153, 91),
(154, 86),
(154, 91),
(155, 87),
(155, 91),
(156, 88),
(156, 91),
(157, 92),
(157, 96),
(158, 93),
(158, 96),
(159, 94),
(159, 96),
(160, 95),
(160, 96),
(161, 92),
(161, 97),
(162, 93),
(162, 97),
(163, 94),
(163, 97),
(164, 95),
(164, 97),
(165, 92),
(165, 98),
(166, 93),
(166, 98),
(167, 94),
(167, 98),
(168, 95),
(168, 98),
(169, 99),
(169, 101),
(170, 100),
(170, 101),
(171, 99),
(171, 102),
(172, 100),
(172, 102),
(173, 99),
(173, 103),
(174, 100),
(174, 103),
(175, 104),
(175, 106),
(176, 105),
(176, 106),
(177, 104),
(177, 107),
(178, 105),
(178, 107),
(179, 104),
(179, 108),
(180, 105),
(180, 108),
(181, 109),
(181, 111),
(182, 110),
(182, 111),
(183, 109),
(183, 112),
(184, 110),
(184, 112),
(185, 109),
(185, 113),
(186, 110),
(186, 113),
(187, 114),
(187, 116),
(188, 115),
(188, 116),
(189, 114),
(189, 117),
(190, 115),
(190, 117),
(191, 114),
(191, 118),
(192, 115),
(192, 118),
(193, 119),
(193, 121),
(194, 120),
(194, 121),
(195, 119),
(195, 122),
(196, 120),
(196, 122),
(197, 119),
(197, 123),
(198, 120),
(198, 123),
(199, 124),
(199, 126),
(200, 125),
(200, 126),
(201, 124),
(201, 127),
(202, 125),
(202, 127),
(203, 124),
(203, 128),
(204, 125),
(204, 128),
(205, 129),
(205, 131),
(206, 130),
(206, 131),
(207, 129),
(207, 132),
(208, 130),
(208, 132),
(209, 129),
(209, 133),
(210, 130),
(210, 133),
(211, 134),
(211, 136),
(212, 135),
(212, 136),
(213, 134),
(213, 137),
(214, 135),
(214, 137),
(215, 134),
(215, 138),
(216, 135),
(216, 138),
(217, 139),
(217, 141),
(218, 140),
(218, 141),
(219, 139),
(219, 142),
(220, 140),
(220, 142),
(221, 139),
(221, 143),
(222, 140),
(222, 143),
(223, 144),
(223, 146),
(224, 145),
(224, 146),
(225, 144),
(225, 147),
(226, 145),
(226, 147),
(227, 144),
(227, 148),
(228, 145),
(228, 148),
(229, 149),
(229, 151),
(230, 150),
(230, 151),
(231, 149),
(231, 152),
(232, 150),
(232, 152),
(233, 153),
(233, 155),
(234, 154),
(234, 155),
(235, 153),
(235, 156),
(236, 154),
(236, 156),
(237, 157),
(237, 159),
(238, 158),
(238, 159),
(239, 157),
(239, 160),
(240, 158),
(240, 160),
(241, 161),
(241, 163),
(242, 162),
(242, 163),
(243, 161),
(243, 164),
(244, 162),
(244, 164),
(245, 165),
(245, 167),
(246, 166),
(246, 167),
(247, 165),
(247, 168),
(248, 166),
(248, 168),
(249, 169),
(249, 171),
(250, 170),
(250, 171),
(251, 169),
(251, 172),
(252, 170),
(252, 172),
(253, 173),
(253, 175),
(254, 174),
(254, 175),
(255, 173),
(255, 176),
(256, 174),
(256, 176),
(257, 177),
(258, 178),
(259, 179),
(260, 180),
(261, 181),
(262, 182),
(263, 183),
(264, 184),
(265, 185),
(266, 186),
(267, 187),
(268, 188),
(269, 189),
(270, 190),
(271, 191),
(272, 192),
(273, 193),
(274, 194),
(275, 195),
(276, 196),
(277, 197),
(277, 199),
(278, 198),
(278, 199),
(279, 197),
(279, 200),
(280, 198),
(280, 200),
(281, 201),
(281, 203),
(282, 202),
(282, 203),
(283, 201),
(283, 204),
(284, 202),
(284, 204),
(285, 205),
(285, 207),
(286, 206),
(286, 207),
(287, 205),
(287, 208),
(288, 206),
(288, 208),
(289, 209),
(289, 211),
(290, 210),
(290, 211),
(291, 209),
(291, 212),
(292, 210),
(292, 212),
(293, 213),
(294, 214),
(295, 215),
(296, 216),
(297, 217),
(298, 218);

    -- 13. SPECIFICATION GROUPS & SPECIFICATIONS
SET IDENTITY_INSERT [catalog].[ProductSpecificationGroups] ON;
INSERT INTO [catalog].[ProductSpecificationGroups] ([Id], [ProductId], [Name], [DisplayOrder], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 2, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 2, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 3, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 3, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 4, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 4, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 5, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 5, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 6, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 6, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 7, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 7, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 8, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 8, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 9, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 9, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 10, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 10, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 11, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 11, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 12, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 12, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 13, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 13, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 14, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 14, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 15, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 15, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 16, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 16, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 17, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 17, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 18, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 18, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 19, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 19, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 20, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 20, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 21, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 21, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 22, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 22, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 23, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 23, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 24, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 24, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 25, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 25, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 26, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 26, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 27, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 27, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 28, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 28, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 29, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 29, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 30, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 30, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 31, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 31, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 32, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 32, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 33, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 33, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 34, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 34, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 35, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 35, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 36, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 36, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 37, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 37, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 38, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 38, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 39, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 39, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 40, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 40, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 41, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 41, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 42, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(84, 42, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(85, 43, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(86, 43, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(87, 44, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(88, 44, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 45, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(90, 45, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(91, 46, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(92, 46, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(93, 47, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(94, 47, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(95, 48, N'Hiệu năng & Vi xử lý', 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(96, 48, N'Màn hình & Hiển thị', 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductSpecificationGroups] OFF;

SET IDENTITY_INSERT [catalog].[ProductSpecifications] ON;
INSERT INTO [catalog].[ProductSpecifications] ([Id], [GroupId], [Name], [Value], [Unit], [DisplayOrder], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 1, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 1, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 2, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 3, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 3, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 4, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 5, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 5, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 6, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 7, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 7, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 8, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 9, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 9, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 10, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 11, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 11, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 12, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 13, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 13, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 14, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 15, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 15, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 16, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 17, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 17, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 18, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 19, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 19, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 20, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 21, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 21, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 22, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 23, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 23, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 24, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 25, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 25, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 26, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 27, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 27, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 28, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 29, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 29, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 30, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(46, 31, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(47, 31, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(48, 32, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(49, 33, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(50, 33, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(51, 34, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(52, 35, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(53, 35, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(54, 36, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(55, 37, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(56, 37, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(57, 38, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(58, 39, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(59, 39, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(60, 40, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(61, 41, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(62, 41, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(63, 42, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(64, 43, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(65, 43, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(66, 44, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(67, 45, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(68, 45, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(69, 46, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(70, 47, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(71, 47, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(72, 48, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(73, 49, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(74, 49, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(75, 50, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(76, 51, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(77, 51, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(78, 52, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(79, 53, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(80, 53, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(81, 54, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(82, 55, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(83, 55, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(84, 56, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(85, 57, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(86, 57, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(87, 58, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(88, 59, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 59, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(90, 60, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(91, 61, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(92, 61, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(93, 62, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(94, 63, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(95, 63, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(96, 64, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(97, 65, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(98, 65, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(99, 66, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(100, 67, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(101, 67, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(102, 68, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(103, 69, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(104, 69, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(105, 70, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(106, 71, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(107, 71, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(108, 72, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(109, 73, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(110, 73, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(111, 74, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(112, 75, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(113, 75, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(114, 76, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(115, 77, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(116, 77, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(117, 78, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(118, 79, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(119, 79, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(120, 80, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(121, 81, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(122, 81, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(123, 82, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(124, 83, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(125, 83, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(126, 84, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(127, 85, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(128, 85, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(129, 86, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(130, 87, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(131, 87, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(132, 88, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(133, 89, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(134, 89, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(135, 90, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(136, 91, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(137, 91, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(138, 92, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(139, 93, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(140, 93, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(141, 94, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(142, 95, N'Chipset', N'Apple Silicon thế hệ mới tối ưu Apple Intelligence', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(143, 95, N'Neural Engine', N'16-core Neural Engine thế hệ tiên tiến', NULL, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(144, 96, N'Công nghệ màn hình', N'Super Retina XDR / Liquid Retina công nghệ True Tone', NULL, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [catalog].[ProductSpecifications] OFF;

    -- 14. VOUCHERS
SET IDENTITY_INSERT [sales].[Vouchers] ON;
INSERT INTO [sales].[Vouchers] ([Id], [Code], [Name], [Description], [DiscountType], [DiscountValue], [MinOrderAmount], [MaxDiscountAmount], [StartDate], [EndDate], [UsageLimit], [UsageCount], [PerUserLimit], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 'APPLE2026', N'Ưu đãi năm mới 2026', N'Giảm 10% tối đa 1.000.000đ cho đơn hàng từ 10.000.000đ', 'Percentage', 10.00, 10000000.00, 1000000.00, '2026-01-01T00:00:00+00:00', '2026-12-31T23:59:59+00:00', 500, 32, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 'CHAOBANMOI', N'Chào bạn mới Urban Stitch', N'Giảm ngay 500.000đ cho đơn hàng đầu tiên từ 5.000.000đ', 'FixedAmount', 500000.00, 5000000.00, NULL, '2026-01-01T00:00:00+00:00', '2026-12-31T23:59:59+00:00', 1000, 18, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 'VIPAPPLE', N'Đặc quyền khách hàng VIP', N'Giảm 15% tối đa 3.000.000đ cho đơn hàng từ 25.000.000đ', 'Percentage', 15.00, 25000000.00, 3000000.00, '2026-01-01T00:00:00+00:00', '2026-12-31T23:59:59+00:00', 200, 12, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 'MACPRO2026', N'Khởi sắc sáng tạo cùng Mac Pro', N'Giảm ngay 2.000.000đ khi sắm dòng máy tính Mac trên 30.000.000đ', 'FixedAmount', 2000000.00, 30000000.00, NULL, '2026-01-01T00:00:00+00:00', '2026-12-31T23:59:59+00:00', 100, 9, 1, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 'PHUKIEN50K', N'Ưu đãi Phụ kiện Apple', N'Giảm 50.000đ cho đơn hàng phụ kiện từ 500.000đ', 'FixedAmount', 50000.00, 500000.00, NULL, '2026-01-01T00:00:00+00:00', '2026-12-31T23:59:59+00:00', 500, 15, 2, 1, '2026-01-01T00:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [sales].[Vouchers] OFF;

    -- 15. ORDERS
SET IDENTITY_INSERT [sales].[Orders] ON;
INSERT INTO [sales].[Orders] ([Id], [OrderNumber], [UserId], [GuestId], [Status], [PaymentMethod], [PaymentStatus], [RecipientName], [RecipientPhone], [RecipientEmail], [ShippingAddressLine], [ShippingWard], [ShippingDistrict], [ShippingProvince], [CustomerNote], [Subtotal], [ShippingFee], [DiscountAmount], [TotalAmount], [VoucherId], [VoucherCode], [PlacedAt], [StatusHistoryJson], [ShippingAddressUpdateCount], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy]) VALUES
(1, 'US2600001', 1003, NULL, 'Delivered', 'COD', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 36990000.00, 0.00, 0.00, 36990000.00, NULL, NULL, '2026-01-11T09:37:00+07:00', N'[{"status": "Pending", "changedAt": "2026-01-11T09:37:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-01-11T11:37:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-01-11T15:37:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-01-12T09:37:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-01-11T09:37:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(2, 'US2600002', 1004, NULL, 'Completed', 'VNPAY', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 26990000.00, 0.00, 0.00, 26990000.00, NULL, NULL, '2026-01-17T10:44:00+07:00', N'[{"status": "Pending", "changedAt": "2026-01-17T10:44:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-01-17T12:44:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-01-17T16:44:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-01-18T10:44:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-01-18T13:44:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-01-17T10:44:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(3, 'US2600003', 1005, NULL, 'Cancelled', 'COD', 'Failed', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 57980000.00, 0.00, 0.00, 57980000.00, NULL, NULL, '2026-01-23T11:51:00+07:00', N'[{"status": "Pending", "changedAt": "2026-01-23T11:51:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Cancelled", "changedAt": "2026-01-23T12:51:00+07:00", "note": "Khách hàng hủy đơn hoặc thay đổi phương thức."}]', 0, 1, '2026-01-23T11:51:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(4, 'US2600004', 1006, NULL, 'Delivered', 'VNPAY', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 28990000.00, 0.00, 1000000.00, 27990000.00, 1, 'APPLE2026', '2026-01-29T12:58:00+07:00', N'[{"status": "Pending", "changedAt": "2026-01-29T12:58:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-01-29T14:58:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-01-29T18:58:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-01-30T12:58:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-01-29T12:58:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(5, 'US2600005', 1002, NULL, 'Delivered', 'COD', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 33990000.00, 0.00, 500000.00, 33490000.00, 2, 'CHAOBANMOI', '2026-02-04T14:05:00+07:00', N'[{"status": "Pending", "changedAt": "2026-02-04T14:05:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-02-04T16:05:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-02-04T20:05:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-02-05T14:05:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-02-04T14:05:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(6, 'US2600006', 1003, NULL, 'Completed', 'VNPAY', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 50980000.00, 0.00, 0.00, 50980000.00, NULL, NULL, '2026-02-10T15:12:00+07:00', N'[{"status": "Pending", "changedAt": "2026-02-10T15:12:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-02-10T17:12:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-02-10T21:12:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-02-11T15:12:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-02-11T18:12:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-02-10T15:12:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(7, 'US2600007', 1004, NULL, 'Completed', 'COD', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 27490000.00, 0.00, 0.00, 27490000.00, NULL, NULL, '2026-02-16T16:19:00+07:00', N'[{"status": "Pending", "changedAt": "2026-02-16T16:19:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-02-16T18:19:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-02-16T22:19:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-02-17T16:19:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-02-17T19:19:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-02-16T16:19:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(8, 'US2600008', 1005, NULL, 'Delivered', 'VNPAY', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 37490000.00, 0.00, 1000000.00, 36490000.00, 1, 'APPLE2026', '2026-02-22T17:26:00+07:00', N'[{"status": "Pending", "changedAt": "2026-02-22T17:26:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-02-22T19:26:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-02-22T23:26:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-02-23T17:26:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-02-22T17:26:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(9, 'US2600009', 1006, NULL, 'Completed', 'COD', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 63480000.00, 0.00, 0.00, 63480000.00, NULL, NULL, '2026-02-28T17:33:00+07:00', N'[{"status": "Pending", "changedAt": "2026-02-28T17:33:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-02-28T19:33:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-02-28T23:33:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-03-01T17:33:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-03-01T20:33:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-02-28T17:33:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(10, 'US2600010', 1002, NULL, 'Completed', 'VNPAY', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 33490000.00, 0.00, 500000.00, 32990000.00, 2, 'CHAOBANMOI', '2026-03-06T18:40:00+07:00', N'[{"status": "Pending", "changedAt": "2026-03-06T18:40:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-03-06T20:40:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-03-07T00:40:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-03-07T18:40:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-03-07T21:40:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-03-06T18:40:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(11, 'US2600011', 1003, NULL, 'Cancelled', 'COD', 'Failed', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 24990000.00, 0.00, 0.00, 24990000.00, NULL, NULL, '2026-03-12T19:47:00+07:00', N'[{"status": "Pending", "changedAt": "2026-03-12T19:47:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Cancelled", "changedAt": "2026-03-12T20:47:00+07:00", "note": "Khách hàng hủy đơn hoặc thay đổi phương thức."}]', 0, 1, '2026-03-12T19:47:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(12, 'US2600012', 1004, NULL, 'Completed', 'VNPAY', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 57480000.00, 0.00, 1000000.00, 56480000.00, 1, 'APPLE2026', '2026-03-18T08:54:00+07:00', N'[{"status": "Pending", "changedAt": "2026-03-18T08:54:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-03-18T10:54:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-03-18T14:54:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-03-19T08:54:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-03-19T11:54:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-03-18T08:54:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(13, 'US2600013', 1005, NULL, 'Completed', 'COD', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 22490000.00, 0.00, 0.00, 22490000.00, NULL, NULL, '2026-03-24T10:01:00+07:00', N'[{"status": "Pending", "changedAt": "2026-03-24T10:01:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-03-24T12:01:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-03-24T16:01:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-03-25T10:01:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-03-25T13:01:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-03-24T10:01:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(14, 'US2600014', 1006, NULL, 'Shipping', 'VNPAY', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 22990000.00, 0.00, 0.00, 22990000.00, NULL, NULL, '2026-03-30T11:08:00+07:00', N'[{"status": "Pending", "changedAt": "2026-03-30T11:08:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-03-30T13:08:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-03-30T17:08:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}]', 0, 1, '2026-03-30T11:08:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(15, 'US2600015', 1002, NULL, 'Completed', 'COD', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 63480000.00, 0.00, 500000.00, 62980000.00, 2, 'CHAOBANMOI', '2026-04-05T12:15:00+07:00', N'[{"status": "Pending", "changedAt": "2026-04-05T12:15:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-04-05T14:15:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-04-05T18:15:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-04-06T12:15:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-04-06T15:15:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-04-05T12:15:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(16, 'US2600016', 1003, NULL, 'Completed', 'VNPAY', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 34990000.00, 0.00, 1000000.00, 33990000.00, 1, 'APPLE2026', '2026-04-11T13:22:00+07:00', N'[{"status": "Pending", "changedAt": "2026-04-11T13:22:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-04-11T15:22:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-04-11T19:22:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-04-12T13:22:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-04-12T16:22:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-04-11T13:22:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(17, 'US2600017', 1004, NULL, 'Completed', 'COD', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 39990000.00, 0.00, 0.00, 39990000.00, NULL, NULL, '2026-04-17T14:29:00+07:00', N'[{"status": "Pending", "changedAt": "2026-04-17T14:29:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-04-17T16:29:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-04-17T20:29:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-04-18T14:29:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-04-18T17:29:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-04-17T14:29:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(18, 'US2600018', 1005, NULL, 'Completed', 'VNPAY', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 76480000.00, 0.00, 0.00, 76480000.00, NULL, NULL, '2026-04-23T14:36:00+07:00', N'[{"status": "Pending", "changedAt": "2026-04-23T14:36:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-04-23T16:36:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-04-23T20:36:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-04-24T14:36:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-04-24T17:36:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-04-23T14:36:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(19, 'US2600019', 1006, NULL, 'Completed', 'COD', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 35990000.00, 0.00, 0.00, 35990000.00, NULL, NULL, '2026-04-29T15:43:00+07:00', N'[{"status": "Pending", "changedAt": "2026-04-29T15:43:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-04-29T17:43:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-04-29T21:43:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-04-30T15:43:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-04-30T18:43:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-04-29T15:43:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(20, 'US2600020', 1002, NULL, 'Pending', 'COD', 'Pending', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 45990000.00, 0.00, 1000000.00, 44990000.00, 1, 'APPLE2026', '2026-05-05T16:50:00+07:00', N'[{"status": "Pending", "changedAt": "2026-05-05T16:50:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}]', 0, 1, '2026-05-05T16:50:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(21, 'US2600021', 1003, NULL, 'Completed', 'COD', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 46980000.00, 0.00, 0.00, 46980000.00, NULL, NULL, '2026-05-11T17:57:00+07:00', N'[{"status": "Pending", "changedAt": "2026-05-11T17:57:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-05-11T19:57:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-05-11T23:57:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-05-12T17:57:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-05-12T20:57:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-05-11T17:57:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(22, 'US2600022', 1004, NULL, 'Pending', 'COD', 'Pending', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 43990000.00, 0.00, 0.00, 43990000.00, NULL, NULL, '2026-05-17T19:04:00+07:00', N'[{"status": "Pending", "changedAt": "2026-05-17T19:04:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}]', 0, 1, '2026-05-17T19:04:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(23, 'US2600023', 1005, NULL, 'Completed', 'COD', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 44990000.00, 0.00, 0.00, 44990000.00, NULL, NULL, '2026-05-23T20:11:00+07:00', N'[{"status": "Pending", "changedAt": "2026-05-23T20:11:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-05-23T22:11:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-05-24T02:11:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-05-24T20:11:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-05-24T23:11:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-05-23T20:11:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(24, 'US2600024', 1006, NULL, 'Shipping', 'VNPAY', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 64980000.00, 0.00, 1000000.00, 63980000.00, 1, 'APPLE2026', '2026-05-29T09:18:00+07:00', N'[{"status": "Pending", "changedAt": "2026-05-29T09:18:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-05-29T11:18:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-05-29T15:18:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}]', 0, 1, '2026-05-29T09:18:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(25, 'US2600025', 1002, NULL, 'Pending', 'VNPAY', 'Pending', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 47490000.00, 0.00, 500000.00, 46990000.00, 2, 'CHAOBANMOI', '2026-06-04T10:25:00+07:00', N'[{"status": "Pending", "changedAt": "2026-06-04T10:25:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}]', 0, 1, '2026-06-04T10:25:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(26, 'US2600026', 1003, NULL, 'Shipping', 'VNPAY', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 66990000.00, 0.00, 0.00, 66990000.00, NULL, NULL, '2026-06-10T10:32:00+07:00', N'[{"status": "Pending", "changedAt": "2026-06-10T10:32:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-06-10T12:32:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-06-10T16:32:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}]', 0, 1, '2026-06-10T10:32:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(27, 'US2600027', 1004, NULL, 'Confirmed', 'COD', 'Pending', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 122480000.00, 0.00, 0.00, 122480000.00, NULL, NULL, '2026-06-16T11:39:00+07:00', N'[{"status": "Pending", "changedAt": "2026-06-16T11:39:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-06-16T13:39:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}]', 0, 1, '2026-06-16T11:39:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(28, 'US2600028', 1005, NULL, 'Completed', 'VNPAY', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 35490000.00, 0.00, 1000000.00, 34490000.00, 1, 'APPLE2026', '2026-06-22T12:46:00+07:00', N'[{"status": "Pending", "changedAt": "2026-06-22T12:46:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-06-22T14:46:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-06-22T18:46:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-06-23T12:46:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-06-23T15:46:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-06-22T12:46:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(29, 'US2600029', 1006, NULL, 'Completed', 'COD', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 40490000.00, 0.00, 0.00, 40490000.00, NULL, NULL, '2026-06-28T13:53:00+07:00', N'[{"status": "Pending", "changedAt": "2026-06-28T13:53:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-06-28T15:53:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-06-28T19:53:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-06-29T13:53:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-06-29T16:53:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-06-28T13:53:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(30, 'US2600030', 1002, NULL, 'Completed', 'VNPAY', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 79480000.00, 0.00, 500000.00, 78980000.00, 2, 'CHAOBANMOI', '2026-07-04T15:00:00+07:00', N'[{"status": "Pending", "changedAt": "2026-07-04T15:00:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-07-04T17:00:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-07-04T21:00:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-07-05T15:00:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-07-05T18:00:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-07-04T15:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(31, 'US2600031', 1003, NULL, 'Completed', 'COD', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 89990000.00, 0.00, 0.00, 89990000.00, NULL, NULL, '2026-07-10T16:07:00+07:00', N'[{"status": "Pending", "changedAt": "2026-07-10T16:07:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-07-10T18:07:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-07-10T22:07:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-07-11T16:07:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-07-11T19:07:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-07-10T16:07:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(32, 'US2600032', 1004, NULL, 'Completed', 'VNPAY', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 134990000.00, 0.00, 1000000.00, 133990000.00, 1, 'APPLE2026', '2026-07-16T17:14:00+07:00', N'[{"status": "Pending", "changedAt": "2026-07-16T17:14:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-07-16T19:14:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-07-16T23:14:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-07-17T17:14:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-07-17T20:14:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-07-16T17:14:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(33, 'US2600033', 1005, NULL, 'Completed', 'COD', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 72980000.00, 0.00, 0.00, 72980000.00, NULL, NULL, '2026-07-22T18:21:00+07:00', N'[{"status": "Pending", "changedAt": "2026-07-22T18:21:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-07-22T20:21:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-07-23T00:21:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-07-23T18:21:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-07-23T21:21:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-07-22T18:21:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(34, 'US2600034', 1006, NULL, 'Delivered', 'VNPAY', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 20490000.00, 0.00, 0.00, 20490000.00, NULL, NULL, '2026-07-28T19:28:00+07:00', N'[{"status": "Pending", "changedAt": "2026-07-28T19:28:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-07-28T21:28:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-07-29T01:28:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-07-29T19:28:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-07-28T19:28:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(35, 'US2600035', 1002, NULL, 'Shipping', 'COD', 'Pending', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 22990000.00, 0.00, 500000.00, 22490000.00, 2, 'CHAOBANMOI', '2026-08-03T19:35:00+07:00', N'[{"status": "Pending", "changedAt": "2026-08-03T19:35:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-08-03T21:35:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-08-04T01:35:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}]', 0, 1, '2026-08-03T19:35:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(36, 'US2600036', 1003, NULL, 'Confirmed', 'VNPAY', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 81980000.00, 0.00, 1000000.00, 80980000.00, 1, 'APPLE2026', '2026-08-09T08:42:00+07:00', N'[{"status": "Pending", "changedAt": "2026-08-09T08:42:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-08-09T10:42:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}]', 0, 1, '2026-08-09T08:42:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(37, 'US2600037', 1004, NULL, 'Delivered', 'COD', 'Paid', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 10990000.00, 30000.00, 0.00, 11020000.00, NULL, NULL, '2026-08-15T09:49:00+07:00', N'[{"status": "Pending", "changedAt": "2026-08-15T09:49:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-08-15T11:49:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-08-15T15:49:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-08-16T09:49:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}]', 0, 1, '2026-08-15T09:49:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(38, 'US2600038', 1005, NULL, 'Confirmed', 'VNPAY', 'Paid', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 10980000.00, 30000.00, 0.00, 11010000.00, NULL, NULL, '2026-08-21T10:56:00+07:00', N'[{"status": "Pending", "changedAt": "2026-08-21T10:56:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-08-21T12:56:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}]', 0, 1, '2026-08-21T10:56:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(39, 'US2600039', 1006, NULL, 'Confirmed', 'COD', 'Pending', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 50980000.00, 0.00, 0.00, 50980000.00, NULL, NULL, '2026-08-27T12:03:00+07:00', N'[{"status": "Pending", "changedAt": "2026-08-27T12:03:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-08-27T14:03:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}]', 0, 1, '2026-08-27T12:03:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(40, 'US2600040', 1002, NULL, 'Completed', 'VNPAY', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 13990000.00, 30000.00, 1000000.00, 13020000.00, 1, 'APPLE2026', '2026-09-02T13:10:00+07:00', N'[{"status": "Pending", "changedAt": "2026-09-02T13:10:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-09-02T15:10:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-09-02T19:10:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-09-03T13:10:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-09-03T16:10:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-09-02T13:10:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(41, 'US2600041', 1003, NULL, 'Completed', 'COD', 'Paid', N'Hoàng Nam Trần', '0903112233', 'hoang.nam@apple-store.com', N'Tầng 5 Keangnam Landmark, Phạm Hùng', N'Phường Mễ Trì', N'Quận Nam Từ Liêm', N'Hà Nội', N'Giao giờ hành chính, gọi trước 15 phút', 37490000.00, 0.00, 0.00, 37490000.00, NULL, NULL, '2026-09-08T14:17:00+07:00', N'[{"status": "Pending", "changedAt": "2026-09-08T14:17:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-09-08T16:17:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-09-08T20:17:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-09-09T14:17:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-09-09T17:17:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-09-08T14:17:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(42, 'US2600042', 1004, NULL, 'Pending', 'COD', 'Pending', N'Thu Trang Nguyễn', '0938445566', 'thu.trang@apple-store.com', N'88 Nguyễn Huệ, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 30970000.00, 0.00, 0.00, 30970000.00, NULL, NULL, '2026-09-14T15:24:00+07:00', N'[{"status": "Pending", "changedAt": "2026-09-14T15:24:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}]', 0, 1, '2026-09-14T15:24:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(43, 'US2600043', 1005, NULL, 'Shipping', 'COD', 'Pending', N'Quốc Bảo Lê', '0977889900', 'quoc.bao@apple-store.com', N'124 Bạch Đằng, Hải Châu', N'Phường Thạch Thang', N'Quận Hải Châu', N'Đà Nẵng', N'Giao giờ hành chính, gọi trước 15 phút', 31990000.00, 0.00, 0.00, 31990000.00, NULL, NULL, '2026-09-20T15:31:00+07:00', N'[{"status": "Pending", "changedAt": "2026-09-20T15:31:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-09-20T17:31:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-09-20T21:31:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}]', 0, 1, '2026-09-20T15:31:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(44, 'US2600044', 1006, NULL, 'Completed', 'VNPAY', 'Paid', N'Khánh Linh Vũ', '0966554433', 'khanh.linh@apple-store.com', N'56 Hoàng Diệu, Hồng Bàng', N'Phường Minh Khai', N'Quận Hồng Bàng', N'Hải Phòng', N'Giao giờ hành chính, gọi trước 15 phút', 41990000.00, 0.00, 1000000.00, 40990000.00, 1, 'APPLE2026', '2026-09-26T16:38:00+07:00', N'[{"status": "Pending", "changedAt": "2026-09-26T16:38:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-09-26T18:38:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-09-26T22:38:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-09-27T16:38:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-09-27T19:38:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-09-26T16:38:00+07:00', NULL, NULL, NULL, 0, NULL, NULL),
(45, 'US2600045', 1002, NULL, 'Completed', 'COD', 'Paid', N'Khách hàng Apple VIP', '0912345678', 'user@apple-store.com', N'Số 15 Lê Duẩn, Bến Nghé', N'Phường Bến Nghé', N'Quận 1', N'Hồ Chí Minh', N'Giao giờ hành chính, gọi trước 15 phút', 69480000.00, 0.00, 500000.00, 68980000.00, 2, 'CHAOBANMOI', '2026-10-02T17:45:00+07:00', N'[{"status": "Pending", "changedAt": "2026-10-02T17:45:00+07:00", "note": "Đơn hàng đã được tạo thành công trên hệ thống Urban Stitch."}, {"status": "Confirmed", "changedAt": "2026-10-02T19:45:00+07:00", "note": "Đơn hàng đã được nhân viên quản trị xác nhận."}, {"status": "Shipping", "changedAt": "2026-10-02T23:45:00+07:00", "note": "Đã bàn giao đơn hàng cho đối tác vận chuyển hỏa tốc."}, {"status": "Delivered", "changedAt": "2026-10-03T17:45:00+07:00", "note": "Khách hàng đã nhận kiện hàng nguyên seal."}, {"status": "Completed", "changedAt": "2026-10-03T20:45:00+07:00", "note": "Giao dịch hoàn tất thành công."}]', 0, 1, '2026-10-02T17:45:00+07:00', NULL, NULL, NULL, 0, NULL, NULL);
SET IDENTITY_INSERT [sales].[Orders] OFF;

    -- 16. ORDER ITEMS
SET IDENTITY_INSERT [sales].[OrderItems] ON;
INSERT INTO [sales].[OrderItems] ([Id], [OrderId], [ProductVariantId], [ProductName], [VariantName], [SKU], [ColorName], [StorageName], [UnitPrice], [Quantity], [LineTotal], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy], [CostPrice], [SelectedAttributesJson], [ThumbnailUrl]) VALUES
(1, 1, 8, N'iPhone 16 Pro Max', N'Titan Trắng / 512GB', 'VN-001-4-3', N'Titan Trắng', N'512GB', 36990000.00, 1, 36990000.00, 1, '2026-01-11T09:37:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 31441500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "512GB"}', NULL),
(2, 2, 15, N'iPhone 16 Pro', N'Titan Đen / 256GB', 'VN-002-3-2', N'Titan Đen', N'256GB', 26990000.00, 1, 26990000.00, 1, '2026-01-17T10:44:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 22941500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "256GB"}', NULL),
(3, 3, 22, N'iPhone 16 Pro', N'Titan Tự Nhiên / 1TB', 'VN-002-2-4', N'Titan Tự Nhiên', N'1TB', 36990000.00, 1, 36990000.00, 1, '2026-01-23T11:51:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 31441500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "1TB"}', NULL),
(4, 3, 40, N'iPhone 16', N'Titan Trắng / 256GB', 'VN-004-4-2', N'Titan Trắng', N'256GB', 20990000.00, 1, 20990000.00, 1, '2026-01-23T11:51:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 17841500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "256GB"}', NULL),
(5, 4, 29, N'iPhone 16 Plus', N'Titan Sa Mạc / 512GB', 'VN-003-1-3', N'Titan Sa Mạc', N'512GB', 28990000.00, 1, 28990000.00, 1, '2026-01-29T12:58:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 24641500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "512GB"}', NULL),
(6, 5, 36, N'iPhone 16 Plus', N'Titan Trắng / 1TB', 'VN-003-4-4', N'Titan Trắng', N'1TB', 33990000.00, 1, 33990000.00, 1, '2026-02-04T14:05:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 28891500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "1TB"}', NULL),
(7, 6, 43, N'iPhone 16', N'Titan Đen / 512GB', 'VN-004-3-3', N'Titan Đen', N'512GB', 25990000.00, 1, 25990000.00, 1, '2026-02-10T15:12:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 22091500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "512GB"}', NULL),
(8, 6, 79, N'iPhone 15 Plus', N'Titan Đen / 512GB', 'VN-007-3-3', N'Titan Đen', N'512GB', 24990000.00, 1, 24990000.00, 1, '2026-02-10T15:12:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 21241500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "512GB"}', NULL),
(9, 7, 50, N'iPhone 15 Pro Max', N'Titan Tự Nhiên / 256GB', 'VN-005-2-2', N'Titan Tự Nhiên', N'256GB', 27490000.00, 1, 27490000.00, 1, '2026-02-16T16:19:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 23366500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "256GB"}', NULL),
(10, 8, 57, N'iPhone 15 Pro Max', N'Titan Sa Mạc / 1TB', 'VN-005-1-4', N'Titan Sa Mạc', N'1TB', 37490000.00, 1, 37490000.00, 1, '2026-02-22T17:26:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 31866500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "1TB"}', NULL),
(11, 9, 64, N'iPhone 15 Pro', N'Titan Trắng / 256GB', 'VN-006-4-2', N'Titan Trắng', N'256GB', 23490000.00, 1, 23490000.00, 1, '2026-02-28T17:33:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 19966500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "256GB"}', NULL),
(12, 9, 118, N'iPhone 17 Air', N'Titan Tự Nhiên / 1TB', 'VN-010-2-4', N'Titan Tự Nhiên', N'1TB', 39990000.00, 1, 39990000.00, 1, '2026-02-28T17:33:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 33991500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "1TB"}', NULL),
(13, 10, 71, N'iPhone 15 Pro', N'Titan Đen / 1TB', 'VN-006-3-4', N'Titan Đen', N'1TB', 33490000.00, 1, 33490000.00, 1, '2026-03-06T18:40:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 28466500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "1TB"}', NULL),
(14, 11, 78, N'iPhone 15 Plus', N'Titan Tự Nhiên / 512GB', 'VN-007-2-3', N'Titan Tự Nhiên', N'512GB', 24990000.00, 1, 24990000.00, 1, '2026-03-12T19:47:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 21241500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "512GB"}', NULL),
(15, 12, 85, N'iPhone 15', N'Titan Sa Mạc / 256GB', 'VN-008-1-2', N'Titan Sa Mạc', N'256GB', 17490000.00, 1, 17490000.00, 1, '2026-03-18T08:54:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 14866500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "256GB"}', NULL),
(16, 12, 157, N'iPhone 18 Pro Max', N'Titan Sa Mạc / 256GB', 'VN-014-1-2', N'Titan Sa Mạc', N'256GB', 39990000.00, 1, 39990000.00, 1, '2026-03-18T08:54:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 33991500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "256GB"}', NULL),
(17, 13, 92, N'iPhone 15', N'Titan Trắng / 512GB', 'VN-008-4-3', N'Titan Trắng', N'512GB', 22490000.00, 1, 22490000.00, 1, '2026-03-24T10:01:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 19116500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "512GB"}', NULL),
(18, 14, 99, N'iPhone 17', N'Titan Đen / 256GB', 'VN-009-3-2', N'Titan Đen', N'256GB', 22990000.00, 1, 22990000.00, 1, '2026-03-30T11:08:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 19541500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "256GB"}', NULL),
(19, 15, 106, N'iPhone 17', N'Titan Tự Nhiên / 1TB', 'VN-009-2-4', N'Titan Tự Nhiên', N'1TB', 32990000.00, 1, 32990000.00, 1, '2026-04-05T12:15:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 28041500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "1TB"}', NULL),
(20, 15, 196, N'MacBook Air 13 inch M3', N'Bạc Silver / 1TB', 'VN-019-6-4', N'Bạc Silver', N'1TB', 30490000.00, 1, 30490000.00, 1, '2026-04-05T12:15:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 25916500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "1TB"}', NULL),
(21, 16, 113, N'iPhone 17 Air', N'Titan Sa Mạc / 512GB', 'VN-010-1-3', N'Titan Sa Mạc', N'512GB', 34990000.00, 1, 34990000.00, 1, '2026-04-11T13:22:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 29741500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "512GB"}', NULL),
(22, 17, 120, N'iPhone 17 Air', N'Titan Trắng / 1TB', 'VN-010-4-4', N'Titan Trắng', N'1TB', 39990000.00, 1, 39990000.00, 1, '2026-04-17T14:29:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 33991500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "1TB"}', NULL),
(23, 18, 127, N'iPhone 17 Pro', N'Titan Đen / 512GB', 'VN-011-3-3', N'Titan Đen', N'512GB', 35990000.00, 1, 35990000.00, 1, '2026-04-23T14:36:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 30591500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "512GB"}', NULL),
(24, 18, 235, N'iPad Pro 13 inch M4', N'Xám Không Gian / 512GB', 'VN-026-7-3', N'Xám Không Gian', N'512GB', 40490000.00, 1, 40490000.00, 1, '2026-04-23T14:36:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 34416500.00, N'{"Màu sắc": "Xám Không Gian", "Dung lượng": "512GB"}', NULL),
(25, 19, 134, N'iPhone 17 Pro Max', N'Titan Tự Nhiên / 256GB', 'VN-012-2-2', N'Titan Tự Nhiên', N'256GB', 35990000.00, 1, 35990000.00, 1, '2026-04-29T15:43:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 30591500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "256GB"}', NULL),
(26, 20, 141, N'iPhone 17 Pro Max', N'Titan Sa Mạc / 1TB', 'VN-012-1-4', N'Titan Sa Mạc', N'1TB', 45990000.00, 1, 45990000.00, 1, '2026-05-05T16:50:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 39091500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "1TB"}', NULL),
(27, 21, 148, N'iPhone 18 Pro', N'Titan Trắng / 256GB', 'VN-013-4-2', N'Titan Trắng', N'256GB', 33990000.00, 1, 33990000.00, 1, '2026-05-11T17:57:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 28891500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "256GB"}', NULL),
(28, 21, 274, N'AirPods Max Cổng USB-C', N'Đen Không Gian', 'VN-040-8', N'Đen Không Gian', NULL, 12990000.00, 1, 12990000.00, 1, '2026-05-11T17:57:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 11041500.00, N'{"Màu sắc": "Đen Không Gian"}', NULL),
(29, 22, 155, N'iPhone 18 Pro', N'Titan Đen / 1TB', 'VN-013-3-4', N'Titan Đen', N'1TB', 43990000.00, 1, 43990000.00, 1, '2026-05-17T19:04:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 37391500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "1TB"}', NULL),
(30, 23, 162, N'iPhone 18 Pro Max', N'Titan Tự Nhiên / 512GB', 'VN-014-2-3', N'Titan Tự Nhiên', N'512GB', 44990000.00, 1, 44990000.00, 1, '2026-05-23T20:11:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 38241500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "512GB"}', NULL),
(31, 24, 169, N'MacBook Pro 14 inch M4', N'Đen Không Gian / 512GB', 'VN-015-8-3', N'Đen Không Gian', N'512GB', 37990000.00, 1, 37990000.00, 1, '2026-05-29T09:18:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 32291500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "512GB"}', NULL),
(32, 24, 15, N'iPhone 16 Pro', N'Titan Đen / 256GB', 'VN-002-3-2', N'Titan Đen', N'256GB', 26990000.00, 1, 26990000.00, 1, '2026-05-29T09:18:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 22941500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "256GB"}', NULL),
(33, 25, 176, N'MacBook Pro 14 inch M4 Pro', N'Bạc Silver / 512GB', 'VN-016-6-3', N'Bạc Silver', N'512GB', 47490000.00, 1, 47490000.00, 1, '2026-06-04T10:25:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 40366500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "512GB"}', NULL),
(34, 26, 183, N'MacBook Pro 16 inch M4 Pro', N'Đen Không Gian / 1TB', 'VN-017-8-4', N'Đen Không Gian', N'1TB', 66990000.00, 1, 66990000.00, 1, '2026-06-10T10:32:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 56941500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "1TB"}', NULL),
(35, 27, 190, N'MacBook Pro 16 inch M4 Max', N'Bạc Silver / 1TB', 'VN-018-6-4', N'Bạc Silver', N'1TB', 89990000.00, 1, 89990000.00, 1, '2026-06-16T11:39:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 76491500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "1TB"}', NULL),
(36, 27, 54, N'iPhone 15 Pro Max', N'Titan Tự Nhiên / 512GB', 'VN-005-2-3', N'Titan Tự Nhiên', N'512GB', 32490000.00, 1, 32490000.00, 1, '2026-06-16T11:39:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 27616500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "512GB"}', NULL),
(37, 28, 197, N'MacBook Air 13 inch M3', N'Đen Không Gian / 2TB', 'VN-019-8-5', N'Đen Không Gian', N'2TB', 35490000.00, 1, 35490000.00, 1, '2026-06-22T12:46:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 30166500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "2TB"}', NULL),
(38, 29, 204, N'MacBook Air 15 inch M3', N'Bạc Silver / 2TB', 'VN-020-6-5', N'Bạc Silver', N'2TB', 40490000.00, 1, 40490000.00, 1, '2026-06-28T13:53:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 34416500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "2TB"}', NULL),
(39, 30, 211, N'MacBook Pro 14 inch M5 Pro', N'Đen Không Gian / 512GB', 'VN-022-8-3', N'Đen Không Gian', N'512GB', 51990000.00, 1, 51990000.00, 1, '2026-07-04T15:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 44191500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "512GB"}', NULL),
(40, 30, 93, N'iPhone 15', N'Titan Sa Mạc / 1TB', 'VN-008-1-4', N'Titan Sa Mạc', N'1TB', 27490000.00, 1, 27490000.00, 1, '2026-07-04T15:00:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 23366500.00, N'{"Màu sắc": "Titan Sa Mạc", "Dung lượng": "1TB"}', NULL),
(41, 31, 218, N'MacBook Pro 16 inch M5 Max', N'Bạc Silver / 512GB', 'VN-023-6-3', N'Bạc Silver', N'512GB', 89990000.00, 1, 89990000.00, 1, '2026-07-10T16:07:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 76491500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "512GB"}', NULL),
(42, 32, 225, N'MacBook Pro 16 inch M6 Ultra', N'Đen Không Gian / 1TB', 'VN-024-8-4', N'Đen Không Gian', N'1TB', 134990000.00, 1, 134990000.00, 1, '2026-07-16T17:14:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 114741500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "1TB"}', NULL),
(43, 33, 232, N'iPad Pro 11 inch M4', N'Starlight Ánh Sao / 512GB', 'VN-025-11-3', N'Starlight Ánh Sao', N'512GB', 31990000.00, 1, 31990000.00, 1, '2026-07-22T18:21:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 27191500.00, N'{"Màu sắc": "Starlight Ánh Sao", "Dung lượng": "512GB"}', NULL),
(44, 33, 132, N'iPhone 17 Pro', N'Titan Trắng / 1TB', 'VN-011-4-4', N'Titan Trắng', N'1TB', 40990000.00, 1, 40990000.00, 1, '2026-07-22T18:21:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 34841500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "1TB"}', NULL),
(45, 34, 239, N'iPad Air 11 inch M2', N'Xám Không Gian / 512GB', 'VN-027-7-3', N'Xám Không Gian', N'512GB', 20490000.00, 1, 20490000.00, 1, '2026-07-28T19:28:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 17416500.00, N'{"Màu sắc": "Xám Không Gian", "Dung lượng": "512GB"}', NULL),
(46, 35, 246, N'iPad Air 13 inch M3', N'Starlight Ánh Sao / 256GB', 'VN-029-11-2', N'Starlight Ánh Sao', N'256GB', 22990000.00, 1, 22990000.00, 1, '2026-08-03T19:35:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 19541500.00, N'{"Màu sắc": "Starlight Ánh Sao", "Dung lượng": "256GB"}', NULL),
(47, 36, 253, N'iPad Pro 13 inch M5', N'Xám Không Gian / 256GB', 'VN-031-7-2', N'Xám Không Gian', N'256GB', 38990000.00, 1, 38990000.00, 1, '2026-08-09T08:42:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 33141500.00, N'{"Màu sắc": "Xám Không Gian", "Dung lượng": "256GB"}', NULL),
(48, 36, 171, N'MacBook Pro 14 inch M4', N'Đen Không Gian / 1TB', 'VN-015-8-4', N'Đen Không Gian', N'1TB', 42990000.00, 1, 42990000.00, 1, '2026-08-09T08:42:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 36541500.00, N'{"Màu sắc": "Đen Không Gian", "Dung lượng": "1TB"}', NULL),
(49, 37, 260, N'Apple Watch Series 10 Nhôm 46mm', N'Titan Tự Nhiên', 'VN-033-2', N'Titan Tự Nhiên', NULL, 10990000.00, 1, 10990000.00, 1, '2026-08-15T09:49:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 9341500.00, N'{"Màu sắc": "Titan Tự Nhiên"}', NULL),
(50, 38, 267, N'AirPods Pro 2 MagSafe USB-C', N'Trắng White', 'VN-037-4', N'Trắng White', NULL, 5490000.00, 2, 10980000.00, 1, '2026-08-21T10:56:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 4666500.00, N'{"Màu sắc": "Trắng White"}', NULL),
(51, 39, 274, N'AirPods Max Cổng USB-C', N'Đen Không Gian', 'VN-040-8', N'Đen Không Gian', NULL, 12990000.00, 1, 12990000.00, 1, '2026-08-27T12:03:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 11041500.00, N'{"Màu sắc": "Đen Không Gian"}', NULL),
(52, 39, 210, N'MacBook Air 13 inch M4', N'Bạc Silver / 2TB', 'VN-021-6-5', N'Bạc Silver', N'2TB', 37990000.00, 1, 37990000.00, 1, '2026-08-27T12:03:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 32291500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "2TB"}', NULL),
(53, 40, 281, N'Mac mini M4', N'Trắng White / 256GB', 'VN-043-4-2', N'Trắng White', N'256GB', 13990000.00, 1, 13990000.00, 1, '2026-09-02T13:10:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 11891500.00, N'{"Màu sắc": "Trắng White", "Dung lượng": "256GB"}', NULL),
(54, 41, 288, N'Mac mini M4 Pro', N'Bạc Silver / 512GB', 'VN-044-6-3', N'Bạc Silver', N'512GB', 37490000.00, 1, 37490000.00, 1, '2026-09-08T14:17:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 31866500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "512GB"}', NULL),
(55, 42, 295, N'Magic Keyboard cho iPad Pro M4 13 inch', N'Trắng White', 'VN-047-4', N'Trắng White', NULL, 8990000.00, 2, 17980000.00, 1, '2026-09-14T15:24:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 7641500.00, N'{"Màu sắc": "Trắng White"}', NULL),
(56, 42, 249, N'iPad mini 7 A17 Pro', N'Xám Không Gian / 256GB', 'VN-030-7-2', N'Xám Không Gian', N'256GB', 12990000.00, 1, 12990000.00, 1, '2026-09-14T15:24:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 11041500.00, N'{"Màu sắc": "Xám Không Gian", "Dung lượng": "256GB"}', NULL),
(57, 43, 4, N'iPhone 16 Pro Max', N'Titan Trắng / 256GB', 'VN-001-4-2', N'Titan Trắng', N'256GB', 31990000.00, 1, 31990000.00, 1, '2026-09-20T15:31:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 27191500.00, N'{"Màu sắc": "Titan Trắng", "Dung lượng": "256GB"}', NULL),
(58, 44, 11, N'iPhone 16 Pro Max', N'Titan Đen / 1TB', 'VN-001-3-4', N'Titan Đen', N'1TB', 41990000.00, 1, 41990000.00, 1, '2026-09-26T16:38:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 35691500.00, N'{"Màu sắc": "Titan Đen", "Dung lượng": "1TB"}', NULL),
(59, 45, 18, N'iPhone 16 Pro', N'Titan Tự Nhiên / 512GB', 'VN-002-2-3', N'Titan Tự Nhiên', N'512GB', 31990000.00, 1, 31990000.00, 1, '2026-10-02T17:45:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 27191500.00, N'{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "512GB"}', NULL),
(60, 45, 288, N'Mac mini M4 Pro', N'Bạc Silver / 512GB', 'VN-044-6-3', N'Bạc Silver', N'512GB', 37490000.00, 1, 37490000.00, 1, '2026-10-02T17:45:00+07:00', NULL, NULL, NULL, 0, NULL, NULL, 31866500.00, N'{"Màu sắc": "Bạc Silver", "Dung lượng": "512GB"}', NULL);
SET IDENTITY_INSERT [sales].[OrderItems] OFF;


    EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
    PRINT '[SUCCESS] [SEED] Khởi tạo dữ liệu mẫu seed-data.sql (2022-2026) hoàn tất 100%!';
END
ELSE
BEGIN
    PRINT '[INFO] [SEED] Cơ sở dữ liệu đã có dữ liệu sản phẩm. Bỏ qua nạp seed-data.sql để bảo toàn dữ liệu.';
END
GO
