# 合同审批流程设计与实现

## 概览

- **目的**: 提供企业级合同审批的标准实现，满足合规、风控与可追溯性。
- **范围**: 领域实体、EF 配置、仓储、服务、API 控制器、DI 注册、迁移与下一步工作。

---

## 领域模型

路径: `Backend/src/3-Domain/GeneralWebApi.Domain/Entities/Documents/Approvals/`

- `ContractApproval`：审批实例头信息，包含状态、申请人、级次等。
- `ContractApprovalStep`：审批步骤明细，包含审批人、角色、顺序、状态等。

---

## EF Core 配置

路径: `Backend/src/4-Infrastructure/GeneralWebApi.Integration/Configuration/DocumentConfiguration/`

- `ContractApprovalConfiguration.cs`：表名、主键、索引、外键（到 `Contracts`）。
- `ContractApprovalStepConfiguration.cs`：表名、主键、索引、外键（到 `ContractApprovals`）。

DbContext 已通过 `ApplyConfigurationsFromAssembly` 自动扫描，无需手工注册配置类。

---

## 仓储

路径: `Backend/src/4-Infrastructure/GeneralWebApi.Integration/Repository/DocumentsRepository/Approvals/`

- `IContractApprovalRepository`：
  - `GetPendingByContractIdAsync`
  - `GetByIdWithStepsAsync`
  - `GetApprovalStepsAsync`
  - `GetPendingForApproverAsync`
- `ContractApprovalRepository`：实现以上查询，继承通用 `BaseRepository<T>`。

---

## DTO 与服务

路径:

- DTO: `Backend/src/2-Application/GeneralWebApi.DTOs/Contracts/Approvals/ContractApprovalDtos.cs`
- 服务接口: `Backend/src/2-Application/GeneralWebApi.Application/Services/Contracts/Approvals/IContractApprovalService.cs`
- 服务实现: `Backend/src/2-Application/GeneralWebApi.Application/Services/Contracts/Approvals/ContractApprovalService.cs`

特性:

- 支持提交审批、通过、拒绝、待办列表与历史查询。
- 简化两级流程（部门经理 → HR），便于快速上线；后续可用工作流 JSON 扩展。

---

## API 控制器

路径: `Backend/src/1-Presentation/GeneralWebApi.WebApi/Controllers/Business/ContractApprovalsController.cs`

- `POST /api/v1/contracts/{id}/submit-approval`
- `PUT  /api/v1/contracts/approvals/{approvalId}/approve`
- `PUT  /api/v1/contracts/approvals/{approvalId}/reject`
- `GET  /api/v1/contracts/approvals/pending`
- `GET  /api/v1/contracts/{id}/approval-history`

返回统一 `ApiResponse<T>`，并与现有认证授权适配。

---

## 依赖注入

路径:

- 仓储注册: `Backend/src/4-Infrastructure/GeneralWebApi.Integration/Extensions/ServiceCollectionExtensions.cs`
  - `services.AddScoped<IContractApprovalRepository, ContractApprovalRepository>();`
- 服务注册: `Backend/src/2-Application/GeneralWebApi.Application/Extensions/ServiceCollectionExtensions.cs`
  - `services.AddScoped<IContractApprovalService, ContractApprovalService>();`

---

## 迁移与数据库

步骤:

1. 运行数据库迁移（添加 `ContractApprovals` 与 `ContractApprovalSteps` 表）。
2. 检查生产与测试环境连接串，确保权限与超时时间配置正确。

建议索引：

- `ContractApprovals(ContractId)`, `ContractApprovals(Status)`
- `ContractApprovalSteps(ContractApprovalId, StepOrder)`, `ContractApprovalSteps(Status)`

---

## 下一步优化

- 可配置工作流（JSON）与条件路由（金额、部门、职位）。
- 超时升级、撤回与加签、转签。
- 审批通知（邮件/站内通知/短信）与提醒。
- 审计集成：审批事件写入 `AuditLog` 与 `PermissionAuditLog`。
- 前端审批待办与流程可视化。

---

## 使用指南（示例）

1. 提交审批

`POST /api/v1/contracts/{id}/submit-approval`

请求体:

```json
{ "comments": "Please review" }
```

2. 审批通过

`PUT /api/v1/contracts/approvals/{approvalId}/approve`

请求体:

```json
{ "comments": "OK" }
```

3. 审批拒绝

`PUT /api/v1/contracts/approvals/{approvalId}/reject`

请求体:

```json
{ "reason": "Salary too high" }
```

4. 待审批列表

`GET /api/v1/contracts/approvals/pending?pageNumber=1&pageSize=10`

5. 审批历史

`GET /api/v1/contracts/{id}/approval-history`

---

## 编译状态

✅ **已解决所有编译错误**

- 移除了不存在的 `Result<T>` 包装类，改为直接返回 DTO 或抛出异常
- 添加了正确的 using 语句和命名空间引用
- 统一了错误处理模式，与项目现有风格保持一致
- 所有服务方法都添加了 `CancellationToken` 参数

## 版本

- 文档版本: v1.1
- 最近更新: 2024-12-19
- 编译状态: ✅ 无错误
