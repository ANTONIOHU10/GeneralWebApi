# PhoneNumber 字段迁移指南

## 📋 概述

已在 `Employee` 实体中添加了 `PhoneNumber` 字段，现在需要创建数据库迁移来更新数据库表结构。

## ✅ 已完成的更改

### 1. 实体层 (Domain)
- ✅ 在 `Employee.cs` 中添加了 `PhoneNumber` 属性
  ```csharp
  public string PhoneNumber { get; set; } = string.Empty;
  ```

### 2. 数据库配置层 (Infrastructure)
- ✅ 在 `EmployeeConfigurations.cs` 中添加了 `PhoneNumber` 字段配置
  ```csharp
  builder.Property(e => e.PhoneNumber).HasMaxLength(20);
  ```

### 3. 映射层 (Application)
- ✅ 更新了 `EmployeeMappingProfile.cs`，移除了手动设置 `PhoneNumber` 为空字符串的逻辑
- ✅ `PhoneNumber` 现在会自动从实体映射到 DTO

## 🔧 需要执行的步骤

### 步骤 1: 创建数据库迁移

在项目根目录或 Backend 目录下执行：

```bash
# 进入 Backend 项目目录
cd GeneralWebApi/Backend/src/4-Infrastructure/GeneralWebApi.Integration

# 创建迁移（Windows）
dotnet ef migrations add AddPhoneNumberToEmployee --startup-project ..\..\..\1-Presentation\GeneralWebApi.WebApi\GeneralWebApi.WebApi.csproj

# 或者如果已经在 Integration 项目目录
dotnet ef migrations add AddPhoneNumberToEmployee --startup-project ..\..\..\1-Presentation\GeneralWebApi.WebApi\GeneralWebApi.WebApi.csproj --project GeneralWebApi.Integration.csproj
```

### 步骤 2: 检查迁移文件

迁移文件应该包含类似以下内容：

```csharp
migrationBuilder.AddColumn<string>(
    name: "PhoneNumber",
    table: "Employees",
    type: "nvarchar(20)",
    maxLength: 20,
    nullable: false,
    defaultValue: "");
```

### 步骤 3: 应用迁移到数据库

```bash
# 应用迁移
dotnet ef database update --startup-project ..\..\..\1-Presentation\GeneralWebApi.WebApi\GeneralWebApi.WebApi.csproj

# 或者如果已经在 Integration 项目目录
dotnet ef database update --startup-project ..\..\..\1-Presentation\GeneralWebApi.WebApi\GeneralWebApi.WebApi.csproj --project GeneralWebApi.Integration.csproj
```

## 📊 字段配置详情

| 属性 | 值 |
|------|-----|
| 字段名 | `PhoneNumber` |
| 类型 | `string` (nvarchar) |
| 最大长度 | 20 |
| 是否必填 | 否（可为空字符串） |
| 默认值 | 空字符串 |

## ⚠️ 注意事项

1. **现有数据**: 迁移会将现有记录的 `PhoneNumber` 设置为空字符串（因为 `nullable: false` 且 `defaultValue: ""`）

2. **数据迁移**: 如果现有数据中有电话号码存储在其他地方，需要手动迁移数据

3. **验证**: 迁移后，验证：
   - 新创建的员工可以保存 `PhoneNumber`
   - 更新员工时可以修改 `PhoneNumber`
   - 查询员工时 `PhoneNumber` 正确返回

## 🧪 测试验证

迁移完成后，测试以下场景：

1. **创建员工**: 创建新员工时包含 `phoneNumber` 字段
2. **更新员工**: 更新现有员工的 `phoneNumber`
3. **查询员工**: 查询员工列表和详情时，`phoneNumber` 正确显示
4. **空值处理**: 不提供 `phoneNumber` 时，保存为空字符串

## 📝 相关文件

- `GeneralWebApi/Backend/src/3-Domain/GeneralWebApi.Domain/Entities/Anagraphy/Employee.cs`
- `GeneralWebApi/Backend/src/4-Infrastructure/GeneralWebApi.Integration/Configuration/Anagraphy/EmployeeConfigurations.cs`
- `GeneralWebApi/Backend/src/2-Application/GeneralWebApi.Application/Mappings/EmployeeMappingProfile.cs`
- `GeneralWebApi/Backend/src/2-Application/GeneralWebApi.DTOs/Employee/CreateEmployeeDto.cs`
- `GeneralWebApi/Backend/src/2-Application/GeneralWebApi.DTOs/Employee/UpdateEmployeeDto.cs`
- `GeneralWebApi/Backend/src/2-Application/GeneralWebApi.DTOs/Employee/EmployeeDto.cs`

