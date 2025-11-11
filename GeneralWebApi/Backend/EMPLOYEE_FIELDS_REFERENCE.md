# Employee 表格字段说明

## 📋 字段分类总览

### ✅ **前端必须传入的字段**（必填）

根据 `CreateEmployeeDtoValidator` 验证规则，以下字段是**必填**的：

| 字段名 | 类型 | 验证规则 | 说明 |
|--------|------|----------|------|
| `FirstName` | string | NotEmpty, MaxLength(50) | 名字 |
| `LastName` | string | NotEmpty, MaxLength(50) | 姓氏 |
| `Email` | string | NotEmpty, EmailAddress, MaxLength(100) | 邮箱（必须唯一） |
| `HireDate` | DateTime | NotEmpty, <= Today | 入职日期 |
| `EmploymentStatus` | string | NotEmpty | 雇佣状态（如：Active, Terminated） |
| `EmploymentType` | string | NotEmpty | 雇佣类型（如：FullTime, PartTime） |
| `TaxCode` | string | NotEmpty, MaxLength(50) | 税号（数据库不允许 NULL） |

### 🔵 **前端可选传入的字段**（可选）

以下字段前端可以传入，也可以不传（有默认值或可为空）：

| 字段名 | 类型 | 验证规则 | 默认值/说明 |
|--------|------|----------|-------------|
| `EmployeeNumber` | string? | MaxLength(20) | **可选**：如果未提供，后端会自动生成唯一编号 |
| `PhoneNumber` | string | MaxLength(20) | 电话号码（注意：Employee 实体中没有此字段，可能映射到其他字段） |
| `DepartmentId` | int? | - | 部门ID |
| `PositionId` | int? | - | 职位ID |
| `ManagerId` | int? | - | 上级经理ID |
| `CurrentSalary` | decimal? | >= 0 (当有值时) | 当前薪资 |
| `SalaryCurrency` | string? | - | 薪资货币 |
| `Address` | string | MaxLength(200) | 地址 |
| `City` | string | MaxLength(50) | 城市 |
| `PostalCode` | string | MaxLength(10) | 邮编 |
| `Country` | string | MaxLength(50) | 国家 |
| `EmergencyContactName` | string | - | 紧急联系人姓名 |
| `EmergencyContactPhone` | string | - | 紧急联系人电话 |
| `EmergencyContactRelation` | string | - | 紧急联系人关系 |

### 🤖 **后端自动生成的字段**（前端不需要传入）

以下字段由后端自动设置，前端**不需要**传入：

#### 1. 自动生成的业务字段

| 字段名 | 生成逻辑 | 说明 |
|--------|----------|------|
| `EmployeeNumber` | 如果前端未提供，自动生成格式：`EMP` + 8位随机大写字母数字 | 通过 `GenerateUniqueEmployeeNumberAsync()` 生成，确保唯一性 |

#### 2. 自动设置的审计字段（继承自 BaseEntity）

| 字段名 | 自动设置值 | 设置位置 |
|--------|------------|----------|
| `Id` | 数据库自增主键 | EF Core 自动生成 |
| `CreatedAt` | `DateTime.UtcNow` | `BaseRepository.SetAuditFieldsForCreation()` |
| `UpdatedAt` | `DateTime.UtcNow` | `BaseRepository.SetAuditFieldsForCreation()` |
| `IsActive` | `true` | `BaseRepository.SetAuditFieldsForCreation()` |
| `IsDeleted` | `false` | `BaseRepository.SetAuditFieldsForCreation()` |
| `Version` | `1` | `BaseRepository.SetAuditFieldsForCreation()` |
| `CreatedBy` | 默认 `string.Empty` | 可通过业务逻辑设置 |
| `UpdatedBy` | `null` | 可通过业务逻辑设置 |
| `DeletedAt` | `null` | 删除时设置 |
| `DeletedBy` | `null` | 删除时设置 |
| `SortOrder` | `0` | 默认值 |
| `Remarks` | `null` | 默认值 |

#### 3. Employee 实体中其他未在 DTO 中的字段

以下字段在 Employee 实体中存在，但**不在 CreateEmployeeDto 中**，前端无法传入：

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `TerminationDate` | DateTime? | `null` | 离职日期（通过更新操作设置） |
| `LastSalaryIncreaseDate` | DateTime? | `null` | 上次加薪日期 |
| `NextSalaryIncreaseDate` | DateTime? | `null` | 下次加薪日期 |
| `WorkingHoursPerWeek` | int? | `null` | 每周工作小时数 |
| `IsManager` | bool | `false` | 是否为经理 |

## 📝 前端创建员工时的最小请求示例

### 最小必填字段示例：

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "hireDate": "2024-01-15T00:00:00Z",
  "employmentStatus": "Active",
  "employmentType": "FullTime",
  "taxCode": "TAX12345678"
}
```

### 完整字段示例（包含所有可选字段）：

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "employeeNumber": "EMP12345678",  // 可选，不传会自动生成
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "departmentId": 1,
  "positionId": 2,
  "managerId": 3,
  "hireDate": "2024-01-15T00:00:00Z",
  "employmentStatus": "Active",
  "employmentType": "FullTime",
  "currentSalary": 50000.00,
  "salaryCurrency": "USD",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567891",
  "emergencyContactRelation": "Spouse",
  "taxCode": "TAX12345678"
}
```

## 🔍 唯一性检查

后端会在创建时检查以下字段的唯一性（仅检查未删除且 Active 的员工）：

1. **EmployeeNumber** - 如果前端提供了，会检查是否重复
2. **Email** - 必须唯一

如果重复，会抛出 `InvalidOperationException` 异常。

## ⚠️ 注意事项

1. **EmployeeNumber 自动生成**：如果前端不传 `employeeNumber`，后端会自动生成唯一编号（格式：`EMP` + 8位随机字符）
2. **PhoneNumber 字段**：`CreateEmployeeDto` 中有 `PhoneNumber`，但 `Employee` 实体中没有对应字段，可能需要检查 AutoMapper 配置或数据库迁移
3. **TaxCode 字段**：数据库列不允许 NULL，因此是**必填字段**，前端必须提供
4. **唯一性检查范围**：唯一性检查只针对 `IsDeleted = false` 且 `IsActive = true` 的员工，已删除或未激活的员工不会影响唯一性判断

## 📊 字段映射关系

### CreateEmployeeDto → Employee 实体映射

| CreateEmployeeDto | Employee 实体 | 说明 |
|-------------------|---------------|------|
| FirstName | FirstName | ✅ 直接映射 |
| LastName | LastName | ✅ 直接映射 |
| EmployeeNumber | EmployeeNumber | ✅ 直接映射（可选，可自动生成） |
| Email | Email | ✅ 直接映射 |
| PhoneNumber | ❓ | ⚠️ Employee 实体中没有此字段 |
| DepartmentId | DepartmentId | ✅ 直接映射 |
| PositionId | PositionId | ✅ 直接映射 |
| ManagerId | ManagerId | ✅ 直接映射 |
| HireDate | HireDate | ✅ 直接映射 |
| EmploymentStatus | EmploymentStatus | ✅ 直接映射 |
| EmploymentType | EmploymentType | ✅ 直接映射 |
| CurrentSalary | CurrentSalary | ✅ 直接映射 |
| SalaryCurrency | SalaryCurrency | ✅ 直接映射 |
| Address | Address | ✅ 直接映射 |
| City | City | ✅ 直接映射 |
| PostalCode | PostalCode | ✅ 直接映射 |
| Country | Country | ✅ 直接映射 |
| EmergencyContactName | EmergencyContactName | ✅ 直接映射 |
| EmergencyContactPhone | EmergencyContactPhone | ✅ 直接映射 |
| EmergencyContactRelation | EmergencyContactRelation | ✅ 直接映射 |
| TaxCode | TaxCode | ✅ 直接映射（必填） |

