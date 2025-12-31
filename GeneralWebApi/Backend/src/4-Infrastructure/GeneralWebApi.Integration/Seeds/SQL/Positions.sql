-- =============================================
-- Positions 表测试数据生成脚本 (1000条) - 完整优化版
-- =============================================
USE GeneralWebApi;
GO

SET NOCOUNT ON;
GO

-- =============================================
-- 清理选项配置
-- =============================================
-- 清理模式：
--   0 = 不清理，只补充到目标数量
--   1 = 只删除测试数据（CreatedBy = 'DataSeeder'）
--   2 = 硬删除所有数据（DELETE FROM）
--   3 = 软删除所有数据（UPDATE IsDeleted = 1）
--   4 = 清空表（TRUNCATE，最快但会重置自增ID）
-- =============================================
DECLARE @CleanupMode INT = 1;  -- 修改这里选择清理模式

DECLARE @TargetCount INT = 1000;
DECLARE @DeletedCount INT = 0;

-- Execute cleanup based on mode
IF @CleanupMode > 0
BEGIN
    PRINT '========================================';
    PRINT 'Starting Data Cleanup...';
    PRINT '========================================';
    
    DECLARE @CleanupStartTime DATETIME2 = GETUTCDATE();
    
    IF @CleanupMode = 1
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Positions WHERE CreatedBy = 'DataSeeder';
        PRINT 'Mode: Delete test data only (CreatedBy = ''DataSeeder'')';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        
        BEGIN TRY
            -- Temporarily disable foreign key constraints
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            DELETE FROM Positions WHERE CreatedBy = 'DataSeeder';
            
            SET @DeletedCount = @@ROWCOUNT;
            
            -- Re-enable foreign key constraints
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            COMMIT TRANSACTION;
            
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' test records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            
            BEGIN TRY
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            END TRY
            BEGIN CATCH
            END CATCH
            
            PRINT '[ERROR] Failed to delete test data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 2
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Positions;
        PRINT 'Mode: Hard delete all data';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            DELETE FROM Positions;
            
            SET @DeletedCount = @@ROWCOUNT;
            
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            END TRY
            BEGIN CATCH
            END CATCH
            PRINT '[ERROR] Failed to delete data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 3
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Positions WHERE IsDeleted = 0;
        PRINT 'Mode: Soft delete all data (UPDATE IsDeleted = 1)';
        PRINT 'Records to soft delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        UPDATE Positions 
        SET IsDeleted = 1,
            DeletedAt = GETUTCDATE(),
            DeletedBy = 'DataSeeder'
        WHERE IsDeleted = 0;
        
        PRINT '[SUCCESS] Soft deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
    END
    ELSE IF @CleanupMode = 4
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Positions;
        PRINT 'Mode: TRUNCATE table (will reset identity)';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions NOCHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            TRUNCATE TABLE Positions;
            
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
            ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Truncated table, deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Positions_ParentPositionId;
                ALTER TABLE Positions CHECK CONSTRAINT FK_Positions_Departments_DepartmentId;
            END TRY
            BEGIN CATCH
            END CATCH
            PRINT '[ERROR] Failed to truncate table: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    
    DECLARE @CleanupElapsed FLOAT = DATEDIFF(MILLISECOND, @CleanupStartTime, GETUTCDATE()) / 1000.0;
    PRINT 'Cleanup duration: ' + CAST(CAST(@CleanupElapsed AS DECIMAL(10,2)) AS VARCHAR) + ' seconds';
    PRINT '========================================';
    PRINT '';
END
ELSE
BEGIN
    PRINT '[INFO] Cleanup skipped (mode = 0)';
    PRINT '';
END

-- =============================================
-- Data Generation
-- =============================================
DECLARE @CurrentCount INT = (SELECT COUNT(*) FROM Positions WHERE IsDeleted = 0);
DECLARE @ToGenerate INT = @TargetCount - @CurrentCount;

IF @ToGenerate > 0
BEGIN
    -- Performance tracking variables
    DECLARE @StartTime DATETIME2 = GETUTCDATE();
    DECLARE @ElapsedSeconds FLOAT;
    DECLARE @RecordsPerSecond FLOAT;
    
    PRINT '========================================';
    PRINT 'Starting Positions Data Generation';
    PRINT '========================================';
    PRINT 'Target: ' + CAST(@TargetCount AS VARCHAR) + ' records';
    PRINT 'Current: ' + CAST(@CurrentCount AS VARCHAR) + ' records';
    PRINT 'To Generate: ' + CAST(@ToGenerate AS VARCHAR) + ' records';
    PRINT 'Start Time: ' + CONVERT(VARCHAR(23), @StartTime, 121);
    PRINT '========================================';
    PRINT '';
    
    -- Get all valid departments
    DECLARE @Departments TABLE (Id INT, Code VARCHAR(20));
    INSERT INTO @Departments 
    SELECT Id, Code FROM Departments WHERE IsDeleted = 0 AND IsActive = 1;
    
    IF NOT EXISTS (SELECT 1 FROM @Departments)
    BEGIN
        PRINT '[ERROR] No departments found. Please run Departments seeder first.';
        RETURN;
    END
    
    -- Get the maximum existing Code number to ensure uniqueness
    DECLARE @MaxCodeNumber INT = 0;
    SELECT @MaxCodeNumber = ISNULL(MAX(
        CASE 
            WHEN Code LIKE '%-%' AND LEN(Code) >= 4 THEN 
                CAST(SUBSTRING(Code, LEN(Code) - 2, 3) AS INT)
            ELSE 0
        END
    ), 0)
    FROM Positions;
    
    -- Use timestamp suffix for uniqueness
    DECLARE @TimestampSuffix VARCHAR(6) = RIGHT(REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(23), GETUTCDATE(), 121), '-', ''), ':', ''), ' ', ''), 6);
    
    DECLARE @i INT = 0;
    DECLARE @BatchSize INT = 100;
    DECLARE @BatchCount INT = 0;
    
    -- Position title templates
    DECLARE @PositionTitles TABLE (Title VARCHAR(100), IsManagement BIT, BaseLevel INT);
    INSERT INTO @PositionTitles VALUES
        ('Manager', 1, 3), ('Senior Manager', 1, 3), ('Director', 1, 3), ('VP', 1, 3),
        ('Senior Developer', 0, 2), ('Developer', 0, 1), ('Junior Developer', 0, 1), ('Lead Developer', 0, 2),
        ('Analyst', 0, 1), ('Senior Analyst', 0, 2), ('Specialist', 0, 1), ('Senior Specialist', 0, 2),
        ('Coordinator', 0, 1), ('Assistant', 0, 1), ('Executive', 1, 3), ('Consultant', 0, 2),
        ('Architect', 0, 2), ('Senior Architect', 0, 3), ('Engineer', 0, 1), ('Senior Engineer', 0, 2);
    
    -- User names for audit fields
    DECLARE @UserNames TABLE (UserName VARCHAR(100));
    INSERT INTO @UserNames VALUES
        ('DataSeeder'), ('SystemAdmin'), ('HRManager'), ('ITAdmin'), ('FinanceManager'),
        ('SalesManager'), ('OperationsManager'), ('QualityManager'), ('SupportManager'), ('AdminUser');
    
    -- Remarks templates
    DECLARE @RemarksTemplates TABLE (Remark VARCHAR(500));
    INSERT INTO @RemarksTemplates VALUES
        ('Key position responsible for team leadership and strategic planning'),
        ('Technical position focused on development and implementation'),
        ('Analytical role supporting business decision-making'),
        ('Management position overseeing department operations'),
        ('Support role assisting with daily operations'),
        ('Specialized role requiring advanced skills and expertise'),
        ('Entry-level position for career development'),
        ('Senior role with extensive experience and responsibilities'),
        ('Executive position with strategic oversight'),
        ('Consulting role providing expert guidance');
    
    WHILE @i < @ToGenerate
    BEGIN
        DECLARE @BatchData TABLE (
            Title VARCHAR(100),
            Code VARCHAR(20),
            Description VARCHAR(500),
            DepartmentId INT,
            Level INT,
            ParentPositionId INT,
            MinSalary DECIMAL(18,2),
            MaxSalary DECIMAL(18,2),
            IsManagement BIT,
            CreatedAt DATETIME2,
            CreatedBy VARCHAR(100),
            UpdatedAt DATETIME2,
            UpdatedBy VARCHAR(100),
            IsActive BIT,
            IsDeleted BIT,
            DeletedAt DATETIME2,
            DeletedBy VARCHAR(100),
            Version INT,
            SortOrder INT,
            Remarks VARCHAR(MAX)
        );
        
        DECLARE @j INT = 0;
        WHILE @j < @BatchSize AND @i < @ToGenerate
        BEGIN
            SET @i = @i + 1;
            SET @j = @j + 1;
            
            -- Random select department and position title
            DECLARE @DeptId INT;
            DECLARE @DeptCode VARCHAR(20);
            DECLARE @PositionTitle VARCHAR(100);
            DECLARE @IsManagement BIT;
            DECLARE @Level INT;
            
            SELECT TOP 1 @DeptId = Id, @DeptCode = Code 
            FROM @Departments 
            ORDER BY NEWID();
            
            SELECT TOP 1 @PositionTitle = Title, @IsManagement = IsManagement, @Level = BaseLevel
            FROM @PositionTitles 
            ORDER BY NEWID();
            
            -- Generate unique code
            DECLARE @CodeNumber INT = @MaxCodeNumber + @i;
            DECLARE @PosCode VARCHAR(20) = @DeptCode + '-' + 
                UPPER(LEFT(REPLACE(@PositionTitle, ' ', ''), 6)) + 
                RIGHT('000' + CAST(@CodeNumber AS VARCHAR), 3) + @TimestampSuffix;
            
            -- Ensure Code doesn't exceed max length (20)
            IF LEN(@PosCode) > 20
            BEGIN
                SET @PosCode = LEFT(@PosCode, 20);
            END
            
            -- Generate salary range based on level
            DECLARE @MinSalary DECIMAL(18,2) = CASE @Level
                WHEN 3 THEN 80000 + (ABS(CHECKSUM(NEWID())) % 70000)
                WHEN 2 THEN 50000 + (ABS(CHECKSUM(NEWID())) % 50000)
                ELSE 30000 + (ABS(CHECKSUM(NEWID())) % 40000)
            END;
            DECLARE @MaxSalary DECIMAL(18,2) = @MinSalary + 30000 + (ABS(CHECKSUM(NEWID())) % 50000);
            
            -- 30% probability to have parent position (for level 2 and 3)
            DECLARE @ParentPositionId INT = NULL;
            IF @Level > 1 AND (ABS(CHECKSUM(NEWID())) % 100) < 30
            BEGIN
                SELECT TOP 1 @ParentPositionId = Id
                FROM Positions 
                WHERE IsDeleted = 0 AND IsActive = 1 
                  AND Level < @Level
                  AND DepartmentId = @DeptId
                ORDER BY NEWID();
            END
            
            -- Audit fields
            DECLARE @CreatedAt DATETIME2 = GETUTCDATE();
            DECLARE @CreatedBy VARCHAR(100);
            DECLARE @UpdatedAt DATETIME2 = NULL;
            DECLARE @UpdatedBy VARCHAR(100) = NULL;
            DECLARE @IsActive BIT = 1;
            DECLARE @IsDeleted BIT = 0;
            DECLARE @DeletedAt DATETIME2 = NULL;
            DECLARE @DeletedBy VARCHAR(100) = NULL;
            DECLARE @Remarks VARCHAR(MAX) = NULL;
            
            -- Random creator
            SELECT TOP 1 @CreatedBy = UserName 
            FROM @UserNames 
            ORDER BY NEWID();
            
            -- 25% probability to have update history
            IF (ABS(CHECKSUM(NEWID())) % 100) < 25
            BEGIN
                SET @UpdatedAt = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 90, @CreatedAt);
                SELECT TOP 1 @UpdatedBy = UserName 
                FROM @UserNames 
                ORDER BY NEWID();
            END
            
            -- 5% probability to be inactive
            IF (ABS(CHECKSUM(NEWID())) % 100) < 5
            BEGIN
                SET @IsActive = 0;
            END
            
            -- 3% probability to be soft deleted
            IF (ABS(CHECKSUM(NEWID())) % 100) < 3
            BEGIN
                SET @IsDeleted = 1;
                SET @IsActive = 0;
                SET @DeletedAt = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 30, @CreatedAt);
                SELECT TOP 1 @DeletedBy = UserName 
                FROM @UserNames 
                ORDER BY NEWID();
            END
            
            -- 60% probability to have remarks
            IF (ABS(CHECKSUM(NEWID())) % 100) < 60
            BEGIN
                SELECT TOP 1 @Remarks = Remark 
                FROM @RemarksTemplates 
                ORDER BY NEWID();
                SET @Remarks = @Remarks + ' - Code: ' + @PosCode + ', Level: ' + CAST(@Level AS VARCHAR);
            END
            
            INSERT INTO @BatchData VALUES (
                @PositionTitle,
                @PosCode,
                @PositionTitle + ' position in ' + @DeptCode + ' Department. ' + 
                CASE @Level
                    WHEN 3 THEN 'This is a senior management role responsible for strategic planning and team leadership.'
                    WHEN 2 THEN 'This is a mid-level position requiring specialized skills and experience.'
                    ELSE 'This is an entry to mid-level position suitable for career development.'
                END,
                @DeptId,
                @Level,
                @ParentPositionId,
                @MinSalary,
                @MaxSalary,
                @IsManagement,
                @CreatedAt,
                @CreatedBy,
                @UpdatedAt,
                @UpdatedBy,
                @IsActive,
                @IsDeleted,
                @DeletedAt,
                @DeletedBy,
                1,
                @CodeNumber,
                @Remarks
            );
        END;
        
        INSERT INTO Positions (
            Title, Code, Description, DepartmentId, Level, ParentPositionId,
            MinSalary, MaxSalary, IsManagement,
            CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
            IsActive, IsDeleted, DeletedAt, DeletedBy,
            Version, SortOrder, Remarks
        )
        SELECT 
            Title, Code, Description, DepartmentId, Level, ParentPositionId,
            MinSalary, MaxSalary, IsManagement,
            CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
            IsActive, IsDeleted, DeletedAt, DeletedBy,
            Version, SortOrder, Remarks
        FROM @BatchData;
        
        SET @BatchCount = @BatchCount + 1;
        DELETE FROM @BatchData;
        
        IF @BatchCount % 10 = 0
        BEGIN
            SET @ElapsedSeconds = DATEDIFF(MILLISECOND, @StartTime, GETUTCDATE()) / 1000.0;
            SET @RecordsPerSecond = @i / NULLIF(@ElapsedSeconds, 0);
            
            PRINT '  Progress: ' + CAST(@i AS VARCHAR) + ' / ' + CAST(@ToGenerate AS VARCHAR) + 
                  ' | Elapsed: ' + CAST(CAST(@ElapsedSeconds AS DECIMAL(10,2)) AS VARCHAR) + 's' +
                  ' | Speed: ' + CAST(CAST(@RecordsPerSecond AS DECIMAL(10,2)) AS VARCHAR) + ' records/sec';
        END
    END;
    
    -- Final performance statistics
    DECLARE @EndTime DATETIME2 = GETUTCDATE();
    DECLARE @TotalElapsedSeconds FLOAT = DATEDIFF(MILLISECOND, @StartTime, @EndTime) / 1000.0;
    DECLARE @TotalRecordsPerSecond FLOAT = @i / NULLIF(@TotalElapsedSeconds, 0);
    
    -- Store statistics in variables before printing
    DECLARE @TotalCount INT;
    DECLARE @ActiveCount INT;
    DECLARE @InactiveCount INT;
    DECLARE @DeletedCountFinal INT;
    DECLARE @UpdatedCount INT;
    DECLARE @RemarksCount INT;
    DECLARE @ManagementCount INT;
    
    SELECT @TotalCount = COUNT(*) FROM Positions WHERE IsDeleted = 0;
    SELECT @ActiveCount = COUNT(*) FROM Positions WHERE IsDeleted = 0 AND IsActive = 1;
    SELECT @InactiveCount = COUNT(*) FROM Positions WHERE IsDeleted = 0 AND IsActive = 0;
    SELECT @DeletedCountFinal = COUNT(*) FROM Positions WHERE IsDeleted = 1;
    SELECT @UpdatedCount = COUNT(*) FROM Positions WHERE UpdatedAt IS NOT NULL;
    SELECT @RemarksCount = COUNT(*) FROM Positions WHERE Remarks IS NOT NULL;
    SELECT @ManagementCount = COUNT(*) FROM Positions WHERE IsDeleted = 0 AND IsManagement = 1;
    
    PRINT '';
    PRINT '========================================';
    PRINT '[SUCCESS] Positions generation completed!';
    PRINT '========================================';
    PRINT 'Performance Statistics:';
    PRINT '  Start Time: ' + CONVERT(VARCHAR(23), @StartTime, 121);
    PRINT '  End Time: ' + CONVERT(VARCHAR(23), @EndTime, 121);
    PRINT '  Total Duration: ' + CAST(CAST(@TotalElapsedSeconds AS DECIMAL(10,2)) AS VARCHAR) + ' seconds';
    PRINT '  Records Generated: ' + CAST(@i AS VARCHAR);
    PRINT '  Average Speed: ' + CAST(CAST(@TotalRecordsPerSecond AS DECIMAL(10,2)) AS VARCHAR) + ' records/second';
    PRINT '';
    PRINT 'Data Statistics:';
    PRINT '  Total (not deleted): ' + CAST(@TotalCount AS VARCHAR);
    PRINT '  - Active: ' + CAST(@ActiveCount AS VARCHAR);
    PRINT '  - Inactive: ' + CAST(@InactiveCount AS VARCHAR);
    PRINT '  - Deleted: ' + CAST(@DeletedCountFinal AS VARCHAR);
    PRINT '  - Management: ' + CAST(@ManagementCount AS VARCHAR);
    PRINT '  - With Updates: ' + CAST(@UpdatedCount AS VARCHAR);
    PRINT '  - With Remarks: ' + CAST(@RemarksCount AS VARCHAR);
    PRINT '========================================';
END
ELSE
BEGIN
    PRINT '[INFO] Positions table already has ' + CAST(@CurrentCount AS VARCHAR) + ' records.';
END
GO