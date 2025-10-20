# 🏗️ 技术架构文档

## Technical Architecture Documentation

**项目**: GeneralWebApi - Sistema di Gestione Aziendale Interna  
**版本**: v1.0  
**生成日期**: 2024 年 12 月 19 日

---

## 📋 目录

1. [系统概述](#系统概述)
2. [技术栈](#技术栈)
3. [架构设计](#架构设计)
4. [项目结构](#项目结构)
5. [数据模型](#数据模型)
6. [API 设计](#api设计)
7. [安全架构](#安全架构)
8. [部署架构](#部署架构)
9. [性能考虑](#性能考虑)
10. [扩展性设计](#扩展性设计)

---

## 🎯 系统概述

GeneralWebApi 是一个基于.NET 9 的企业级内部管理系统，采用现代化的微服务架构和领域驱动设计(DDD)模式。系统主要用于企业内部员工管理、组织架构管理、权限控制等核心业务功能。

### 核心特性

- **模块化设计**: 清晰的分层架构和模块划分
- **领域驱动**: 基于 DDD 的领域模型设计
- **CQRS 模式**: 命令查询职责分离
- **权限控制**: 基于角色的细粒度权限管理
- **审计日志**: 完整的操作审计和日志记录
- **RESTful API**: 标准化的 API 设计

---

## 🛠️ 技术栈

### 后端技术

- **.NET 9**: 主要开发框架
- **ASP.NET Core Web API**: Web API 框架
- **Entity Framework Core**: ORM 框架
- **SQL Server**: 主数据库
- **Redis**: 缓存和会话存储
- **MediatR**: 中介者模式实现
- **AutoMapper**: 对象映射
- **Serilog**: 日志记录
- **FluentValidation**: 数据验证

### 开发工具

- **Visual Studio 2022**: 主要 IDE
- **SQL Server Management Studio**: 数据库管理
- **Postman**: API 测试
- **Git**: 版本控制

### 部署和运维

- **Docker**: 容器化部署
- **Docker Compose**: 多容器编排
- **IIS**: Windows 服务器部署
- **Nginx**: 反向代理（可选）

---

## 🏛️ 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Web API       │  │   Controllers   │  │  Middleware │  │
│  │   (ASP.NET)     │  │                 │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Services      │  │   Commands/     │  │   DTOs      │  │
│  │                 │  │   Queries      │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Entities      │  │   Value Objects │  │  Interfaces │  │
│  │                 │  │                 │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Repositories  │  │   Database      │  │   External  │  │
│  │                 │  │   Context       │  │   Services  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 分层架构说明

#### 1. Presentation Layer (表示层)

- **职责**: 处理 HTTP 请求和响应
- **组件**: Controllers, Middleware, Filters
- **特点**: 轻量级，只负责请求路由和响应格式化

#### 2. Application Layer (应用层)

- **职责**: 业务逻辑协调和用例实现
- **组件**: Services, Commands, Queries, DTOs
- **特点**: 无状态，可测试性强

#### 3. Domain Layer (领域层)

- **职责**: 核心业务逻辑和领域规则
- **组件**: Entities, Value Objects, Domain Services
- **特点**: 独立于外部依赖，纯业务逻辑

#### 4. Infrastructure Layer (基础设施层)

- **职责**: 外部依赖和技术实现
- **组件**: Repositories, Database Context, External Services
- **特点**: 可替换，技术实现细节

---

## 📁 项目结构

```
GeneralWebApi/
├── Backend/
│   ├── src/
│   │   ├── 1-Presentation/           # 表示层
│   │   │   ├── GeneralWebApi.Contracts/     # 契约定义
│   │   │   └── GeneralWebApi.WebApi/        # Web API项目
│   │   ├── 2-Application/            # 应用层
│   │   │   ├── GeneralWebApi.Abstractions/  # 抽象定义
│   │   │   ├── GeneralWebApi.Application/   # 应用服务
│   │   │   ├── GeneralWebApi.Application.Common/ # 通用应用组件
│   │   │   └── GeneralWebApi.DTOs/          # 数据传输对象
│   │   ├── 3-Domain/                 # 领域层
│   │   │   ├── GeneralWebApi.Domain/        # 领域实体
│   │   │   └── GeneralWebApi.Domain.Shared/ # 共享领域组件
│   │   ├── 4-Infrastructure/         # 基础设施层
│   │   │   ├── GeneralWebApi.Caching/       # 缓存服务
│   │   │   ├── GeneralWebApi.Email/         # 邮件服务
│   │   │   ├── GeneralWebApi.FileOperation/ # 文件操作
│   │   │   ├── GeneralWebApi.HttpClient/    # HTTP客户端
│   │   │   ├── GeneralWebApi.Identity/      # 身份认证
│   │   │   ├── GeneralWebApi.Integration/   # 数据集成
│   │   │   ├── GeneralWebApi.Logging/       # 日志服务
│   │   │   ├── GeneralWebApi.Persistence/   # 数据持久化
│   │   │   ├── GeneralWebApi.Scheduler/     # 任务调度
│   │   │   └── GeneralWebApi.Shared/        # 共享基础设施
│   │   └── 5-Shared/                 # 共享层
│   │       ├── GeneralWebApi.Common/        # 通用组件
│   │       └── GeneralWebApi.Shared/        # 共享组件
│   ├── test/                         # 测试项目
│   └── docs/                         # 文档
└── Frontend/                         # 前端项目（待开发）
```

---

## 🗄️ 数据模型

### 核心实体关系图

```
Employee (员工)
├── Department (部门)
├── Position (职位)
├── Manager (经理) [自引用]
├── Subordinates (下属) [自引用]
├── EmployeeRoles (员工角色)
├── Contracts (合同)
├── IdentityDocuments (身份文档)
├── Educations (教育背景)
├── Certifications (专业认证)
└── EmployeeAuditLogs (员工审计日志)

Department (部门)
├── ParentDepartment (父部门) [自引用]
├── SubDepartments (子部门) [自引用]
├── Employees (员工)
└── Positions (职位)

Position (职位)
├── Department (部门)
├── ParentPosition (父职位) [自引用]
├── SubPositions (子职位) [自引用]
└── Employees (员工)

Role (角色)
├── EmployeeRoles (员工角色)
└── RolePermissions (角色权限)

Permission (权限)
└── RolePermissions (角色权限)

AuditLog (审计日志)
├── 系统操作审计
├── 用户行为追踪
└── 安全事件记录

EmployeeAuditLog (员工审计日志)
├── 员工信息变更记录
├── 字段级变更追踪
└── 审批流程记录

PermissionAuditLog (权限审计日志)
├── 权限变更记录
├── 角色分配追踪
└── 安全权限审计
```

### 数据库设计原则

1. **规范化设计**: 遵循 3NF，减少数据冗余
2. **软删除**: 使用 IsDeleted 字段，保留历史数据
3. **审计字段**: 完整的创建、更新、删除审计
4. **版本控制**: 乐观锁机制，防止并发冲突
5. **索引优化**: 合理的索引设计，提升查询性能
6. **审计追踪**: 完整的操作审计和变更历史记录
7. **安全合规**: 满足企业级安全和合规要求

---

## 🔌 API 设计

### RESTful API 规范

#### 1. URL 设计

```
GET    /api/v1/employees              # 获取员工列表
GET    /api/v1/employees/{id}         # 获取单个员工
POST   /api/v1/employees              # 创建员工
PUT    /api/v1/employees/{id}         # 更新员工
DELETE /api/v1/employees/{id}         # 删除员工

GET    /api/v1/departments            # 获取部门列表
GET    /api/v1/departments/hierarchy  # 获取部门层级
POST   /api/v1/departments            # 创建部门
PUT    /api/v1/departments/{id}       # 更新部门
DELETE /api/v1/departments/{id}       # 删除部门

GET    /api/v1/audit-logs             # 获取审计日志列表
GET    /api/v1/audit-logs/{id}        # 获取单个审计日志
GET    /api/v1/audit-logs/user/{userId} # 获取用户审计日志
GET    /api/v1/audit-logs/entity/{type}/{id} # 获取实体审计日志
GET    /api/v1/audit-logs/action/{action} # 获取操作审计日志
GET    /api/v1/audit-logs/date-range  # 获取日期范围审计日志
GET    /api/v1/audit-logs/failed     # 获取失败审计日志
GET    /api/v1/audit-logs/statistics # 获取审计日志统计

GET    /api/v1/employee-audit-logs    # 获取员工审计日志列表
GET    /api/v1/employee-audit-logs/{id} # 获取单个员工审计日志
GET    /api/v1/employee-audit-logs/employee/{id} # 获取员工审计日志
GET    /api/v1/employee-audit-logs/employee-number/{number} # 获取员工编号审计日志
GET    /api/v1/employee-audit-logs/user/{userId} # 获取用户员工审计日志
GET    /api/v1/employee-audit-logs/action/{action} # 获取操作员工审计日志
GET    /api/v1/employee-audit-logs/field/{field} # 获取字段员工审计日志
GET    /api/v1/employee-audit-logs/unapproved # 获取未审批员工审计日志
GET    /api/v1/employee-audit-logs/statistics # 获取员工审计日志统计
```

#### 2. HTTP 状态码

- **200 OK**: 成功获取资源
- **201 Created**: 成功创建资源
- **204 No Content**: 成功删除资源
- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 未认证
- **403 Forbidden**: 无权限
- **404 Not Found**: 资源不存在
- **500 Internal Server Error**: 服务器内部错误

#### 3. 响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "errors": null,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### API 版本控制

- **URL 版本控制**: `/api/v1/`, `/api/v2/`
- **向后兼容**: 保持旧版本 API 的兼容性
- **版本弃用**: 提供弃用警告和迁移指南

---

## 🔐 安全架构

### 认证和授权

#### 1. 认证机制

- **JWT Token**: 无状态认证
- **Refresh Token**: 长期访问令牌
- **API Key**: 服务间认证

#### 2. 授权策略

- **基于角色**: RBAC (Role-Based Access Control)
- **基于资源**: 细粒度权限控制
- **策略模式**: 灵活的权限验证

#### 3. 权限矩阵

| 资源       | 操作   | SuperAdmin | Admin | HR  | Manager | Employee |
| ---------- | ------ | ---------- | ----- | --- | ------- | -------- |
| Employee   | Create | ✅         | ✅    | ✅  | ❌      | ❌       |
| Employee   | Read   | ✅         | ✅    | ✅  | 本部门  | 自己     |
| Employee   | Update | ✅         | ✅    | ✅  | 本部门  | 自己     |
| Employee   | Delete | ✅         | ✅    | ❌  | ❌      | ❌       |
| Department | All    | ✅         | ✅    | ❌  | 本部门  | ❌       |
| System     | Config | ✅         | ❌    | ❌  | ❌      | ❌       |

### 数据安全

- **敏感数据加密**: 密码、身份证号等
- **传输加密**: HTTPS/TLS
- **存储加密**: 数据库字段加密
- **访问日志**: 完整的访问审计

---

## 🚀 部署架构

### 开发环境

```
Developer Machine
├── Visual Studio 2022
├── SQL Server LocalDB
├── Redis (Docker)
└── IIS Express
```

### 生产环境

```
Load Balancer (Nginx)
├── Web Server 1 (IIS)
│   ├── GeneralWebApi
│   └── Redis Cache
├── Web Server 2 (IIS)
│   ├── GeneralWebApi
│   └── Redis Cache
└── Database Server
    ├── SQL Server (Primary)
    └── SQL Server (Replica)
```

### Docker 部署

```yaml
version: "3.8"
services:
  webapi:
    build: .
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__DefaultConnection=...
    depends_on:
      - database
      - redis

  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - SA_PASSWORD=YourPassword123
      - ACCEPT_EULA=Y
    ports:
      - "1433:1433"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

## 🔍 审计系统

### 审计架构设计

GeneralWebApi 实现了完整的企业级审计系统，满足安全合规和操作追踪需求。

#### 1. 审计实体模型

**AuditLog (通用审计日志)**

- 系统操作审计
- 用户行为追踪
- 安全事件记录
- 支持多维度查询和统计

**EmployeeAuditLog (员工审计日志)**

- 员工信息变更记录
- 字段级变更追踪
- 审批流程记录
- 敏感操作审计

**PermissionAuditLog (权限审计日志)**

- 权限变更记录
- 角色分配追踪
- 安全权限审计
- 合规性检查

#### 2. 审计功能特性

**操作追踪**

- 完整的 CRUD 操作记录
- 字段级变更历史
- 用户行为分析
- 系统事件监控

**安全审计**

- 登录/登出记录
- 权限变更追踪
- 敏感操作监控
- 异常行为检测

**合规支持**

- 数据保留策略
- 审计报告生成
- 合规性检查
- 法律要求满足

#### 3. 审计 API 设计

**通用审计日志 API**

```
GET /api/v1/audit-logs                    # 分页查询审计日志
GET /api/v1/audit-logs/{id}               # 获取单个审计日志
GET /api/v1/audit-logs/user/{userId}      # 用户审计日志
GET /api/v1/audit-logs/entity/{type}/{id} # 实体审计日志
GET /api/v1/audit-logs/action/{action}    # 操作审计日志
GET /api/v1/audit-logs/date-range         # 日期范围查询
GET /api/v1/audit-logs/failed            # 失败操作日志
GET /api/v1/audit-logs/statistics        # 审计统计信息
```

**员工审计日志 API**

```
GET /api/v1/employee-audit-logs                    # 分页查询员工审计日志
GET /api/v1/employee-audit-logs/{id}               # 获取单个员工审计日志
GET /api/v1/employee-audit-logs/employee/{id}      # 员工审计日志
GET /api/v1/employee-audit-logs/field/{field}      # 字段变更日志
GET /api/v1/employee-audit-logs/unapproved         # 未审批日志
GET /api/v1/employee-audit-logs/statistics         # 员工审计统计
```

#### 4. 审计数据存储

**数据库设计**

- 优化的索引策略
- 分区表支持大数据量
- 数据压缩和归档
- 查询性能优化

**数据保留策略**

- 热数据：3 个月在线存储
- 温数据：1 年压缩存储
- 冷数据：7 年归档存储
- 自动清理机制

#### 5. 审计服务集成

**自动审计记录**

- 中间件自动拦截
- 业务操作自动记录
- 异常情况自动捕获
- 性能指标自动收集

**审计服务接口**

```csharp
// 记录员工字段变更
await _auditService.LogEmployeeFieldChangeAsync(
    employeeId, employeeName, employeeNumber,
    fieldName, oldValue, newValue,
    userId, userName, ipAddress, requestPath);

// 记录权限变更
await _auditService.LogPermissionChangeAsync(
    targetUserId, targetUserName, action,
    roleId, roleName, permissionId, permissionName,
    userId, userName, ipAddress, requestPath);

// 记录系统事件
await _auditService.LogSystemEventAsync(
    action, entityType, entityId, entityName,
    userId, userName, ipAddress, requestPath);
```

---

## ⚡ 性能考虑

### 数据库优化

- **索引策略**: 主键、外键、查询字段索引
- **查询优化**: 避免 N+1 查询，使用 Include
- **分页查询**: 大数据集分页处理
- **连接池**: 数据库连接池配置

### 缓存策略

- **Redis 缓存**: 热点数据缓存
- **内存缓存**: 配置数据缓存
- **查询缓存**: 复杂查询结果缓存
- **缓存失效**: 合理的缓存过期策略

### 性能监控

- **APM 工具**: 应用性能监控
- **日志分析**: 性能瓶颈识别
- **指标收集**: CPU、内存、数据库性能
- **告警机制**: 性能异常告警

---

## 🔧 扩展性设计

### 水平扩展

- **无状态设计**: 应用层无状态，支持负载均衡
- **数据库分片**: 按业务模块分库分表
- **缓存集群**: Redis 集群部署
- **CDN 加速**: 静态资源 CDN 分发

### 垂直扩展

- **模块化设计**: 独立部署的业务模块
- **微服务架构**: 服务拆分和独立部署
- **消息队列**: 异步处理和削峰填谷
- **服务发现**: 动态服务注册和发现

### 技术债务管理

- **代码质量**: 持续重构和优化
- **测试覆盖**: 单元测试、集成测试
- **文档维护**: 及时更新技术文档
- **技术选型**: 定期评估和升级

---

## 📊 监控和运维

### 日志管理

- **结构化日志**: JSON 格式日志输出
- **日志级别**: Debug, Info, Warning, Error, Fatal
- **日志聚合**: ELK Stack 或类似工具
- **日志分析**: 错误趋势和性能分析

### 健康检查

- **应用健康**: 应用状态检查端点
- **数据库健康**: 数据库连接检查
- **依赖服务**: 外部服务可用性检查
- **资源监控**: CPU、内存、磁盘使用率

### 告警机制

- **错误告警**: 异常错误实时告警
- **性能告警**: 响应时间、吞吐量告警
- **资源告警**: 资源使用率告警
- **业务告警**: 业务指标异常告警

---

## 🎯 总结

GeneralWebApi 采用现代化的企业级架构设计，具有以下特点：

### 优势

- **架构清晰**: 分层架构，职责明确
- **技术先进**: 使用最新的.NET 技术栈
- **扩展性强**: 支持水平和垂直扩展
- **安全可靠**: 完善的安全和审计机制
- **维护性好**: 代码结构清晰，易于维护

### 改进方向

- **微服务化**: 逐步向微服务架构演进
- **容器化**: 全面容器化部署
- **自动化**: CI/CD 流水线自动化
- **监控完善**: 更全面的监控和告警

---

**文档版本**: v1.0  
**最后更新**: 2024 年 12 月 19 日  
**维护者**: 开发团队
