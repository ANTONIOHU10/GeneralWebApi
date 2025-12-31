-- =============================================
-- Departments 表测试数据生成脚本 (1000条) - 修复 Code 重复问题
-- =============================================
USE GeneralWebApi;
GO

SET NOCOUNT ON;
GO

-- =============================================
-- 清理选项配置
-- =============================================
DECLARE @CleanupMode INT = 1;
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
        SELECT @DeletedCount = COUNT(*) FROM Departments WHERE CreatedBy = 'DataSeeder';
        PRINT 'Mode: Delete test data only (CreatedBy = ''DataSeeder'')';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        
        BEGIN TRY
            ALTER TABLE Departments NOCHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            DELETE FROM Departments WHERE CreatedBy = 'DataSeeder';
            ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            COMMIT TRANSACTION;
            
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' test records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            END TRY
            BEGIN CATCH
            END CATCH
            PRINT '[ERROR] Failed to delete test data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 2
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Departments;
        PRINT 'Mode: Hard delete all data';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Departments NOCHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            DELETE FROM Departments;
            ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            END TRY
            BEGIN CATCH
            END CATCH
            PRINT '[ERROR] Failed to delete data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 3
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Departments WHERE IsDeleted = 0;
        PRINT 'Mode: Soft delete all data (UPDATE IsDeleted = 1)';
        PRINT 'Records to soft delete: ' + CAST(@DeletedCount AS VARCHAR);
        UPDATE Departments SET IsDeleted = 1, DeletedAt = GETUTCDATE(), DeletedBy = 'DataSeeder' WHERE IsDeleted = 0;
        PRINT '[SUCCESS] Soft deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
    END
    ELSE IF @CleanupMode = 4
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Departments;
        PRINT 'Mode: TRUNCATE table (will reset identity)';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Departments NOCHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            TRUNCATE TABLE Departments;
            ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Truncated table, deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Departments CHECK CONSTRAINT FK_Departments_Departments_ParentDepartmentId;
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
DECLARE @CurrentCount INT = (SELECT COUNT(*) FROM Departments WHERE IsDeleted = 0);
DECLARE @ToGenerate INT = @TargetCount - @CurrentCount;

IF @ToGenerate > 0
BEGIN
    DECLARE @StartTime DATETIME2 = GETUTCDATE();
    DECLARE @ElapsedSeconds FLOAT;
    DECLARE @RecordsPerSecond FLOAT;
    
    PRINT '========================================';
    PRINT 'Starting Departments Data Generation';
    PRINT '========================================';
    PRINT 'Target: ' + CAST(@TargetCount AS VARCHAR) + ' records';
    PRINT 'Current: ' + CAST(@CurrentCount AS VARCHAR) + ' records';
    PRINT 'To Generate: ' + CAST(@ToGenerate AS VARCHAR) + ' records';
    PRINT 'Start Time: ' + CONVERT(VARCHAR(23), @StartTime, 121);
    PRINT '========================================';
    PRINT '';
    
    DECLARE @i INT = 0;
    DECLARE @BatchSize INT = 100;
    DECLARE @BatchCount INT = 0;
    
    -- Get the maximum existing Code number to ensure uniqueness
    DECLARE @MaxCodeNumber INT = 0;
    SELECT @MaxCodeNumber = ISNULL(MAX(CAST(SUBSTRING(Code, LEN(Code) - 2, 3) AS INT)), 0)
    FROM Departments
    WHERE Code LIKE '[A-Z][A-Z][A-Z][0-9][0-9][0-9]' 
       OR Code LIKE '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9]';
    
    -- Use timestamp suffix to ensure uniqueness across multiple runs
    DECLARE @TimestampSuffix VARCHAR(10) = RIGHT(REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(23), GETUTCDATE(), 121), '-', ''), ':', ''), ' ', ''), 6);
    
    DECLARE @DeptNames TABLE (Name VARCHAR(100), Code VARCHAR(20));
    INSERT INTO @DeptNames VALUES
        ('IT', 'IT'), ('HR', 'HR'), ('Finance', 'FIN'), ('Sales', 'SALES'), ('Marketing', 'MKT'),
        ('Operations', 'OPS'), ('Legal', 'LEG'), ('R&D', 'RD'), ('Quality', 'QA'), ('Support', 'SUP'),
        ('Security', 'SEC'), ('Logistics', 'LOG'), ('Procurement', 'PRO'), ('Training', 'TRN'), ('Admin', 'ADM');
    
    DECLARE @UserNames TABLE (UserName VARCHAR(100));
    INSERT INTO @UserNames VALUES
        ('DataSeeder'), ('SystemAdmin'), ('HRManager'), ('ITAdmin'), ('FinanceManager'),
        ('SalesManager'), ('OperationsManager'), ('QualityManager'), ('SupportManager'), ('AdminUser');
    
    DECLARE @RemarksTemplates TABLE (Remark VARCHAR(500));
    INSERT INTO @RemarksTemplates VALUES
        ('Established department for core business operations'),
        ('Department focused on innovation and development'),
        ('Key department for organizational growth'),
        ('Strategic department with high priority'),
        ('Department supporting daily operations'),
        ('Department responsible for quality assurance'),
        ('Department handling customer relations'),
        ('Department managing internal processes'),
        ('Department coordinating cross-functional activities'),
        ('Department ensuring compliance and standards');
    
    WHILE @i < @ToGenerate
    BEGIN
        DECLARE @BatchData TABLE (
            Name VARCHAR(100),
            Code VARCHAR(20),
            Description VARCHAR(500),
            ParentDepartmentId INT,
            Level INT,
            Path VARCHAR(500),
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
            
            DECLARE @DeptName VARCHAR(100);
            DECLARE @DeptCode VARCHAR(20);
            DECLARE @ParentId INT = NULL;
            DECLARE @Level INT = 1;
            DECLARE @Path VARCHAR(500);
            DECLARE @CreatedAt DATETIME2 = GETUTCDATE();
            DECLARE @CreatedBy VARCHAR(100);
            DECLARE @UpdatedAt DATETIME2 = NULL;
            DECLARE @UpdatedBy VARCHAR(100) = NULL;
            DECLARE @IsActive BIT = 1;
            DECLARE @IsDeleted BIT = 0;
            DECLARE @DeletedAt DATETIME2 = NULL;
            DECLARE @DeletedBy VARCHAR(100) = NULL;
            DECLARE @Remarks VARCHAR(MAX) = NULL;
            
            -- Random base department name
            SELECT TOP 1 @DeptName = Name, @DeptCode = Code 
            FROM @DeptNames 
            ORDER BY NEWID();
            
            -- Generate unique code: BaseCode + SequentialNumber + TimestampSuffix
            -- This ensures uniqueness even across multiple script runs
            DECLARE @CodeNumber INT = @MaxCodeNumber + @i;
            SET @DeptCode = @DeptCode + RIGHT('000' + CAST(@CodeNumber AS VARCHAR), 3) + @TimestampSuffix;
            
            -- Ensure Code doesn't exceed max length (20)
            IF LEN(@DeptCode) > 20
            BEGIN
                SET @DeptCode = LEFT(@DeptCode, 20);
            END
            
            -- Random creator
            SELECT TOP 1 @CreatedBy = UserName 
            FROM @UserNames 
            ORDER BY NEWID();
            
            -- 30% probability to create sub-department
            IF @i > 50 AND (ABS(CHECKSUM(NEWID())) % 100) < 30
            BEGIN
                SELECT TOP 1 @ParentId = Id, @Level = Level + 1
                FROM Departments 
                WHERE IsDeleted = 0 AND IsActive = 1 AND Level < 3
                ORDER BY NEWID();
                
                IF @ParentId IS NOT NULL
                BEGIN
                    DECLARE @ParentPath VARCHAR(500);
                    SELECT @ParentPath = Path FROM Departments WHERE Id = @ParentId;
                    SET @Path = @ParentPath + '/' + @DeptCode;
                END
                ELSE
                BEGIN
                    SET @Path = '/' + @DeptCode;
                END
            END
            ELSE
            BEGIN
                SET @Path = '/' + @DeptCode;
            END
            
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
                SET @Remarks = @Remarks + ' - Code: ' + @DeptCode + ', Level: ' + CAST(@Level AS VARCHAR);
            END
            
            INSERT INTO @BatchData VALUES (
                @DeptName + ' ' + CAST(@CodeNumber AS VARCHAR),
                @DeptCode,
                'Department ' + @DeptName + ' - ' + CAST(@CodeNumber AS VARCHAR) + '. This department is responsible for ' + 
                CASE @DeptName
                    WHEN 'IT' THEN 'information technology infrastructure and support'
                    WHEN 'HR' THEN 'human resources management and employee relations'
                    WHEN 'Finance' THEN 'financial planning, accounting, and budget management'
                    WHEN 'Sales' THEN 'sales operations and customer acquisition'
                    WHEN 'Marketing' THEN 'marketing strategies and brand management'
                    WHEN 'Operations' THEN 'daily operational activities and process optimization'
                    WHEN 'Legal' THEN 'legal compliance and contract management'
                    WHEN 'R&D' THEN 'research and development initiatives'
                    WHEN 'Quality' THEN 'quality assurance and standards compliance'
                    WHEN 'Support' THEN 'customer support and technical assistance'
                    WHEN 'Security' THEN 'security protocols and risk management'
                    WHEN 'Logistics' THEN 'supply chain and logistics coordination'
                    WHEN 'Procurement' THEN 'procurement and vendor management'
                    WHEN 'Training' THEN 'employee training and development programs'
                    WHEN 'Admin' THEN 'administrative support and office management'
                    ELSE 'general business operations'
                END + '.',
                @ParentId,
                @Level,
                @Path,
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
        
        INSERT INTO Departments (
            Name, Code, Description, ParentDepartmentId, Level, Path,
            CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
            IsActive, IsDeleted, DeletedAt, DeletedBy,
            Version, SortOrder, Remarks
        )
        SELECT 
            Name, Code, Description, ParentDepartmentId, Level, Path,
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
    
    DECLARE @EndTime DATETIME2 = GETUTCDATE();
    DECLARE @TotalElapsedSeconds FLOAT = DATEDIFF(MILLISECOND, @StartTime, @EndTime) / 1000.0;
    DECLARE @TotalRecordsPerSecond FLOAT = @i / NULLIF(@TotalElapsedSeconds, 0);
    
    DECLARE @TotalCount INT;
    DECLARE @ActiveCount INT;
    DECLARE @InactiveCount INT;
    DECLARE @DeletedCountFinal INT;
    DECLARE @UpdatedCount INT;
    DECLARE @RemarksCount INT;
    
    SELECT @TotalCount = COUNT(*) FROM Departments WHERE IsDeleted = 0;
    SELECT @ActiveCount = COUNT(*) FROM Departments WHERE IsDeleted = 0 AND IsActive = 1;
    SELECT @InactiveCount = COUNT(*) FROM Departments WHERE IsDeleted = 0 AND IsActive = 0;
    SELECT @DeletedCountFinal = COUNT(*) FROM Departments WHERE IsDeleted = 1;
    SELECT @UpdatedCount = COUNT(*) FROM Departments WHERE UpdatedAt IS NOT NULL;
    SELECT @RemarksCount = COUNT(*) FROM Departments WHERE Remarks IS NOT NULL;
    
    PRINT '';
    PRINT '========================================';
    PRINT '[SUCCESS] Departments generation completed!';
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
    PRINT '  - With Updates: ' + CAST(@UpdatedCount AS VARCHAR);
    PRINT '  - With Remarks: ' + CAST(@RemarksCount AS VARCHAR);
    PRINT '========================================';
END
ELSE
BEGIN
    PRINT '[INFO] Departments table already has ' + CAST(@CurrentCount AS VARCHAR) + ' records.';
END
GO