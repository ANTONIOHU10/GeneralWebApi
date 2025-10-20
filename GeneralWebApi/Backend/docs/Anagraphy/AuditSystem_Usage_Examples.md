# 🔍 审计系统使用示例

## Audit System Usage Examples

**项目**: GeneralWebApi - Sistema di Gestione Aziendale Interna  
**模块**: 审计系统 (Audit System)  
**版本**: v1.0  
**生成日期**: 2024 年 12 月 19 日

---

## 📋 目录

1. [系统概述](#系统概述)
2. [审计实体说明](#审计实体说明)
3. [API 使用示例](#api使用示例)
4. [服务集成示例](#服务集成示例)
5. [最佳实践](#最佳实践)

---

## 🎯 系统概述

GeneralWebApi 审计系统提供了完整的企业级操作追踪和合规性支持，包括：

- **通用审计日志**: 系统操作、用户行为、安全事件
- **员工审计日志**: 员工信息变更、字段级追踪
- **权限审计日志**: 权限变更、角色分配追踪
- **统计分析**: 审计数据统计和趋势分析

---

## 🏗️ 审计实体说明

### 1. AuditLog (通用审计日志)

```csharp
public class AuditLog : BaseEntity
{
    public string UserId { get; set; }           // 操作用户ID
    public string UserName { get; set; }         // 操作用户名
    public string Action { get; set; }           // 操作类型
    public string EntityType { get; set; }       // 实体类型
    public string EntityId { get; set; }         // 实体ID
    public string EntityName { get; set; }       // 实体名称
    public string IpAddress { get; set; }        // IP地址
    public string RequestPath { get; set; }      // 请求路径
    public string? Details { get; set; }         // 详细信息
    public string? OldValues { get; set; }       // 旧值
    public string? NewValues { get; set; }       // 新值
    public string Severity { get; set; }         // 严重级别
    public string Category { get; set; }         // 分类
    public bool IsSuccess { get; set; }          // 是否成功
    public string? ErrorMessage { get; set; }    // 错误信息
    public long? DurationMs { get; set; }        // 操作耗时
}
```

### 2. EmployeeAuditLog (员工审计日志)

```csharp
public class EmployeeAuditLog : BaseEntity
{
    public int EmployeeId { get; set; }          // 员工ID
    public string EmployeeName { get; set; }     // 员工姓名
    public string EmployeeNumber { get; set; }   // 员工编号
    public string UserId { get; set; }           // 操作用户ID
    public string UserName { get; set; }         // 操作用户名
    public string Action { get; set; }           // 操作类型
    public string? FieldName { get; set; }       // 字段名
    public string? OldValue { get; set; }        // 旧值
    public string? NewValue { get; set; }        // 新值
    public string? Reason { get; set; }          // 变更原因
    public bool IsApproved { get; set; }         // 是否已审批
    public DateTime? ApprovedAt { get; set; }    // 审批时间
    public string? ApprovedBy { get; set; }      // 审批人
}
```

---

## 🔌 API 使用示例

### 1. 获取审计日志列表

```http
GET /api/v1/audit-logs?pageNumber=1&pageSize=10&action=Update&severity=Info
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": "user123",
        "userName": "John Doe",
        "action": "Update",
        "entityType": "Employee",
        "entityId": "456",
        "entityName": "Jane Smith",
        "ipAddress": "192.168.1.100",
        "requestPath": "/api/v1/employees/456",
        "details": "Employee information updated",
        "severity": "Info",
        "category": "General",
        "isSuccess": true,
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ],
    "totalCount": 150,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

### 2. 获取员工审计日志

```http
GET /api/v1/employee-audit-logs/employee/456?pageNumber=1&pageSize=20
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "success": true,
  "message": "Employee audit logs retrieved successfully",
  "data": [
    {
      "id": 1,
      "employeeId": 456,
      "employeeName": "Jane Smith",
      "employeeNumber": "EMP001",
      "userId": "user123",
      "userName": "John Doe",
      "action": "Update",
      "fieldName": "Email",
      "oldValue": "jane.old@company.com",
      "newValue": "jane.new@company.com",
      "reason": "Email address change request",
      "isApproved": true,
      "approvedAt": "2024-12-19T10:35:00Z",
      "approvedBy": "manager456",
      "createdAt": "2024-12-19T10:30:00Z"
    }
  ]
}
```

### 3. 获取审计统计信息

```http
GET /api/v1/audit-logs/statistics
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "success": true,
  "message": "Audit log statistics retrieved successfully",
  "data": {
    "totalLogs": 1250,
    "successfulLogs": 1200,
    "failedLogs": 50,
    "logsByAction": {
      "Create": 300,
      "Update": 500,
      "Delete": 100,
      "Login": 200,
      "Logout": 150
    },
    "logsBySeverity": {
      "Info": 1000,
      "Warning": 200,
      "Error": 50
    },
    "logsByCategory": {
      "General": 800,
      "Security": 300,
      "Permission": 150
    }
  }
}
```

---

## 🛠️ 服务集成示例

### 1. 在员工服务中集成审计

```csharp
public class EmployeeService
{
    private readonly IAuditService _auditService;
    private readonly IEmployeeRepository _employeeRepository;

    public async Task<EmployeeDto> UpdateEmployeeAsync(UpdateEmployeeDto updateDto, string userId, string userName, string ipAddress, string requestPath)
    {
        // 获取原始员工数据
        var existingEmployee = await _employeeRepository.GetByIdAsync(updateDto.Id);

        // 更新员工信息
        var updatedEmployee = await _employeeRepository.UpdateAsync(employee);

        // 记录字段变更审计
        if (existingEmployee.Email != updateDto.Email)
        {
            await _auditService.LogEmployeeFieldChangeAsync(
                employeeId: updateDto.Id,
                employeeName: updateDto.FirstName + " " + updateDto.LastName,
                employeeNumber: updateDto.EmployeeNumber,
                fieldName: "Email",
                oldValue: existingEmployee.Email,
                newValue: updateDto.Email,
                userId: userId,
                userName: userName,
                ipAddress: ipAddress,
                requestPath: requestPath,
                reason: "Email address update"
            );
        }

        // 记录系统事件审计
        await _auditService.LogSystemEventAsync(
            action: "Update",
            entityType: "Employee",
            entityId: updateDto.Id.ToString(),
            entityName: updateDto.FirstName + " " + updateDto.LastName,
            userId: userId,
            userName: userName,
            ipAddress: ipAddress,
            requestPath: requestPath,
            details: "Employee information updated successfully"
        );

        return MapToDto(updatedEmployee);
    }
}
```

### 2. 在权限服务中集成审计

```csharp
public class PermissionService
{
    private readonly IAuditService _auditService;
    private readonly IRoleRepository _roleRepository;

    public async Task<bool> AssignRoleToEmployeeAsync(int employeeId, int roleId, string userId, string userName, string ipAddress, string requestPath)
    {
        // 执行角色分配
        var result = await _roleRepository.AssignRoleToEmployeeAsync(employeeId, roleId);

        if (result)
        {
            // 记录权限变更审计
            await _auditService.LogPermissionChangeAsync(
                targetUserId: employeeId.ToString(),
                targetUserName: employee.Name,
                action: "Grant",
                roleId: roleId,
                roleName: role.Name,
                permissionId: null,
                permissionName: null,
                userId: userId,
                userName: userName,
                ipAddress: ipAddress,
                requestPath: requestPath,
                reason: "Role assignment for new responsibilities"
            );
        }

        return result;
    }
}
```

### 3. 在中间件中自动记录审计

```csharp
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IAuditService _auditService;

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        var userId = GetUserIdFromContext(context);
        var userName = GetUserNameFromContext(context);
        var ipAddress = GetClientIpAddress(context);
        var requestPath = context.Request.Path;
        var httpMethod = context.Request.Method;

        try
        {
            await _next(context);

            // 记录成功的API调用
            await _auditService.LogSystemEventAsync(
                action: httpMethod,
                entityType: "API",
                entityId: requestPath,
                entityName: requestPath,
                userId: userId,
                userName: userName,
                ipAddress: ipAddress,
                requestPath: requestPath,
                details: $"API call successful: {httpMethod} {requestPath}",
                severity: "Info",
                isSuccess: true,
                errorMessage: null
            );
        }
        catch (Exception ex)
        {
            // 记录失败的API调用
            await _auditService.LogSystemEventAsync(
                action: httpMethod,
                entityType: "API",
                entityId: requestPath,
                entityName: requestPath,
                userId: userId,
                userName: userName,
                ipAddress: ipAddress,
                requestPath: requestPath,
                details: $"API call failed: {httpMethod} {requestPath}",
                severity: "Error",
                isSuccess: false,
                errorMessage: ex.Message
            );

            throw;
        }
    }
}
```

---

## 📊 最佳实践

### 1. 审计记录原则

- **完整性**: 记录所有关键操作
- **及时性**: 操作完成后立即记录
- **准确性**: 确保记录的数据准确无误
- **不可篡改**: 审计记录一旦创建不应修改

### 2. 性能优化

- **异步记录**: 使用异步方式记录审计日志
- **批量操作**: 对于批量操作，考虑批量记录
- **索引优化**: 为常用查询字段建立索引
- **数据归档**: 定期归档历史审计数据

### 3. 安全考虑

- **敏感数据**: 避免记录敏感信息如密码
- **访问控制**: 限制审计日志的访问权限
- **数据加密**: 对敏感审计数据进行加密
- **合规要求**: 满足相关法规和标准要求

### 4. 监控和告警

- **异常检测**: 监控异常操作模式
- **实时告警**: 对关键安全事件实时告警
- **定期报告**: 生成定期审计报告
- **趋势分析**: 分析审计数据趋势

---

## 🎯 总结

GeneralWebApi 审计系统提供了完整的企业级操作追踪能力，支持：

- ✅ **全面审计**: 覆盖所有关键业务操作
- ✅ **灵活查询**: 支持多维度查询和过滤
- ✅ **统计分析**: 提供丰富的统计和分析功能
- ✅ **易于集成**: 简单的服务接口和中间件支持
- ✅ **高性能**: 优化的数据库设计和查询性能
- ✅ **安全合规**: 满足企业级安全和合规要求

通过合理使用审计系统，可以确保系统的安全性、合规性和可追溯性，为企业管理提供强有力的支持。

---

**文档版本**: v1.0  
**最后更新**: 2024 年 12 月 19 日  
**维护者**: 开发团队
