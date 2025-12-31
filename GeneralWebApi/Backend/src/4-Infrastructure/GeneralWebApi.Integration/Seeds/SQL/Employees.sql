-- =============================================
-- Employees 表测试数据生成脚本 (1,000,000条) - 完整修复版
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
DECLARE @CleanupMode INT = 0;  -- 修改这里选择清理模式

DECLARE @TargetCount INT = 1000000;
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
        SELECT @DeletedCount = COUNT(*) FROM Employees WHERE CreatedBy = 'DataSeeder';
        PRINT 'Mode: Delete test data only (CreatedBy = ''DataSeeder'')';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        
        BEGIN TRY
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            DELETE FROM Employees WHERE CreatedBy = 'DataSeeder';
            
            SET @DeletedCount = @@ROWCOUNT;
            
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            COMMIT TRANSACTION;
            
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' test records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            
            BEGIN TRY
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            END TRY
            BEGIN CATCH
            END CATCH
            
            PRINT '[ERROR] Failed to delete test data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 2
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Employees;
        PRINT 'Mode: Hard delete all data';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            DELETE FROM Employees;
            
            SET @DeletedCount = @@ROWCOUNT;
            
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            END TRY
            BEGIN CATCH
            END CATCH
            PRINT '[ERROR] Failed to delete data: ' + ERROR_MESSAGE();
            THROW;
        END CATCH
    END
    ELSE IF @CleanupMode = 3
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Employees WHERE IsDeleted = 0;
        PRINT 'Mode: Soft delete all data (UPDATE IsDeleted = 1)';
        PRINT 'Records to soft delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        UPDATE Employees 
        SET IsDeleted = 1,
            DeletedAt = GETUTCDATE(),
            DeletedBy = 'DataSeeder'
        WHERE IsDeleted = 0;
        
        PRINT '[SUCCESS] Soft deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
    END
    ELSE IF @CleanupMode = 4
    BEGIN
        SELECT @DeletedCount = COUNT(*) FROM Employees;
        PRINT 'Mode: TRUNCATE table (will reset identity)';
        PRINT 'Records to delete: ' + CAST(@DeletedCount AS VARCHAR);
        
        BEGIN TRANSACTION;
        BEGIN TRY
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees NOCHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            TRUNCATE TABLE Employees;
            
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
            ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
            
            COMMIT TRANSACTION;
            PRINT '[SUCCESS] Truncated table, deleted ' + CAST(@DeletedCount AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            BEGIN TRY
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Departments_DepartmentId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Positions_PositionId;
                ALTER TABLE Employees CHECK CONSTRAINT FK_Employees_Employees_ManagerId;
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
DECLARE @CurrentCount INT = (SELECT COUNT(*) FROM Employees WHERE IsDeleted = 0);
DECLARE @ToGenerate INT = @TargetCount - @CurrentCount;
DECLARE @BatchSize INT = 1000;

IF @ToGenerate > 0
BEGIN
    DECLARE @StartTime DATETIME2 = GETUTCDATE();
    DECLARE @ElapsedSeconds FLOAT;
    DECLARE @RecordsPerSecond FLOAT;
    
    PRINT '========================================';
    PRINT 'Starting Employees Data Generation';
    PRINT '========================================';
    PRINT 'Target: ' + CAST(@TargetCount AS VARCHAR) + ' records';
    PRINT 'Current: ' + CAST(@CurrentCount AS VARCHAR) + ' records';
    PRINT 'To Generate: ' + CAST(@ToGenerate AS VARCHAR) + ' records';
    PRINT 'Batch Size: ' + CAST(@BatchSize AS VARCHAR);
    PRINT 'Start Time: ' + CONVERT(VARCHAR(23), @StartTime, 121);
    PRINT '========================================';
    PRINT '';
    
    -- Get all valid departments and positions
    DECLARE @Departments TABLE (Id INT, Code VARCHAR(20));
    DECLARE @Positions TABLE (Id INT, DepartmentId INT, MinSalary DECIMAL(18,2), MaxSalary DECIMAL(18,2));
    
    INSERT INTO @Departments 
    SELECT Id, Code FROM Departments WHERE IsDeleted = 0 AND IsActive = 1;
    
    INSERT INTO @Positions 
    SELECT Id, DepartmentId, MinSalary, MaxSalary 
    FROM Positions 
    WHERE IsDeleted = 0 AND IsActive = 1;
    
    IF NOT EXISTS (SELECT 1 FROM @Departments) OR NOT EXISTS (SELECT 1 FROM @Positions)
    BEGIN
        PRINT '[ERROR] Departments or Positions not found. Please run foreign key table seeders first.';
        RETURN;
    END
    
    DECLARE @DeptCount INT = (SELECT COUNT(*) FROM @Departments);
    DECLARE @PosCount INT = (SELECT COUNT(*) FROM @Positions);
    
    PRINT '[INFO] Available: ' + CAST(@DeptCount AS VARCHAR) + ' Departments, ' + CAST(@PosCount AS VARCHAR) + ' Positions';
    PRINT '';
    
    -- Get existing managers per department (to avoid unique index violation)
    DECLARE @ExistingManagers TABLE (DepartmentId INT);
    INSERT INTO @ExistingManagers
    SELECT DISTINCT DepartmentId 
    FROM Employees 
    WHERE IsManager = 1 AND IsDeleted = 0 AND IsActive = 1 AND DepartmentId IS NOT NULL;
    
    -- Track managers assigned in current batch (to avoid duplicates within batch)
    DECLARE @BatchManagers TABLE (DepartmentId INT);
    
    -- Get maximum EmployeeNumber to ensure uniqueness
    DECLARE @MaxEmpNum INT = 0;
    SELECT @MaxEmpNum = ISNULL(MAX(
        CASE 
            WHEN EmployeeNumber LIKE 'EMP%' AND LEN(EmployeeNumber) >= 9 THEN 
                CASE 
                    WHEN ISNUMERIC(SUBSTRING(EmployeeNumber, 4, 6)) = 1 
                    THEN CAST(SUBSTRING(EmployeeNumber, 4, 6) AS INT)
                    ELSE 0
                END
            ELSE 0
        END
    ), 0)
    FROM Employees;
    
    -- Use timestamp suffix for uniqueness
    DECLARE @TimestampSuffix VARCHAR(6) = RIGHT(REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(23), GETUTCDATE(), 121), '-', ''), ':', ''), ' ', ''), 6);
    
    -- Name data
    DECLARE @FirstNames TABLE (Name VARCHAR(50));
    DECLARE @LastNames TABLE (Name VARCHAR(50));
    
    INSERT INTO @FirstNames VALUES
        ('伟'), ('芳'), ('娜'), ('秀英'), ('敏'), ('静'), ('丽'), ('强'), ('磊'), ('军'),
        ('洋'), ('勇'), ('艳'), ('杰'), ('娟'), ('涛'), ('明'), ('超'), ('秀兰'), ('霞'),
        ('平'), ('刚'), ('桂英'), ('建华'), ('文'), ('华'), ('建国'), ('建军'), ('红'), ('梅'),
        ('James'), ('Mary'), ('John'), ('Patricia'), ('Robert'), ('Jennifer'), ('Michael'), ('Linda'),
        ('William'), ('Elizabeth'), ('David'), ('Barbara'), ('Richard'), ('Susan'), ('Joseph'), ('Jessica'),
        ('Thomas'), ('Sarah'), ('Charles'), ('Karen'), ('Christopher'), ('Nancy'), ('Daniel'), ('Lisa'),
        ('Matthew'), ('Betty'), ('Anthony'), ('Helen'), ('Mark'), ('Sandra'), ('Donald'), ('Donna');
    
    INSERT INTO @LastNames VALUES
        ('王'), ('李'), ('张'), ('刘'), ('陈'), ('杨'), ('赵'), ('黄'), ('周'), ('吴'),
        ('徐'), ('孙'), ('胡'), ('朱'), ('高'), ('林'), ('何'), ('郭'), ('马'), ('罗'),
        ('梁'), ('宋'), ('郑'), ('谢'), ('韩'), ('唐'), ('冯'), ('于'), ('董'), ('萧'),
        ('Smith'), ('Johnson'), ('Williams'), ('Brown'), ('Jones'), ('Garcia'), ('Miller'), ('Davis'),
        ('Rodriguez'), ('Martinez'), ('Hernandez'), ('Lopez'), ('Wilson'), ('Anderson'), ('Thomas'), ('Taylor');
    
    DECLARE @Cities TABLE (City VARCHAR(50), Country VARCHAR(50), PostalCode VARCHAR(20));
    INSERT INTO @Cities VALUES
        ('北京', 'China', '100000'), ('上海', 'China', '200000'), ('广州', 'China', '510000'), ('深圳', 'China', '518000'),
        ('杭州', 'China', '310000'), ('成都', 'China', '610000'), ('武汉', 'China', '430000'), ('西安', 'China', '710000'),
        ('New York', 'USA', '10001'), ('Los Angeles', 'USA', '90001'), ('Chicago', 'USA', '60601'), ('Houston', 'USA', '77001'),
        ('London', 'UK', 'SW1A 1AA'), ('Paris', 'France', '75001'), ('Berlin', 'Germany', '10115'), ('Tokyo', 'Japan', '100-0001');
    
    DECLARE @EmploymentStatuses TABLE (Status VARCHAR(20));
    INSERT INTO @EmploymentStatuses VALUES 
        ('Active'), ('Active'), ('Active'), ('Active'), ('Active'), ('Active'), ('Active'), ('Active'),
        ('Inactive'), ('Terminated'), ('OnLeave');
    
    DECLARE @EmploymentTypes TABLE (Type VARCHAR(20));
    INSERT INTO @EmploymentTypes VALUES 
        ('FullTime'), ('FullTime'), ('FullTime'),
        ('PartTime'), ('Contract'), ('Intern');
    
    DECLARE @Currencies TABLE (Currency VARCHAR(10));
    INSERT INTO @Currencies VALUES ('CNY'), ('CNY'), ('USD'), ('EUR'), ('GBP');
    
    DECLARE @Relations TABLE (Relation VARCHAR(20));
    INSERT INTO @Relations VALUES ('Spouse'), ('Parent'), ('Sibling'), ('Friend'), ('Other');
    
    DECLARE @UserNames TABLE (UserName VARCHAR(100));
    INSERT INTO @UserNames VALUES
        ('DataSeeder'), ('SystemAdmin'), ('HRManager'), ('ITAdmin'), ('FinanceManager'),
        ('SalesManager'), ('OperationsManager'), ('QualityManager'), ('SupportManager'), ('AdminUser');
    
    DECLARE @RemarksTemplates TABLE (Remark VARCHAR(500));
    INSERT INTO @RemarksTemplates VALUES
        ('Employee with excellent performance record'),
        ('Key contributor to team success'),
        ('Experienced professional with strong technical skills'),
        ('Demonstrates leadership potential'),
        ('Reliable team member with consistent performance'),
        ('Specialized expertise in assigned area'),
        ('Active participant in company initiatives'),
        ('Strong communication and collaboration skills');
    
    DECLARE @i INT = 0;
    DECLARE @BatchCount INT = 0;
    
    WHILE @i < @ToGenerate
    BEGIN
        BEGIN TRANSACTION;
        
        BEGIN TRY
            -- Clear batch managers tracking
            DELETE FROM @BatchManagers;
            
            DECLARE @BatchData TABLE (
                FirstName VARCHAR(50),
                LastName VARCHAR(50),
                EmployeeNumber VARCHAR(20),
                Email VARCHAR(255),
                PhoneNumber VARCHAR(50),
                DepartmentId INT,
                PositionId INT,
                ManagerId INT,
                HireDate DATETIME2,
                TerminationDate DATETIME2,
                Address VARCHAR(200),
                City VARCHAR(50),
                PostalCode VARCHAR(20),
                Country VARCHAR(50),
                EmergencyContactName VARCHAR(100),
                EmergencyContactPhone VARCHAR(50),
                EmergencyContactRelation VARCHAR(20),
                TaxCode VARCHAR(16),
                CurrentSalary DECIMAL(18,2),
                SalaryCurrency VARCHAR(10),
                LastSalaryIncreaseDate DATETIME2,
                NextSalaryIncreaseDate DATETIME2,
                EmploymentStatus VARCHAR(20),
                EmploymentType VARCHAR(20),
                WorkingHoursPerWeek INT,
                IsManager BIT,
                Avatar VARCHAR(500),
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
                
                -- Generate name
                DECLARE @FirstName VARCHAR(50);
                DECLARE @LastName VARCHAR(50);
                SELECT TOP 1 @FirstName = Name FROM @FirstNames ORDER BY NEWID();
                SELECT TOP 1 @LastName = Name FROM @LastNames ORDER BY NEWID();
                
                -- Generate unique employee number
                DECLARE @EmpNum INT = @MaxEmpNum + @i;
                DECLARE @EmpNumStr VARCHAR(20) = 'EMP' + RIGHT('000000' + CAST(@EmpNum AS VARCHAR), 6) + @TimestampSuffix;
                
                -- Generate unique email
                DECLARE @Email VARCHAR(255) = LOWER(REPLACE(@FirstName, ' ', '')) + '.' + 
                    LOWER(REPLACE(@LastName, ' ', '')) + CAST(@EmpNum AS VARCHAR) + '@test.com';
                
                -- Random select department and position
                DECLARE @DeptId INT;
                DECLARE @PosId INT;
                DECLARE @SelectedDeptId INT;
                
                SELECT TOP 1 @SelectedDeptId = Id FROM @Departments ORDER BY NEWID();
                SET @DeptId = @SelectedDeptId;
                
                -- Select position from same department
                SELECT TOP 1 @PosId = Id 
                FROM @Positions 
                WHERE DepartmentId = @SelectedDeptId
                ORDER BY NEWID();
                
                IF @PosId IS NULL
                BEGIN
                    SELECT TOP 1 @PosId = Id FROM @Positions ORDER BY NEWID();
                END
                
                -- Generate hire date (random within last 10 years)
                DECLARE @HireDate DATETIME2 = DATEADD(DAY, -ABS(CHECKSUM(NEWID()) % 3650), GETUTCDATE());
                
                -- Generate termination date (10% probability)
                DECLARE @TerminationDate DATETIME2 = NULL;
                IF (ABS(CHECKSUM(NEWID())) % 100) < 10
                BEGIN
                    SET @TerminationDate = DATEADD(DAY, ABS(CHECKSUM(NEWID()) % 365), @HireDate);
                END
                
                -- Select city
                DECLARE @City VARCHAR(50);
                DECLARE @Country VARCHAR(50);
                DECLARE @PostalCode VARCHAR(20);
                SELECT TOP 1 @City = City, @Country = Country, @PostalCode = PostalCode 
                FROM @Cities ORDER BY NEWID();
                
                -- Generate salary based on position
                DECLARE @Salary DECIMAL(18,2);
                DECLARE @PosMinSalary DECIMAL(18,2);
                DECLARE @PosMaxSalary DECIMAL(18,2);
                
                SELECT @PosMinSalary = MinSalary, @PosMaxSalary = MaxSalary 
                FROM @Positions WHERE Id = @PosId;
                
                IF @PosMinSalary IS NOT NULL AND @PosMaxSalary IS NOT NULL AND @PosMaxSalary > @PosMinSalary
                BEGIN
                    DECLARE @SalaryRange DECIMAL(18,2) = @PosMaxSalary - @PosMinSalary;
                    SET @Salary = @PosMinSalary + (ABS(CHECKSUM(NEWID())) % CAST(@SalaryRange AS INT));
                END
                ELSE
                BEGIN
                    SET @Salary = 30000 + (ABS(CHECKSUM(NEWID())) % 120000);
                END
                
                DECLARE @Currency VARCHAR(10);
                SELECT TOP 1 @Currency = Currency FROM @Currencies ORDER BY NEWID();
                
                -- Employment status and type
                DECLARE @EmpStatus VARCHAR(20);
                DECLARE @EmpType VARCHAR(20);
                SELECT TOP 1 @EmpStatus = Status FROM @EmploymentStatuses ORDER BY NEWID();
                SELECT TOP 1 @EmpType = Type FROM @EmploymentTypes ORDER BY NEWID();
                
                -- Working hours
                DECLARE @WorkingHours INT = CASE @EmpType
                    WHEN 'FullTime' THEN 40
                    WHEN 'PartTime' THEN 20
                    WHEN 'Contract' THEN 30
                    ELSE 35
                END;
                
                -- Is manager: Check if department already has a manager (existing or in current batch)
                DECLARE @IsManager BIT = 0;
                DECLARE @DeptHasManager BIT = 0;
                
                -- Check if department already has a manager in existing data
                IF EXISTS (SELECT 1 FROM @ExistingManagers WHERE DepartmentId = @DeptId)
                BEGIN
                    SET @DeptHasManager = 1;
                END
                
                -- Check if department already has a manager in current batch
                IF EXISTS (SELECT 1 FROM @BatchManagers WHERE DepartmentId = @DeptId)
                BEGIN
                    SET @DeptHasManager = 1;
                END
                
                -- Only set as manager if department doesn't have one and random probability (5%)
                IF @DeptHasManager = 0 AND (ABS(CHECKSUM(NEWID())) % 100) < 5
                BEGIN
                    SET @IsManager = 1;
                    INSERT INTO @BatchManagers VALUES (@DeptId);
                    INSERT INTO @ExistingManagers VALUES (@DeptId);
                END
                
                -- Emergency contact
                DECLARE @EmergencyName VARCHAR(100);
                DECLARE @EmergencyRelation VARCHAR(20);
                SELECT TOP 1 @EmergencyName = Name FROM @LastNames ORDER BY NEWID();
                SELECT TOP 1 @EmergencyRelation = Relation FROM @Relations ORDER BY NEWID();
                
                -- Tax code: Use EmployeeNumber to ensure uniqueness (TaxCode has unique index)
                DECLARE @TaxCode VARCHAR(16) = 'TAX' + RIGHT('000000' + CAST(@EmpNum AS VARCHAR), 6) + @TimestampSuffix;
                
                -- Ensure TaxCode doesn't exceed max length (16)
                IF LEN(@TaxCode) > 16
                BEGIN
                    SET @TaxCode = LEFT(@TaxCode, 16);
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
                    SET @Remarks = @Remarks + ' - Employee #' + @EmpNumStr;
                END
                
                INSERT INTO @BatchData VALUES (
                    @FirstName,
                    @LastName,
                    @EmpNumStr,
                    @Email,
                    '+86' + CAST(13800000000 + (ABS(CHECKSUM(NEWID())) % 999999999) AS VARCHAR),
                    @DeptId,
                    @PosId,
                    NULL,
                    @HireDate,
                    @TerminationDate,
                    CAST(@EmpNum AS VARCHAR) + ' Main Street',
                    @City,
                    @PostalCode,
                    @Country,
                    @EmergencyName + ' ' + @FirstName,
                    '+86' + CAST(13800000000 + (ABS(CHECKSUM(NEWID())) % 999999999) AS VARCHAR),
                    @EmergencyRelation,
                    @TaxCode,
                    @Salary,
                    @Currency,
                    CASE WHEN (ABS(CHECKSUM(NEWID())) % 3) = 0 THEN DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365, @HireDate) ELSE NULL END,
                    DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365, GETUTCDATE()),
                    @EmpStatus,
                    @EmpType,
                    @WorkingHours,
                    @IsManager,
                    NULL,
                    @CreatedAt,
                    @CreatedBy,
                    @UpdatedAt,
                    @UpdatedBy,
                    @IsActive,
                    @IsDeleted,
                    @DeletedAt,
                    @DeletedBy,
                    1,
                    @EmpNum,
                    @Remarks
                );
            END;
            
            -- Batch insert
            INSERT INTO Employees (
                FirstName, LastName, EmployeeNumber, Email, PhoneNumber,
                DepartmentId, PositionId, ManagerId, HireDate, TerminationDate,
                Address, City, PostalCode, Country,
                EmergencyContactName, EmergencyContactPhone, EmergencyContactRelation, TaxCode,
                CurrentSalary, SalaryCurrency, LastSalaryIncreaseDate, NextSalaryIncreaseDate,
                EmploymentStatus, EmploymentType, WorkingHoursPerWeek, IsManager, Avatar,
                CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
                IsActive, IsDeleted, DeletedAt, DeletedBy,
                Version, SortOrder, Remarks
            )
            SELECT 
                FirstName, LastName, EmployeeNumber, Email, PhoneNumber,
                DepartmentId, PositionId, ManagerId, HireDate, TerminationDate,
                Address, City, PostalCode, Country,
                EmergencyContactName, EmergencyContactPhone, EmergencyContactRelation, TaxCode,
                CurrentSalary, SalaryCurrency, LastSalaryIncreaseDate, NextSalaryIncreaseDate,
                EmploymentStatus, EmploymentType, WorkingHoursPerWeek, IsManager, Avatar,
                CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
                IsActive, IsDeleted, DeletedAt, DeletedBy,
                Version, SortOrder, Remarks
            FROM @BatchData;
            
            COMMIT TRANSACTION;
            
            SET @BatchCount = @BatchCount + 1;
            DELETE FROM @BatchData;
            
            -- Progress reporting every 10 batches
            IF @BatchCount % 10 = 0
            BEGIN
                SET @ElapsedSeconds = DATEDIFF(MILLISECOND, @StartTime, GETUTCDATE()) / 1000.0;
                SET @RecordsPerSecond = @i / NULLIF(@ElapsedSeconds, 0);
                DECLARE @RemainingSeconds INT = CAST((@ToGenerate - @i) / NULLIF(@RecordsPerSecond, 0) AS INT);
                
                PRINT '  Progress: ' + CAST(@i AS VARCHAR) + ' / ' + CAST(@ToGenerate AS VARCHAR) + 
                      ' (' + CAST(CAST(@i * 100.0 / @ToGenerate AS DECIMAL(5,2)) AS VARCHAR) + '%)' +
                      ' | Rate: ' + CAST(CAST(@RecordsPerSecond AS INT) AS VARCHAR) + ' rows/sec' +
                      ' | ETA: ' + CAST(@RemainingSeconds / 60 AS VARCHAR) + ' min ' + CAST(@RemainingSeconds % 60 AS VARCHAR) + ' sec';
            END
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            PRINT '[ERROR] Error in batch ' + CAST(@BatchCount AS VARCHAR) + ': ' + ERROR_MESSAGE();
            BREAK;
        END CATCH
    END;
    
    -- Assign manager relationships (30% of employees have managers)
    PRINT '';
    PRINT 'Assigning manager relationships...';
    DECLARE @ManagerAssignStartTime DATETIME2 = GETUTCDATE();
    
    UPDATE e1
    SET e1.ManagerId = e2.Id
    FROM Employees e1
    CROSS APPLY (
        SELECT TOP 1 Id 
        FROM Employees e2 
        WHERE e2.IsManager = 1 
            AND e2.IsDeleted = 0 
            AND e2.IsActive = 1
            AND e2.DepartmentId = e1.DepartmentId
            AND e2.Id != e1.Id
        ORDER BY NEWID()
    ) e2
    WHERE e1.ManagerId IS NULL 
        AND e1.IsManager = 0
        AND e1.IsDeleted = 0 
        AND e1.IsActive = 1
        AND (ABS(CHECKSUM(CAST(e1.Id AS VARBINARY))) % 100) < 30;
    
    DECLARE @ManagerAssignElapsed FLOAT = DATEDIFF(MILLISECOND, @ManagerAssignStartTime, GETUTCDATE()) / 1000.0;
    PRINT '[SUCCESS] Manager assignment completed in ' + CAST(CAST(@ManagerAssignElapsed AS DECIMAL(10,2)) AS VARCHAR) + ' seconds';
    
    -- Final performance statistics
    DECLARE @EndTime DATETIME2 = GETUTCDATE();
    DECLARE @TotalElapsedSeconds FLOAT = DATEDIFF(MILLISECOND, @StartTime, @EndTime) / 1000.0;
    DECLARE @TotalRecordsPerSecond FLOAT = @i / NULLIF(@TotalElapsedSeconds, 0);
    
    DECLARE @TotalCount INT;
    DECLARE @ActiveCount INT;
    DECLARE @InactiveCount INT;
    DECLARE @DeletedCountFinal INT;
    DECLARE @UpdatedCount INT;
    DECLARE @RemarksCount INT;
    DECLARE @ManagerCount INT;
    DECLARE @UniqueDepts INT;
    DECLARE @UniquePositions INT;
    DECLARE @UniqueManagers INT;
    
    SELECT @TotalCount = COUNT(*) FROM Employees WHERE IsDeleted = 0;
    SELECT @ActiveCount = COUNT(*) FROM Employees WHERE IsDeleted = 0 AND IsActive = 1;
    SELECT @InactiveCount = COUNT(*) FROM Employees WHERE IsDeleted = 0 AND IsActive = 0;
    SELECT @DeletedCountFinal = COUNT(*) FROM Employees WHERE IsDeleted = 1;
    SELECT @UpdatedCount = COUNT(*) FROM Employees WHERE UpdatedAt IS NOT NULL;
    SELECT @RemarksCount = COUNT(*) FROM Employees WHERE Remarks IS NOT NULL;
    SELECT @ManagerCount = COUNT(*) FROM Employees WHERE IsDeleted = 0 AND IsManager = 1;
    SELECT @UniqueDepts = COUNT(DISTINCT DepartmentId) FROM Employees WHERE IsDeleted = 0 AND IsActive = 1;
    SELECT @UniquePositions = COUNT(DISTINCT PositionId) FROM Employees WHERE IsDeleted = 0 AND IsActive = 1;
    SELECT @UniqueManagers = COUNT(DISTINCT ManagerId) FROM Employees WHERE IsDeleted = 0 AND IsActive = 1 AND ManagerId IS NOT NULL;
    
    PRINT '';
    PRINT '========================================';
    PRINT '[SUCCESS] Employees generation completed!';
    PRINT '========================================';
    PRINT 'Performance Statistics:';
    PRINT '  Start Time: ' + CONVERT(VARCHAR(23), @StartTime, 121);
    PRINT '  End Time: ' + CONVERT(VARCHAR(23), @EndTime, 121);
    PRINT '  Total Duration: ' + CAST(CAST(@TotalElapsedSeconds / 60 AS DECIMAL(10,2)) AS VARCHAR) + ' minutes';
    PRINT '  Records Generated: ' + CAST(@i AS VARCHAR);
    PRINT '  Average Speed: ' + CAST(CAST(@TotalRecordsPerSecond AS INT) AS VARCHAR) + ' records/second';
    PRINT '';
    PRINT 'Data Statistics:';
    PRINT '  Total (not deleted): ' + CAST(@TotalCount AS VARCHAR);
    PRINT '  - Active: ' + CAST(@ActiveCount AS VARCHAR);
    PRINT '  - Inactive: ' + CAST(@InactiveCount AS VARCHAR);
    PRINT '  - Deleted: ' + CAST(@DeletedCountFinal AS VARCHAR);
    PRINT '  - Managers: ' + CAST(@ManagerCount AS VARCHAR);
    PRINT '  - With Updates: ' + CAST(@UpdatedCount AS VARCHAR);
    PRINT '  - With Remarks: ' + CAST(@RemarksCount AS VARCHAR);
    PRINT '';
    PRINT 'Relationship Statistics:';
    PRINT '  - Unique Departments: ' + CAST(@UniqueDepts AS VARCHAR);
    PRINT '  - Unique Positions: ' + CAST(@UniquePositions AS VARCHAR);
    PRINT '  - Unique Managers: ' + CAST(@UniqueManagers AS VARCHAR);
    PRINT '========================================';
END
ELSE
BEGIN
    PRINT '[INFO] Employees table already has ' + CAST(@CurrentCount AS VARCHAR) + ' records.';
END
GO