IF NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'catalog' AND t.name = 'ProductSpecificationGroups')
BEGIN
    CREATE TABLE [catalog].[ProductSpecificationGroups] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [ProductId] INT NOT NULL,
        [Name] NVARCHAR(150) NOT NULL,
        [DisplayOrder] INT NOT NULL CONSTRAINT [DF_ProductSpecificationGroups_DisplayOrder] DEFAULT 0,
        [IsActive] BIT NOT NULL CONSTRAINT [DF_ProductSpecificationGroups_IsActive] DEFAULT 1,
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_ProductSpecificationGroups_CreatedOn] DEFAULT SYSDATETIMEOFFSET(),
        [CreatedBy] NVARCHAR(MAX) NULL,
        [LastModifiedOn] DATETIMEOFFSET NULL,
        [LastModifiedBy] NVARCHAR(MAX) NULL,
        [IsDeleted] BIT NOT NULL CONSTRAINT [DF_ProductSpecificationGroups_IsDeleted] DEFAULT 0,
        [DeletedOn] DATETIMEOFFSET NULL,
        [DeletedBy] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_ProductSpecificationGroups] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_ProductSpecificationGroups_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [catalog].[Products] ([Id]) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX [IX_ProductSpecificationGroups_ProductId] ON [catalog].[ProductSpecificationGroups] ([ProductId] ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('catalog.ProductSpecifications') AND name = 'GroupId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] ADD [GroupId] INT NULL;
END
GO

;WITH GroupSource AS (
    SELECT 
        ProductId,
        ISNULL(NULLIF(LTRIM(RTRIM(GroupName)), ''), N'Chung') AS CleanGroupName,
        MIN(DisplayOrder) AS MinOrder,
        MIN(Id) AS MinId
    FROM [catalog].[ProductSpecifications]
    GROUP BY ProductId, ISNULL(NULLIF(LTRIM(RTRIM(GroupName)), ''), N'Chung')
),
RankedGroups AS (
    SELECT 
        ProductId,
        CleanGroupName,
        ROW_NUMBER() OVER(PARTITION BY ProductId ORDER BY MinOrder, MinId) AS GroupOrder
    FROM GroupSource
)
INSERT INTO [catalog].[ProductSpecificationGroups] (ProductId, Name, DisplayOrder, IsActive, CreatedOn)
SELECT 
    rg.ProductId,
    rg.CleanGroupName,
    rg.GroupOrder,
    1,
    SYSDATETIMEOFFSET()
FROM RankedGroups rg
WHERE NOT EXISTS (
    SELECT 1 FROM [catalog].[ProductSpecificationGroups] existing 
    WHERE existing.ProductId = rg.ProductId AND existing.Name = rg.CleanGroupName
);
GO

UPDATE ps
SET ps.GroupId = g.Id
FROM [catalog].[ProductSpecifications] ps
JOIN [catalog].[ProductSpecificationGroups] g 
    ON g.ProductId = ps.ProductId 
    AND g.Name = ISNULL(NULLIF(LTRIM(RTRIM(ps.GroupName)), ''), N'Chung')
WHERE ps.GroupId IS NULL;
GO

;WITH NumberedSpecs AS (
    SELECT 
        Id,
        ROW_NUMBER() OVER(PARTITION BY GroupId ORDER BY DisplayOrder, Id) AS NewOrder
    FROM [catalog].[ProductSpecifications]
)
UPDATE ps
SET ps.DisplayOrder = ns.NewOrder
FROM [catalog].[ProductSpecifications] ps
JOIN NumberedSpecs ns ON ps.Id = ns.Id;
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductSpecifications_Products_ProductId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [FK_ProductSpecifications_Products_ProductId];
END
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductSpecifications_ProductVariants_ProductVariantId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP CONSTRAINT [FK_ProductSpecifications_ProductVariants_ProductVariantId];
END
GO

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductSpecifications_ProductId' AND object_id = OBJECT_ID('catalog.ProductSpecifications'))
BEGIN
    DROP INDEX [IX_ProductSpecifications_ProductId] ON [catalog].[ProductSpecifications];
END
GO

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductSpecifications_ProductVariantId' AND object_id = OBJECT_ID('catalog.ProductSpecifications'))
BEGIN
    DROP INDEX [IX_ProductSpecifications_ProductVariantId] ON [catalog].[ProductSpecifications];
END
GO

ALTER TABLE [catalog].[ProductSpecifications] ALTER COLUMN [GroupId] INT NOT NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductSpecifications_ProductSpecificationGroups_GroupId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications]
    ADD CONSTRAINT [FK_ProductSpecifications_ProductSpecificationGroups_GroupId]
    FOREIGN KEY ([GroupId]) REFERENCES [catalog].[ProductSpecificationGroups] ([Id]) ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProductSpecifications_GroupId' AND object_id = OBJECT_ID('catalog.ProductSpecifications'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_ProductSpecifications_GroupId] ON [catalog].[ProductSpecifications] ([GroupId] ASC);
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('catalog.ProductSpecifications') AND name = 'ProductId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP COLUMN [ProductId];
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('catalog.ProductSpecifications') AND name = 'ProductVariantId')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP COLUMN [ProductVariantId];
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('catalog.ProductSpecifications') AND name = 'GroupName')
BEGIN
    ALTER TABLE [catalog].[ProductSpecifications] DROP COLUMN [GroupName];
END
GO

SELECT COUNT(*) AS TotalGroups FROM [catalog].[ProductSpecificationGroups];
SELECT COUNT(*) AS TotalSpecs FROM [catalog].[ProductSpecifications];
