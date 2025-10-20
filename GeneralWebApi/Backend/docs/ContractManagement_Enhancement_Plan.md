# 📋 合同管理模块功能完善计划

## Contract Management Module Enhancement Plan

**项目**: GeneralWebApi - Sistema di Gestione Aziendale Interna  
**模块**: 合同管理 (Contract Management)  
**当前完成度**: 80%  
**目标完成度**: 95%+  
**文档版本**: v1.0  
**生成日期**: 2024 年 12 月 19 日

---

## 📋 目录

1. [当前状态分析](#当前状态分析)
2. [功能完善需求](#功能完善需求)
3. [技术实现方案](#技术实现方案)
4. [数据库设计](#数据库设计)
5. [API 设计](#api设计)
6. [实施计划](#实施计划)
7. [风险评估](#风险评估)

---

## 🎯 当前状态分析

### ✅ **已实现功能**

1. **基础合同管理**

   - 合同类型（无限期、固定期限、兼职等）
   - 合同开始/结束日期
   - 合同状态管理
   - 薪资信息关联
   - 续签提醒日期

2. **查询功能**
   - 按员工查询合同
   - 按状态查询合同
   - 分页查询
   - 搜索过滤

### ⚠️ **当前局限性**

| 问题             | 影响                 | 优先级 |
| ---------------- | -------------------- | ------ |
| 缺乏合同内容管理 | 无法生成完整合同文档 | 高     |
| 续签提醒功能简单 | 无法满足复杂提醒需求 | 高     |
| 无审批流程       | 合同创建缺乏控制     | 高     |
| 无变更历史       | 无法追踪合同修改     | 中     |
| 无文档管理       | 无法存储合同文件     | 中     |
| 无统计分析       | 缺乏数据洞察         | 中     |

---

## 🚀 功能完善需求

### **高优先级功能 (1-2 周内完成)**

#### 1. **合同内容管理** 🔥

**需求描述**: 为合同添加详细的内容管理，包括合同条款、工作条件、福利待遇等。

**功能要求**:

- 合同条款结构化存储
- 支持多种合同类型的内容模板
- 合同内容版本控制
- 合同内容搜索和过滤

**技术实现**:

```csharp
// 扩展现有Contract实体
public class Contract : BaseEntity
{
    // 现有字段...

    // 新增字段
    public string? ContractContent { get; set; }        // 完整合同内容
    public string? WorkingHours { get; set; }           // 工作时间
    public string? ProbationPeriod { get; set; }        // 试用期
    public int AnnualLeaveDays { get; set; }            // 年假天数
    public string? Benefits { get; set; }               // 福利待遇
    public string? TerminationClause { get; set; }      // 终止条款
    public string? ConfidentialityClause { get; set; }  // 保密条款
    public string? NonCompeteClause { get; set; }       // 竞业禁止条款
    public string? IntellectualPropertyClause { get; set; } // 知识产权条款
    public string? DisputeResolutionClause { get; set; }    // 争议解决条款
    public string? AdditionalClauses { get; set; }      // 其他条款
    public string? LegalBasis { get; set; }             // 法律依据
    public string? GoverningLaw { get; set; }           // 适用法律
}
```

#### 2. **增强续签提醒机制** 🔥

**需求描述**: 完善合同续签提醒功能，支持多种提醒方式和时间配置。

**功能要求**:

- 可配置的提醒时间（30 天、60 天、90 天前）
- 多种提醒方式（邮件、系统通知、短信）
- 提醒历史记录
- 批量续签处理
- 自动续签功能

**技术实现**:

```csharp
// 续签提醒配置
public class ContractRenewalReminder
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int DaysBeforeExpiry { get; set; }           // 到期前多少天提醒
    public string ReminderType { get; set; } = string.Empty; // Email, SMS, System
    public string Recipients { get; set; } = string.Empty;   // 收件人列表(JSON)
    public bool IsSent { get; set; } = false;
    public DateTime? SentAt { get; set; }
    public string? SentTo { get; set; }
    public string? Message { get; set; }
    public string Status { get; set; } = "Pending";     // Pending, Sent, Failed
}

// 扩展现有Contract实体
public class Contract : BaseEntity
{
    // 现有字段...

    // 新增续签相关字段
    public int? ReminderDaysBeforeExpiry { get; set; } = 30;
    public bool IsReminderSent { get; set; } = false;
    public DateTime? LastReminderSent { get; set; }
    public string? ReminderRecipients { get; set; }     // JSON格式的收件人列表
    public bool AutoRenewal { get; set; } = false;      // 是否自动续签
    public int? AutoRenewalPeriod { get; set; }         // 自动续签期限(月)
    public string? RenewalTerms { get; set; }           // 续签条件
}
```

#### 3. **合同审批流程** 🔥

**需求描述**: 实现合同创建和修改的审批流程，确保合同管理的规范性。

**功能要求**:

- 多级审批流程
- 审批状态跟踪
- 审批历史记录
- 审批通知机制
- 审批权限控制

**技术实现**:

```csharp
// 合同审批实体
public class ContractApproval : BaseEntity
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public string Status { get; set; } = "Pending";     // Pending, Approved, Rejected, Cancelled
    public string? Comments { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    public int ApprovalLevel { get; set; } = 1;         // 审批级别
    public int MaxApprovalLevel { get; set; } = 3;      // 最大审批级别
    public string? ApprovalWorkflow { get; set; }       // 审批流程配置(JSON)

    // 导航属性
    public Contract Contract { get; set; } = null!;
}

// 审批流程配置
public class ContractApprovalWorkflow
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string WorkflowConfig { get; set; } = string.Empty; // JSON配置
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 1;
}
```

### **中优先级功能 (2-4 周内完成)**

#### 4. **合同变更历史** 📝

**需求描述**: 记录合同的所有变更历史，包括修改内容、修改人、修改时间等。

**功能要求**:

- 合同修改历史追踪
- 变更原因记录
- 变更审批记录
- 历史版本对比
- 变更影响分析

**技术实现**:

```csharp
// 合同变更历史实体
public class ContractChangeHistory : BaseEntity
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public string ChangeType { get; set; } = string.Empty; // Create, Update, StatusChange, Renewal, Termination
    public string FieldName { get; set; } = string.Empty;  // 变更字段名
    public string? OldValue { get; set; }                  // 旧值
    public string? NewValue { get; set; }                  // 新值
    public string ChangedBy { get; set; } = string.Empty;  // 修改人
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }                    // 变更原因
    public string? Comments { get; set; }                  // 备注
    public bool RequiresApproval { get; set; } = false;   // 是否需要审批
    public int? ApprovalId { get; set; }                   // 关联审批记录
    public string ChangeSource { get; set; } = "Manual";   // 变更来源: Manual, System, Import

    // 导航属性
    public Contract Contract { get; set; } = null!;
    public ContractApproval? Approval { get; set; }
}
```

#### 5. **合同文档管理** 📄

**需求描述**: 管理合同相关的文档，包括原始合同、修改协议、附件等。

**功能要求**:

- 合同文档上传和存储
- 文档版本管理
- 文档分类和标签
- 文档安全访问控制
- 文档搜索和过滤

**技术实现**:

```csharp
// 合同文档实体
public class ContractDocument : BaseEntity
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public string DocumentType { get; set; } = string.Empty; // Original, Amendment, Termination, Attachment
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Tags { get; set; }                      // 标签(JSON)
    public bool IsSigned { get; set; } = false;           // 是否已签名
    public DateTime? SignedAt { get; set; }               // 签名时间
    public string? SignedBy { get; set; }                  // 签名人
    public string? DigitalSignature { get; set; }         // 数字签名
    public bool IsConfidential { get; set; } = false;     // 是否保密
    public string? AccessLevel { get; set; } = "Standard"; // 访问级别
    public int Version { get; set; } = 1;                 // 版本号
    public int? ParentDocumentId { get; set; }            // 父文档ID

    // 导航属性
    public Contract Contract { get; set; } = null!;
    public ContractDocument? ParentDocument { get; set; }
    public ICollection<ContractDocument> ChildDocuments { get; set; } = [];
}
```

#### 6. **合同统计分析** 📊

**需求描述**: 提供合同相关的统计分析和报表功能。

**功能要求**:

- 合同到期统计
- 合同类型分布
- 薪资趋势分析
- 续签率统计
- 合同成本分析
- 自定义报表

**技术实现**:

```csharp
// 合同统计服务
public interface IContractStatisticsService
{
    Task<ContractExpiryStatistics> GetExpiryStatisticsAsync(DateTime? startDate, DateTime? endDate);
    Task<ContractTypeDistribution> GetTypeDistributionAsync();
    Task<SalaryTrendAnalysis> GetSalaryTrendAsync(int? departmentId, string? position);
    Task<RenewalRateStatistics> GetRenewalRateAsync(DateTime? startDate, DateTime? endDate);
    Task<ContractCostAnalysis> GetCostAnalysisAsync(DateTime? startDate, DateTime? endDate);
    Task<CustomReport> GenerateCustomReportAsync(ReportConfiguration config);
}

// 统计结果DTO
public class ContractExpiryStatistics
{
    public int TotalContracts { get; set; }
    public int ExpiringIn30Days { get; set; }
    public int ExpiringIn60Days { get; set; }
    public int ExpiringIn90Days { get; set; }
    public int ExpiredContracts { get; set; }
    public List<ContractExpiryDetail> ExpiryDetails { get; set; } = [];
}

public class ContractTypeDistribution
{
    public Dictionary<string, int> TypeCounts { get; set; } = [];
    public Dictionary<string, decimal> TypePercentages { get; set; } = [];
    public List<TypeTrendData> TrendData { get; set; } = [];
}
```

### **低优先级功能 (1-2 个月内完成)**

#### 7. **合同模板管理** 📋

**需求描述**: 创建和管理合同模板，提高合同创建效率。

**功能要求**:

- 合同模板创建和编辑
- 模板变量管理
- 模板版本控制
- 模板审批流程
- 模板使用统计

**技术实现**:

```csharp
// 合同模板实体
public class ContractTemplate : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string TemplateContent { get; set; } = string.Empty; // 模板内容
    public string Variables { get; set; } = string.Empty;       // 变量定义(JSON)
    public string? Category { get; set; }                       // 模板分类
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;               // 是否默认模板
    public int UsageCount { get; set; } = 0;                   // 使用次数
    public string? Tags { get; set; }                          // 标签(JSON)
    public string? LegalRequirements { get; set; }             // 法律要求
    public string? ApprovalWorkflow { get; set; }              // 审批流程(JSON)
    public int Version { get; set; } = 1;
    public int? ParentTemplateId { get; set; }                 // 父模板ID

    // 导航属性
    public ContractTemplate? ParentTemplate { get; set; }
    public ICollection<ContractTemplate> ChildTemplates { get; set; } = [];
    public ICollection<Contract> Contracts { get; set; } = [];
}
```

#### 8. **合同合规检查** ⚖️

**需求描述**: 检查合同的合规性，确保符合法律法规要求。

**功能要求**:

- 法律合规性检查
- 最低工资标准验证
- 工作时间限制检查
- 试用期规则验证
- 合规报告生成

**技术实现**:

```csharp
// 合规检查规则
public class ContractComplianceRule : BaseEntity
{
    public int Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string RuleType { get; set; } = string.Empty;      // Salary, WorkingHours, Probation, etc.
    public string RuleDescription { get; set; } = string.Empty;
    public string RuleExpression { get; set; } = string.Empty; // 规则表达式
    public string Severity { get; set; } = "Warning";         // Error, Warning, Info
    public bool IsActive { get; set; } = true;
    public string? ApplicableRegions { get; set; }            // 适用地区(JSON)
    public string? ApplicableContractTypes { get; set; }      // 适用合同类型(JSON)
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

// 合规检查结果
public class ContractComplianceCheck : BaseEntity
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int RuleId { get; set; }
    public string Status { get; set; } = "Pending";           // Pending, Passed, Failed, Warning
    public string? Message { get; set; }
    public string? Details { get; set; }                      // 检查详情(JSON)
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    public string CheckedBy { get; set; } = "System";

    // 导航属性
    public Contract Contract { get; set; } = null!;
    public ContractComplianceRule Rule { get; set; } = null!;
}
```

---

## 🗄️ 数据库设计

### **新增表结构**

```sql
-- 合同续签提醒表
CREATE TABLE ContractRenewalReminders (
    Id int IDENTITY(1,1) PRIMARY KEY,
    ContractId int NOT NULL,
    DaysBeforeExpiry int NOT NULL,
    ReminderType nvarchar(20) NOT NULL, -- Email, SMS, System
    Recipients nvarchar(MAX), -- JSON格式
    IsSent bit DEFAULT 0,
    SentAt datetime2,
    SentTo nvarchar(500),
    Message nvarchar(MAX),
    Status nvarchar(20) DEFAULT 'Pending', -- Pending, Sent, Failed
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ContractId) REFERENCES Contracts(Id) ON DELETE CASCADE
);

-- 合同审批表
CREATE TABLE ContractApprovals (
    Id int IDENTITY(1,1) PRIMARY KEY,
    ContractId int NOT NULL,
    Status nvarchar(20) DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
    Comments nvarchar(1000),
    RequestedBy nvarchar(100) NOT NULL,
    RequestedAt datetime2 DEFAULT GETUTCDATE(),
    ApprovedBy nvarchar(100),
    ApprovedAt datetime2,
    RejectedBy nvarchar(100),
    RejectedAt datetime2,
    RejectionReason nvarchar(500),
    ApprovalLevel int DEFAULT 1,
    MaxApprovalLevel int DEFAULT 3,
    ApprovalWorkflow nvarchar(MAX), -- JSON配置
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ContractId) REFERENCES Contracts(Id) ON DELETE CASCADE
);

-- 合同变更历史表
CREATE TABLE ContractChangeHistories (
    Id int IDENTITY(1,1) PRIMARY KEY,
    ContractId int NOT NULL,
    ChangeType nvarchar(50) NOT NULL, -- Create, Update, StatusChange, Renewal, Termination
    FieldName nvarchar(100) NOT NULL,
    OldValue nvarchar(500),
    NewValue nvarchar(500),
    ChangedBy nvarchar(100) NOT NULL,
    ChangedAt datetime2 DEFAULT GETUTCDATE(),
    Reason nvarchar(500),
    Comments nvarchar(1000),
    RequiresApproval bit DEFAULT 0,
    ApprovalId int,
    ChangeSource nvarchar(20) DEFAULT 'Manual', -- Manual, System, Import
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ContractId) REFERENCES Contracts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ApprovalId) REFERENCES ContractApprovals(Id)
);

-- 合同文档表
CREATE TABLE ContractDocuments (
    Id int IDENTITY(1,1) PRIMARY KEY,
    ContractId int NOT NULL,
    DocumentType nvarchar(50) NOT NULL, -- Original, Amendment, Termination, Attachment
    FileName nvarchar(255) NOT NULL,
    OriginalFileName nvarchar(255) NOT NULL,
    FilePath nvarchar(500) NOT NULL,
    FileSize bigint NOT NULL,
    MimeType nvarchar(100) NOT NULL,
    Description nvarchar(1000),
    Tags nvarchar(MAX), -- JSON格式
    IsSigned bit DEFAULT 0,
    SignedAt datetime2,
    SignedBy nvarchar(100),
    DigitalSignature nvarchar(MAX),
    IsConfidential bit DEFAULT 0,
    AccessLevel nvarchar(20) DEFAULT 'Standard',
    Version int DEFAULT 1,
    ParentDocumentId int,
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ContractId) REFERENCES Contracts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ParentDocumentId) REFERENCES ContractDocuments(Id)
);

-- 合同模板表
CREATE TABLE ContractTemplates (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(500),
    ContractType nvarchar(50) NOT NULL,
    TemplateContent nvarchar(MAX) NOT NULL,
    Variables nvarchar(MAX), -- JSON格式
    Category nvarchar(50),
    IsActive bit DEFAULT 1,
    IsDefault bit DEFAULT 0,
    UsageCount int DEFAULT 0,
    Tags nvarchar(MAX), -- JSON格式
    LegalRequirements nvarchar(MAX),
    ApprovalWorkflow nvarchar(MAX), -- JSON格式
    Version int DEFAULT 1,
    ParentTemplateId int,
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ParentTemplateId) REFERENCES ContractTemplates(Id)
);

-- 合规检查规则表
CREATE TABLE ContractComplianceRules (
    Id int IDENTITY(1,1) PRIMARY KEY,
    RuleName nvarchar(100) NOT NULL,
    RuleType nvarchar(50) NOT NULL, -- Salary, WorkingHours, Probation, etc.
    RuleDescription nvarchar(500) NOT NULL,
    RuleExpression nvarchar(MAX) NOT NULL,
    Severity nvarchar(20) DEFAULT 'Warning', -- Error, Warning, Info
    IsActive bit DEFAULT 1,
    ApplicableRegions nvarchar(MAX), -- JSON格式
    ApplicableContractTypes nvarchar(MAX), -- JSON格式
    EffectiveDate datetime2,
    ExpiryDate datetime2,
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0
);

-- 合规检查结果表
CREATE TABLE ContractComplianceChecks (
    Id int IDENTITY(1,1) PRIMARY KEY,
    ContractId int NOT NULL,
    RuleId int NOT NULL,
    Status nvarchar(20) DEFAULT 'Pending', -- Pending, Passed, Failed, Warning
    Message nvarchar(1000),
    Details nvarchar(MAX), -- JSON格式
    CheckedAt datetime2 DEFAULT GETUTCDATE(),
    CheckedBy nvarchar(100) DEFAULT 'System',
    CreatedAt datetime2 DEFAULT GETUTCDATE(),
    UpdatedAt datetime2,
    IsDeleted bit DEFAULT 0,
    FOREIGN KEY (ContractId) REFERENCES Contracts(Id) ON DELETE CASCADE,
    FOREIGN KEY (RuleId) REFERENCES ContractComplianceRules(Id)
);
```

### **扩展现有 Contracts 表**

```sql
-- 为Contracts表添加新字段
ALTER TABLE Contracts ADD
    ContractContent nvarchar(MAX),
    WorkingHours nvarchar(100),
    ProbationPeriod nvarchar(50),
    AnnualLeaveDays int DEFAULT 20,
    Benefits nvarchar(MAX),
    TerminationClause nvarchar(MAX),
    ConfidentialityClause nvarchar(MAX),
    NonCompeteClause nvarchar(MAX),
    IntellectualPropertyClause nvarchar(MAX),
    DisputeResolutionClause nvarchar(MAX),
    AdditionalClauses nvarchar(MAX),
    LegalBasis nvarchar(500),
    GoverningLaw nvarchar(100),
    ReminderDaysBeforeExpiry int DEFAULT 30,
    IsReminderSent bit DEFAULT 0,
    LastReminderSent datetime2,
    ReminderRecipients nvarchar(MAX), -- JSON格式
    AutoRenewal bit DEFAULT 0,
    AutoRenewalPeriod int, -- 月数
    RenewalTerms nvarchar(MAX),
    TemplateId int,
    GeneratedContent nvarchar(MAX),
    TemplateVariables nvarchar(MAX); -- JSON格式

-- 添加外键约束
ALTER TABLE Contracts ADD CONSTRAINT FK_Contracts_Templates
    FOREIGN KEY (TemplateId) REFERENCES ContractTemplates(Id);
```

---

## 🔌 API 设计

### **新增 API 端点**

```http
# 合同内容管理
GET    /api/v1/contracts/{id}/content              # 获取合同内容
PUT    /api/v1/contracts/{id}/content              # 更新合同内容
POST   /api/v1/contracts/{id}/generate             # 生成合同内容

# 续签提醒管理
GET    /api/v1/contracts/expiring                  # 获取即将到期的合同
POST   /api/v1/contracts/{id}/reminders            # 创建续签提醒
PUT    /api/v1/contracts/{id}/reminders/{reminderId} # 更新续签提醒
GET    /api/v1/contracts/{id}/reminders            # 获取合同提醒历史
POST   /api/v1/contracts/batch-renewal             # 批量续签处理

# 合同审批管理
POST   /api/v1/contracts/{id}/submit-approval      # 提交审批
PUT    /api/v1/contracts/approvals/{id}/approve    # 审批通过
PUT    /api/v1/contracts/approvals/{id}/reject     # 审批拒绝
GET    /api/v1/contracts/approvals/pending         # 获取待审批合同
GET    /api/v1/contracts/{id}/approval-history     # 获取审批历史

# 合同变更历史
GET    /api/v1/contracts/{id}/change-history       # 获取变更历史
POST   /api/v1/contracts/{id}/changes              # 记录变更
GET    /api/v1/contracts/changes/recent            # 获取最近变更

# 合同文档管理
GET    /api/v1/contracts/{id}/documents            # 获取合同文档
POST   /api/v1/contracts/{id}/documents            # 上传合同文档
PUT    /api/v1/contracts/documents/{id}            # 更新文档信息
DELETE /api/v1/contracts/documents/{id}            # 删除文档
GET    /api/v1/contracts/documents/{id}/download   # 下载文档
POST   /api/v1/contracts/documents/{id}/sign       # 文档签名

# 合同统计分析
GET    /api/v1/contracts/statistics/expiry         # 到期统计
GET    /api/v1/contracts/statistics/type-distribution # 类型分布
GET    /api/v1/contracts/statistics/salary-trend   # 薪资趋势
GET    /api/v1/contracts/statistics/renewal-rate   # 续签率统计
GET    /api/v1/contracts/statistics/cost-analysis  # 成本分析
POST   /api/v1/contracts/reports/generate          # 生成报表

# 合同模板管理
GET    /api/v1/contract-templates                  # 获取模板列表
POST   /api/v1/contract-templates                  # 创建模板
PUT    /api/v1/contract-templates/{id}             # 更新模板
DELETE /api/v1/contract-templates/{id}             # 删除模板
GET    /api/v1/contract-templates/{id}/preview     # 预览模板
POST   /api/v1/contract-templates/{id}/generate    # 基于模板生成合同

# 合规检查
GET    /api/v1/contracts/{id}/compliance-check     # 检查合同合规性
POST   /api/v1/contracts/batch-compliance-check    # 批量合规检查
GET    /api/v1/contracts/compliance-rules          # 获取合规规则
POST   /api/v1/contracts/compliance-rules          # 创建合规规则
GET    /api/v1/contracts/compliance-reports        # 获取合规报告
```

### **API 响应示例**

```json
// 合同内容响应
{
  "success": true,
  "message": "Contract content retrieved successfully",
  "data": {
    "id": 1,
    "contractContent": "完整的合同内容...",
    "workingHours": "9:00-18:00",
    "probationPeriod": "3个月",
    "annualLeaveDays": 20,
    "benefits": "五险一金，年终奖，带薪年假",
    "terminationClause": "提前30天书面通知",
    "confidentialityClause": "保密条款内容...",
    "nonCompeteClause": "竞业禁止条款内容...",
    "intellectualPropertyClause": "知识产权条款内容...",
    "disputeResolutionClause": "争议解决条款内容...",
    "additionalClauses": "其他条款内容...",
    "legalBasis": "《劳动法》等相关法律法规",
    "governingLaw": "中华人民共和国法律"
  }
}

// 续签提醒响应
{
  "success": true,
  "message": "Renewal reminders retrieved successfully",
  "data": [
    {
      "id": 1,
      "contractId": 1,
      "daysBeforeExpiry": 30,
      "reminderType": "Email",
      "recipients": ["hr@company.com", "manager@company.com"],
      "isSent": true,
      "sentAt": "2024-12-19T10:00:00Z",
      "sentTo": "hr@company.com, manager@company.com",
      "message": "合同即将在30天后到期，请及时处理续签事宜",
      "status": "Sent"
    }
  ]
}

// 合同统计响应
{
  "success": true,
  "message": "Contract statistics retrieved successfully",
  "data": {
    "expiryStatistics": {
      "totalContracts": 150,
      "expiringIn30Days": 5,
      "expiringIn60Days": 12,
      "expiringIn90Days": 18,
      "expiredContracts": 3
    },
    "typeDistribution": {
      "Indefinite": 120,
      "Fixed": 25,
      "PartTime": 5
    },
    "salaryTrend": {
      "averageSalary": 75000,
      "salaryGrowth": 5.2,
      "trendData": [
        {"month": "2024-01", "average": 72000},
        {"month": "2024-02", "average": 73000}
      ]
    }
  }
}
```

---

## 📅 实施计划

### **第一阶段：核心功能完善 (2 周)**

| 任务               | 优先级 | 预计时间 | 负责人   | 状态   |
| ------------------ | ------ | -------- | -------- | ------ |
| 扩展 Contract 实体 | 高     | 2 天     | 开发团队 | 待开始 |
| 实现合同内容管理   | 高     | 3 天     | 开发团队 | 待开始 |
| 增强续签提醒机制   | 高     | 3 天     | 开发团队 | 待开始 |
| 实现合同审批流程   | 高     | 4 天     | 开发团队 | 待开始 |
| 数据库迁移脚本     | 高     | 1 天     | 开发团队 | 待开始 |
| 单元测试编写       | 高     | 2 天     | 开发团队 | 待开始 |

### **第二阶段：高级功能开发 (2 周)**

| 任务             | 优先级 | 预计时间 | 负责人   | 状态   |
| ---------------- | ------ | -------- | -------- | ------ |
| 实现合同变更历史 | 中     | 2 天     | 开发团队 | 待开始 |
| 实现合同文档管理 | 中     | 3 天     | 开发团队 | 待开始 |
| 实现合同统计分析 | 中     | 3 天     | 开发团队 | 待开始 |
| 实现合同模板管理 | 中     | 4 天     | 开发团队 | 待开始 |
| API 文档更新     | 中     | 1 天     | 开发团队 | 待开始 |
| 集成测试         | 中     | 2 天     | 开发团队 | 待开始 |

### **第三阶段：合规和优化 (2 周)**

| 任务             | 优先级 | 预计时间 | 负责人   | 状态   |
| ---------------- | ------ | -------- | -------- | ------ |
| 实现合规检查功能 | 低     | 4 天     | 开发团队 | 待开始 |
| 性能优化         | 低     | 2 天     | 开发团队 | 待开始 |
| 安全加固         | 低     | 2 天     | 开发团队 | 待开始 |
| 用户界面开发     | 低     | 3 天     | 前端团队 | 待开始 |
| 用户培训         | 低     | 1 天     | 产品团队 | 待开始 |

---

## ⚠️ 风险评估

### **技术风险**

| 风险           | 影响 | 概率 | 缓解措施               |
| -------------- | ---- | ---- | ---------------------- |
| 数据库性能问题 | 中   | 中   | 优化查询，添加索引     |
| 文件存储问题   | 中   | 低   | 使用云存储，备份策略   |
| 审批流程复杂   | 高   | 中   | 简化流程，分阶段实现   |
| 合规检查准确性 | 高   | 中   | 法律专家审核，测试验证 |

### **业务风险**

| 风险         | 影响 | 概率 | 缓解措施           |
| ------------ | ---- | ---- | ------------------ |
| 用户接受度低 | 中   | 低   | 用户培训，界面优化 |
| 数据迁移问题 | 高   | 低   | 充分测试，备份策略 |
| 法律合规问题 | 高   | 低   | 法律专家咨询       |
| 性能影响     | 中   | 中   | 性能监控，优化调整 |

### **项目风险**

| 风险         | 影响 | 概率 | 缓解措施             |
| ------------ | ---- | ---- | -------------------- |
| 开发时间超期 | 中   | 中   | 合理规划，优先级管理 |
| 资源不足     | 中   | 低   | 提前规划，外部支持   |
| 需求变更     | 中   | 中   | 敏捷开发，快速响应   |
| 测试不充分   | 高   | 低   | 自动化测试，充分测试 |

---

## 🎯 成功标准

### **功能完成度**

- [ ] 合同内容管理：100%
- [ ] 续签提醒机制：100%
- [ ] 合同审批流程：100%
- [ ] 合同变更历史：100%
- [ ] 合同文档管理：100%
- [ ] 合同统计分析：100%
- [ ] 合同模板管理：100%
- [ ] 合规检查功能：100%

### **质量指标**

- [ ] 代码覆盖率：>80%
- [ ] 性能测试：通过
- [ ] 安全测试：通过
- [ ] 用户验收测试：通过
- [ ] 文档完整性：100%

### **业务指标**

- [ ] 合同创建效率提升：>50%
- [ ] 续签提醒准确率：>95%
- [ ] 审批流程完成时间：<3 天
- [ ] 用户满意度：>4.0/5.0

---

## 📚 附录

### **A. 相关文档**

- [技术架构文档](../TechnicalArchitecture.md)
- [API 文档](../API_Documentation.md)
- [部署指南](../Deployment_Guide.md)
- [合同审批流程设计与实现](./Contract_Approval_Design_and_Implementation.md)

### **B. 相关代码**

- [Contract 实体](../../src/3-Domain/GeneralWebApi.Domain/Entities/Documents/Contract.cs)
- [ContractService](../../src/2-Application/GeneralWebApi.Application/Services/ContractService.cs)
- [ContractsController](../../src/1-Presentation/GeneralWebApi.WebApi/Controllers/Business/ContractsController.cs)

### **C. 相关工具**

- Entity Framework Core
- AutoMapper
- MediatR
- Serilog
- FluentValidation

---

**文档版本**: v1.0  
**最后更新**: 2024 年 12 月 19 日  
**维护者**: 开发团队
