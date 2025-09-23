# 📚 API 文档

## API Documentation

**项目**: GeneralWebApi - Sistema di Gestione Aziendale Interna  
**版本**: v1.0  
**生成日期**: 2024 年 12 月 19 日  
**Base URL**: `https://api.company.com/api/v1`

---

## 📋 目录

1. [认证和授权](#认证和授权)
2. [员工管理 API](#员工管理api)
3. [部门管理 API](#部门管理api)
4. [职位管理 API](#职位管理api)
5. [权限管理 API](#权限管理api)
6. [文档管理 API](#文档管理api)
7. [合同管理 API](#合同管理api)
8. [通用响应格式](#通用响应格式)
9. [错误处理](#错误处理)
10. [状态码说明](#状态码说明)

---

## 🔐 认证和授权

### 获取访问令牌

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin@company.com",
  "password": "password123"
}
```

**响应**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### 刷新令牌

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### 注销

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

---

## 👥 员工管理 API

### 获取员工列表

```http
GET /api/v1/employees?page=1&pageSize=10&search=john&departmentId=1&sortBy=firstName&sortDescending=false
Authorization: Bearer {accessToken}
```

**查询参数**:

- `page`: 页码 (默认: 1)
- `pageSize`: 每页数量 (默认: 10, 最大: 100)
- `search`: 搜索关键词 (姓名、员工编号、邮箱)
- `departmentId`: 部门 ID 过滤
- `positionId`: 职位 ID 过滤
- `sortBy`: 排序字段 (firstName, lastName, employeeNumber, hireDate)
- `sortDescending`: 是否降序 (默认: false)

**响应**:

```json
{
  "success": true,
  "message": "员工列表获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "employeeNumber": "EMP001",
        "email": "john.doe@company.com",
        "departmentName": "IT Department",
        "positionName": "Software Developer",
        "hireDate": "2024-01-15T00:00:00Z",
        "employmentStatus": "Active"
      }
    ],
    "totalCount": 100,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 获取单个员工

```http
GET /api/v1/employees/{id}
Authorization: Bearer {accessToken}
```

**响应**:

```json
{
  "success": true,
  "message": "员工信息获取成功",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "employeeNumber": "EMP001",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567891",
    "emergencyContactRelation": "Spouse",
    "taxCode": "TAX123456",
    "currentSalary": 75000.0,
    "salaryCurrency": "USD",
    "employmentStatus": "Active",
    "employmentType": "Full-time",
    "workingHoursPerWeek": 40,
    "isManager": false,
    "hireDate": "2024-01-15T00:00:00Z",
    "terminationDate": null,
    "departmentId": 1,
    "departmentName": "IT Department",
    "positionId": 1,
    "positionName": "Software Developer",
    "managerId": 2,
    "managerName": "Jane Smith"
  }
}
```

### 创建员工

```http
POST /api/v1/employees
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "employeeNumber": "EMP001",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567891",
  "emergencyContactRelation": "Spouse",
  "taxCode": "TAX123456",
  "currentSalary": 75000.00,
  "salaryCurrency": "USD",
  "employmentStatus": "Active",
  "employmentType": "Full-time",
  "workingHoursPerWeek": 40,
  "hireDate": "2024-01-15T00:00:00Z",
  "departmentId": 1,
  "positionId": 1,
  "managerId": 2
}
```

### 更新员工

```http
PUT /api/v1/employees/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "currentSalary": 80000.00,
  "employmentStatus": "Active"
}
```

### 删除员工

```http
DELETE /api/v1/employees/{id}
Authorization: Bearer {accessToken}
```

---

## 🏢 部门管理 API

### 获取部门列表

```http
GET /api/v1/departments?page=1&pageSize=10&search=it&parentId=1&level=2
Authorization: Bearer {accessToken}
```

### 获取部门层级结构

```http
GET /api/v1/departments/hierarchy
Authorization: Bearer {accessToken}
```

**响应**:

```json
{
  "success": true,
  "message": "部门层级结构获取成功",
  "data": [
    {
      "id": 1,
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "level": 1,
      "path": "IT",
      "parentDepartmentId": null,
      "subDepartments": [
        {
          "id": 2,
          "name": "Development",
          "code": "DEV",
          "level": 2,
          "path": "IT/Development",
          "parentDepartmentId": 1,
          "subDepartments": []
        }
      ]
    }
  ]
}
```

### 获取子部门

```http
GET /api/v1/departments/parent/{parentId}
Authorization: Bearer {accessToken}
```

### 创建部门

```http
POST /api/v1/departments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "New Department",
  "code": "NEW",
  "description": "New Department Description",
  "parentDepartmentId": 1,
  "level": 2
}
```

### 更新部门

```http
PUT /api/v1/departments/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Department",
  "description": "Updated Description"
}
```

### 删除部门

```http
DELETE /api/v1/departments/{id}
Authorization: Bearer {accessToken}
```

---

## 💼 职位管理 API

### 获取职位列表

```http
GET /api/v1/positions?page=1&pageSize=10&departmentId=1&isManagement=false
Authorization: Bearer {accessToken}
```

### 获取单个职位

```http
GET /api/v1/positions/{id}
Authorization: Bearer {accessToken}
```

### 创建职位

```http
POST /api/v1/positions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Senior Software Developer",
  "code": "SSD",
  "description": "Senior Software Developer Position",
  "departmentId": 1,
  "level": 3,
  "parentPositionId": 2,
  "minSalary": 80000.00,
  "maxSalary": 120000.00,
  "isManagement": false
}
```

### 更新职位

```http
PUT /api/v1/positions/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Lead Software Developer",
  "minSalary": 90000.00,
  "maxSalary": 130000.00
}
```

### 删除职位

```http
DELETE /api/v1/positions/{id}
Authorization: Bearer {accessToken}
```

---

## 🔑 权限管理 API

### 获取权限列表

```http
GET /api/v1/permissions?page=1&pageSize=10&category=EmployeeManagement&resource=Employee
Authorization: Bearer {accessToken}
```

### 获取角色列表

```http
GET /api/v1/roles?page=1&pageSize=10
Authorization: Bearer {accessToken}
```

### 获取员工角色

```http
GET /api/v1/employees/{employeeId}/roles
Authorization: Bearer {accessToken}
```

### 分配角色给员工

```http
POST /api/v1/employees/{employeeId}/roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roleIds": [1, 2, 3]
}
```

### 移除员工角色

```http
DELETE /api/v1/employees/{employeeId}/roles/{roleId}
Authorization: Bearer {accessToken}
```

### 获取角色权限

```http
GET /api/v1/roles/{roleId}/permissions
Authorization: Bearer {accessToken}
```

### 分配权限给角色

```http
POST /api/v1/roles/{roleId}/permissions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "permissionIds": [1, 2, 3, 4]
}
```

---

## 📄 文档管理 API

### 身份文档管理

#### 获取员工身份文档

```http
GET /api/v1/identity-documents/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### 创建身份文档

```http
POST /api/v1/identity-documents
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "employeeId": 1,
  "documentType": "Passport",
  "documentNumber": "P123456789",
  "issueDate": "2020-01-15T00:00:00Z",
  "expirationDate": "2030-01-15T00:00:00Z",
  "issuingAuthority": "US Department of State",
  "issuingPlace": "New York",
  "issuingCountry": "USA",
  "issuingState": "NY",
  "notes": "Valid passport"
}
```

#### 获取即将过期的文档

```http
GET /api/v1/identity-documents/expiring?daysFromNow=30
Authorization: Bearer {accessToken}
```

#### 获取已过期的文档

```http
GET /api/v1/identity-documents/expired
Authorization: Bearer {accessToken}
```

### 教育背景管理

#### 获取员工教育背景

```http
GET /api/v1/educations/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### 创建教育背景

```http
POST /api/v1/educations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "employeeId": 1,
  "institution": "University of Technology",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2018-09-01T00:00:00Z",
  "endDate": "2022-06-01T00:00:00Z",
  "grade": "3.8/4.0",
  "description": "Computer Science degree with focus on software engineering"
}
```

### 专业认证管理

#### 获取员工专业认证

```http
GET /api/v1/certifications/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### 创建专业认证

```http
POST /api/v1/certifications
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "employeeId": 1,
  "name": "AWS Certified Solutions Architect",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2023-06-15T00:00:00Z",
  "expiryDate": "2026-06-15T00:00:00Z",
  "credentialId": "AWS-CSA-123456",
  "credentialUrl": "https://aws.amazon.com/verification/123456",
  "notes": "Professional level certification"
}
```

---

## 📋 合同管理 API

### 获取合同列表

```http
GET /api/v1/contracts?page=1&pageSize=10&status=Active&employeeId=1
Authorization: Bearer {accessToken}
```

### 获取员工合同

```http
GET /api/v1/contracts/employee/{employeeId}
Authorization: Bearer {accessToken}
```

### 创建合同

```http
POST /api/v1/contracts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "employeeId": 1,
  "contractType": "Indefinite",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": null,
  "status": "Active",
  "salary": 75000.00,
  "notes": "Full-time indefinite contract",
  "renewalReminderDate": "2025-01-15T00:00:00Z"
}
```

### 更新合同

```http
PUT /api/v1/contracts/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "Active",
  "salary": 80000.00,
  "notes": "Salary increased"
}
```

### 获取即将到期的合同

```http
GET /api/v1/contracts/expiring?expiryDate=2024-12-31T00:00:00Z
Authorization: Bearer {accessToken}
```

### 获取按状态分类的合同

```http
GET /api/v1/contracts/status/{status}
Authorization: Bearer {accessToken}
```

---

## 📊 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "errors": null,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 分页响应

```json
{
  "success": true,
  "message": "数据获取成功",
  "data": {
    "items": [ ... ],
    "totalCount": 100,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 10,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "errors": null,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "操作失败",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## ❌ 错误处理

### 验证错误 (400 Bad Request)

```json
{
  "success": false,
  "message": "请求参数验证失败",
  "data": null,
  "errors": [
    {
      "field": "firstName",
      "message": "姓名不能为空"
    },
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 未授权错误 (401 Unauthorized)

```json
{
  "success": false,
  "message": "未授权访问",
  "data": null,
  "errors": [
    {
      "field": "authorization",
      "message": "访问令牌无效或已过期"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 禁止访问错误 (403 Forbidden)

```json
{
  "success": false,
  "message": "禁止访问",
  "data": null,
  "errors": [
    {
      "field": "permission",
      "message": "您没有执行此操作的权限"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 资源未找到错误 (404 Not Found)

```json
{
  "success": false,
  "message": "资源未找到",
  "data": null,
  "errors": [
    {
      "field": "id",
      "message": "指定的员工不存在"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 服务器内部错误 (500 Internal Server Error)

```json
{
  "success": false,
  "message": "服务器内部错误",
  "data": null,
  "errors": [
    {
      "field": "system",
      "message": "系统暂时不可用，请稍后重试"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 📋 状态码说明

| 状态码 | 含义                  | 说明                     |
| ------ | --------------------- | ------------------------ |
| 200    | OK                    | 请求成功                 |
| 201    | Created               | 资源创建成功             |
| 204    | No Content            | 请求成功，无返回内容     |
| 400    | Bad Request           | 请求参数错误             |
| 401    | Unauthorized          | 未认证                   |
| 403    | Forbidden             | 无权限                   |
| 404    | Not Found             | 资源不存在               |
| 409    | Conflict              | 资源冲突                 |
| 422    | Unprocessable Entity  | 请求格式正确，但语义错误 |
| 500    | Internal Server Error | 服务器内部错误           |

---

## 🔧 使用示例

### JavaScript/TypeScript 示例

```typescript
// 获取员工列表
const getEmployees = async (page: number = 1, pageSize: number = 10) => {
  const response = await fetch(
    `/api/v1/employees?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();
  return result;
};

// 创建员工
const createEmployee = async (employeeData: any) => {
  const response = await fetch("/api/v1/employees", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeeData),
  });

  const result = await response.json();
  return result;
};
```

### C# 示例

```csharp
// 使用HttpClient调用API
public class EmployeeApiClient
{
    private readonly HttpClient _httpClient;

    public EmployeeApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResponse<PagedResult<EmployeeDto>>> GetEmployeesAsync(int page = 1, int pageSize = 10)
    {
        var response = await _httpClient.GetAsync($"/api/v1/employees?page={page}&pageSize={pageSize}");
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(content);
    }

    public async Task<ApiResponse<EmployeeDto>> CreateEmployeeAsync(CreateEmployeeDto employee)
    {
        var json = JsonSerializer.Serialize(employee);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("/api/v1/employees", content);
        var responseContent = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<EmployeeDto>>(responseContent);
    }
}
```

---

## 📝 注意事项

1. **认证**: 所有 API 调用都需要在 Header 中携带有效的访问令牌
2. **分页**: 列表查询默认支持分页，建议合理设置 pageSize
3. **搜索**: 支持多字段模糊搜索，具体字段请参考各 API 文档
4. **排序**: 支持多字段排序，具体字段请参考各 API 文档
5. **过滤**: 支持多条件过滤，具体参数请参考各 API 文档
6. **版本控制**: API 支持版本控制，当前版本为 v1
7. **限流**: API 有访问频率限制，请合理控制调用频率

---

**文档版本**: v1.0  
**最后更新**: 2024 年 12 月 19 日  
**维护者**: 开发团队

