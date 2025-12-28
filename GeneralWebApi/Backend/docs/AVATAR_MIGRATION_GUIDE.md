# Avatar 字段迁移指南

## 📋 概述

已在 `Employee` 实体中添加了 `Avatar` 字段，用于存储员工头像的URL。现在需要创建数据库迁移来更新数据库表结构。

## ✅ 已完成的更改

### 1. 实体层 (Domain)
- ✅ 在 `Employee.cs` 中添加了 `Avatar` 属性
  ```csharp
  public string? Avatar { get; set; }
  ```

### 2. DTO层 (Application)
- ✅ 在 `EmployeeDto.cs` 中添加了 `Avatar` 属性
- ✅ 在 `UpdateEmployeeDto.cs` 中添加了 `Avatar` 属性
- ✅ 在 `CreateEmployeeDto.cs` 中添加了 `Avatar` 属性（可选）

### 3. 数据库配置层 (Infrastructure)
- ✅ 在 `EmployeeConfigurations.cs` 中添加了 `Avatar` 字段配置
  ```csharp
  builder.Property(e => e.Avatar).HasMaxLength(500);
  ```

### 4. 映射层 (Application)
- ✅ AutoMapper 会自动映射 `Avatar` 字段（字段名相同，无需额外配置）

## 🔧 需要执行的步骤

### 步骤 1: 创建数据库迁移

在项目根目录或 Backend 目录下执行：

```bash
# 进入 Backend 项目目录
cd GeneralWebApi/Backend

# 创建迁移（Windows PowerShell）
dotnet ef migrations add AddAvatarToEmployee --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi

# 或者如果使用 cmd
dotnet ef migrations add AddAvatarToEmployee --project src\4-Infrastructure\GeneralWebApi.Integration --startup-project src\1-Presentation\GeneralWebApi.WebApi
```

### 步骤 2: 检查迁移文件

迁移文件应该包含类似以下内容：

```csharp
migrationBuilder.AddColumn<string>(
    name: "Avatar",
    table: "Employees",
    type: "nvarchar(500)",
    maxLength: 500,
    nullable: true);
```

### 步骤 3: 应用迁移到数据库

```bash
# 应用迁移
dotnet ef database update --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi

# 或者如果使用 cmd
dotnet ef database update --project src\4-Infrastructure\GeneralWebApi.Integration --startup-project src\1-Presentation\GeneralWebApi.WebApi
```

## 📝 数据流说明

### 头像上传流程

1. **前端上传文件**
   - 用户在前端选择头像图片
   - 前端调用 `/api/v1/document/upload` 上传文件
   - 后端返回文件ID和元数据

2. **构建头像URL**
   - 前端使用文件ID构建下载URL：`/api/v1/document/files/download/{fileId}`
   - 或者使用完整URL：`{baseUrl}/api/v1/document/files/download/{fileId}`

3. **保存头像URL到员工记录**
   - 前端在更新员工信息时，将头像URL包含在 `UpdateEmployeeDto.Avatar` 中
   - 后端保存URL到 `Employee.Avatar` 字段

4. **获取员工信息时返回头像**
   - 后端查询员工时，`EmployeeDto.Avatar` 会自动包含头像URL
   - 前端可以直接使用该URL显示头像

## 🔍 验证步骤

### 1. 验证数据库结构

```sql
-- 检查 Employees 表是否有 Avatar 列
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Employees' AND COLUMN_NAME = 'Avatar';
```

预期结果：
- `COLUMN_NAME`: Avatar
- `DATA_TYPE`: nvarchar
- `CHARACTER_MAXIMUM_LENGTH`: 500
- `IS_NULLABLE`: YES

### 2. 验证API响应

调用获取员工API，检查响应中是否包含 `avatar` 字段：

```bash
GET /api/v1/employees/{id}
```

响应应该包含：
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  ...
  "avatar": "https://localhost:7297/api/v1/document/files/download/123"
}
```

### 3. 验证更新功能

更新员工信息时，可以包含 `avatar` 字段：

```bash
PUT /api/v1/employees/{id}
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  ...
  "avatar": "https://localhost:7297/api/v1/document/files/download/123"
}
```

## ⚠️ 注意事项

1. **头像URL长度限制**
   - 数据库字段最大长度为 500 字符
   - 确保生成的URL不超过此限制

2. **现有数据**
   - 迁移后，现有员工的 `Avatar` 字段将为 `NULL`
   - 这是预期的行为，因为之前没有头像数据

3. **文件存储**
   - 头像文件存储在文件系统中（通过 `DocumentController` 管理）
   - `Avatar` 字段只存储URL，不存储实际文件数据
   - 如果文件被删除，需要手动清理 `Avatar` 字段

4. **URL格式**
   - 建议使用相对URL或完整URL
   - 相对URL格式：`/api/v1/document/files/download/{fileId}`
   - 完整URL格式：`{baseUrl}/api/v1/document/files/download/{fileId}`

## 🎯 总结

- ✅ 实体、DTO、配置都已更新
- ✅ AutoMapper 会自动处理映射
- ⏳ **需要执行数据库迁移**（步骤1-3）
- ⏳ **验证功能**（步骤4）

完成迁移后，头像功能将完全可用！

