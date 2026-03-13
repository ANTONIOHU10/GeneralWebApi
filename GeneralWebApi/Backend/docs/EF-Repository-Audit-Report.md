# EF Repository & Table Definition Audit Report

This document summarizes the review of all repositories, EF queries, table/entity configurations, and applied optimizations.

---

## 1. N+1 and Bulk Operation Fixes (Done)

### 1.1 Contract delete: N+1 approvals delete → single round-trip

- **Location**: `GeneralWebApi.Application/Services/ContractService.cs` — `DeleteAsync(int id)`
- **Issue**: For each contract approval, the code called `_approvalRepository.DeleteAsync(approval.Id)` in a loop, causing N+1 database round-trips (1 to load approvals + N soft-deletes).
- **Fix**: Use `_approvalRepository.DeleteRangeAsync(approvals, cancellationToken)` so all approvals are soft-deleted in one `SaveChanges` call.
- **Note**: Roles list N+1 (employee count per role) was already fixed earlier via `GetEmployeeCountsAsync` in `RoleRepository` and used in `GetRolesQueryHandler`.

---

## 2. Index Additions (Done)

### 2.1 Contracts — `RenewalReminderDate`

- **Location**: `GeneralWebApi.Integration/Configuration/DocumentConfiguration/ContractConfiguration.cs`
- **Change**: Added `builder.HasIndex(c => c.RenewalReminderDate)`.
- **Reason**: Supports reminder/dashboard queries that filter by “contracts due for renewal” (e.g. `RenewalReminderDate <= today`). Existing indexes already cover `EmployeeId`, `ContractType`, `Status`, `StartDate`, `EndDate`.

---

## 3. GetPagedAsync count query optimizations (Done)

Count was previously run on the same query that used `Include(...)`, causing unnecessary JOINs for a simple count.

### 3.1 ContractRepository

- **File**: `GeneralWebApi.Integration/Repository/DocumentsRepository/ContractRepository.cs`
- **Change**: Count is executed on a filter-only query (no `Include(c => c.Employee)`). Data query still uses `Include` for the page of results. Extracted `ApplyPagedFilters` for reuse.

### 3.2 IdentityDocumentRepository

- **File**: `GeneralWebApi.Integration/Repository/AnagraphyDocumentRepository/IdentityDocumentRepository.cs`
- **Change**: Count uses `ApplySearchFilters(GetActiveAndEnabledEntities(), ...)` without `Include(e => e.Employee)`. Data query keeps `Include` and sorting/pagination.

### 3.3 DepartmentRepository

- **File**: `GeneralWebApi.Integration/Repository/AnagraphyRepository/DepartmentRepository.cs`
- **Change**: Count uses `ApplySearchFilters(GetActiveAndEnabledEntities(), ...)` without `Include(d => d.ParentDepartment)`. Data query keeps `Include` and sorting/pagination.

### 3.4 EducationRepository

- **File**: `GeneralWebApi.Integration/Repository/AnagraphyDocumentRepository/EducationRepository.cs`
- **Change**: Same pattern — count without `Include(e => e.Employee)`, data query with Include and pagination.

### 3.5 Already optimized

- **EmployeeRepository**: Uses separate count query without includes and `AsSplitQuery()` for data to avoid cartesian explosion.
- **PositionRepository**: Uses separate count query without includes; data query uses `Include` + pagination.

---

## 4. Index usage overview (no code changes)

Indexes are defined in `GeneralWebApi.Integration/Configuration/` and are used by EF queries as follows:

| Entity / Table   | Indexes | Typical query usage |
|------------------|---------|----------------------|
| Employee         | EmployeeNumber (unique), DepartmentId, PositionId, ManagerId, TaxCode, EmploymentStatus, HireDate, IsManager, ManagerRole, Email | GetPaged (filters, sort), GetManagers, hierarchy |
| Department       | Code (unique), ParentDepartmentId, Level | GetPaged, GetHierarchy, GetByParentId |
| Position         | Code (unique), DepartmentId, Level, ParentPositionId, IsManagement | GetPaged, GetByDepartmentId, GetByParentId |
| Contract         | EmployeeId, ContractType, Status, StartDate, EndDate, **RenewalReminderDate** | GetPaged, GetExpiring, GetByEmployeeId, reminder queries |
| ContractApproval | ContractId, Status, (IsDeleted, IsActive) | GetByContractId, GetPendingByContractId, GetPendingForApprover |
| ContractApprovalStep | (ContractApprovalId, StepOrder), Status | GetApprovalSteps, step ordering |
| IdentityDocument | EmployeeId, DocumentType, DocumentNumber, IssuingAuthority, IssuingCountry, ExpirationDate | GetPaged, GetExpiring, GetByEmployeeId |
| Certification    | EmployeeId, Name, IssuingOrganization, ExpiryDate | GetPaged, GetExpiring |
| Education        | EmployeeId, Institution, Degree, FieldOfStudy | GetPaged, GetByEmployeeId |
| Role             | Name (unique) | SearchAsync OrderBy(Name), GetByName |
| EmployeeRole     | EmployeeId, RoleId, (EmployeeId, RoleId) unique, ExpiryDate | GetEmployeeCountsAsync (RoleId), GetByEmployeeId |
| RolePermission   | RoleId, PermissionId, (RoleId, PermissionId) unique, ExpiryDate | Role/Permission loading |
| Permission       | Name (unique), Resource, Action, Category, (Resource, Action) unique | Search, uniqueness |
| AuditLog         | UserId, Action, EntityType, EntityId, CreatedAt, Severity, Category, IsSuccess, composite (UserId, CreatedAt), (EntityType, EntityId) | GetPaged, GetStatistics |
| Notification     | UserId, Type, (UserId, Type), CreatedAt, (UserId, IsRead), (UserId, IsArchived) | GetPaged, GetUnreadCount, filters |

No missing critical indexes were found for the current query patterns.

---

## 5. Known N+1 / recursion (optional future optimization)

### 5.1 EmployeeRepository — hierarchy loading

- **Location**: `GeneralWebApi.Integration/Repository/AnagraphyRepository/EmployeeRepository.cs` — `GetByIdWithRelationsAsync`, `LoadManagerChainAsync`, `LoadSubordinatesAsync`.
- **Issue**: For a single employee with full manager chain and subordinates tree, the code does one query per manager level (`LoadManagerChainAsync`) and one query per employee level for subordinates (`LoadSubordinatesAsync`). So total DB round-trips = 1 (initial load) + manager depth + sum of subordinate levels. For deep or wide trees this can be many queries.
- **Possible improvements** (not implemented in this pass):
  - **Manager chain**: Load all managers in one query by collecting `ManagerId` from the chain and then `Where(e => ids.Contains(e.Id))` with a single round-trip, then wire up in memory.
  - **Subordinates**: Use a recursive CTE or a single query that loads all employees under the root by `ManagerId IN (...)` in batches, then build the tree in memory.
- **Recommendation**: Optimize if hierarchy endpoints show high latency or many round-trips in profiling; otherwise current behavior is acceptable for moderate tree sizes.

---

## 6. Over-fetch in list scenarios (optional)

### 6.1 RoleRepository.SearchAsync / GetAllAsync

- **Location**: `GeneralWebApi.Integration/Repository/BasesRepository/RoleRepository.cs`.
- **Observation**: Queries use `.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)` and `.Include(r => r.EmployeeRoles)`. For the roles **list** the handler only needs role fields + employee count (via `GetEmployeeCountsAsync`). Loading RolePermissions and EmployeeRoles for list can be heavy if roles have many permissions/assignments.
- **Possible improvement**: Add a lighter method (e.g. `SearchForListAsync`) without these includes when only list + counts are needed; keep the current method for “get by id” or detail views. Not implemented in this pass.

### 6.2 PermissionRepository / EmployeeRoleRepository / RolePermissionRepository

- **Observation**: Similar pattern: list endpoints might not need full navigation collections. If list APIs are slow, consider “list-only” queries without includes and load details on demand.

---

## 7. Summary of file changes

| File | Change |
|------|--------|
| `ContractService.cs` | Use `DeleteRangeAsync(approvals)` instead of loop of `DeleteAsync(approval.Id)` |
| `ContractConfiguration.cs` | Add index on `RenewalReminderDate` |
| `ContractRepository.cs` | GetPagedAsync: count without Include; add `ApplyPagedFilters` |
| `IdentityDocumentRepository.cs` | GetPagedAsync: count without Include |
| `DepartmentRepository.cs` | GetPagedAsync: count without Include |
| `EducationRepository.cs` | GetPagedAsync: count without Include |

All changes keep existing behavior and only improve performance and index coverage.
