# GeneralWebApi 测试计划与策略

本文档描述 Backend 两个测试项目（UnitTests / IntegrationTests）的测试类别、工具与实施计划。

---

## 1. 测试项目概览

| 项目 | 用途 | 主要工具 |
|------|------|----------|
| **GeneralWebApi.UnitTests** | 单元测试：业务逻辑、Handler、Service 等，依赖用 Mock 隔离 | xUnit, Moq, FluentAssertions, Coverlet |
| **GeneralWebApi.IntegrationTests** | 集成测试：API 端点、数据库、外部服务等真实依赖 | xUnit, FluentAssertions, Coverlet, (可选) WebApplicationFactory, Testcontainers |

---

## 2. 测试类别与要求

### 2.1 单元测试（GeneralWebApi.UnitTests）

- **业务正确性**
  - 覆盖 Application 层：Handlers、Validators、Mapping、领域规则。
  - 覆盖 Domain 层：实体行为、值对象、领域服务。
  - 断言：使用 FluentAssertions，保证边界条件、异常路径、空值处理均有用例。
- **Mock 使用**
  - 外部依赖（IEmployeeService、IRepository、IEmailService 等）一律用 **Moq** 替代。
  - 只测当前类行为，不依赖真实 DB/HTTP/文件系统。
  - 约定：Mock 行为用 `Setup` 明确，调用用 `Verify` 校验次数与参数。
- **代码覆盖率**
  - 使用 **Coverlet** 收集覆盖率；目标：核心业务（Application/Domain）**≥ 70%**，关键路径尽量 **≥ 80%**。
  - 命令行示例：
    ```bash
    dotnet test GeneralWebApi.UnitTests.csproj --collect:"XPlat Code Coverage"
    ```
  - 报告可配合 ReportGenerator 生成 HTML（可选，后续在 CI 中配置）。

### 2.2 集成测试（GeneralWebApi.IntegrationTests）

- **API 与流程正确性**
  - 使用 **Microsoft.AspNetCore.Mvc.Testing** + **WebApplicationFactory&lt;T&gt;** 启动内存宿主，对 HTTP 端点做端到端请求。
  - 覆盖：认证/授权、路由、模型绑定、返回码、响应体结构。
- **数据与外部依赖**
  - 数据库：优先使用 **Testcontainers**（如 Testcontainers.SqlServer）或内存库（如 SQLite / EF InMemory），避免依赖共享测试库。
  - 外部 HTTP：可 Mock 或使用 WireMock 等；避免调用真实第三方。
- **性能/效率测试（可选）**
  - 对关键 API 做简单负载或耗时断言（例如：单请求 &lt; 200ms）。
  - 若需正式压测，可单独建 Benchmark/负载项目或使用 NBomber、k6 等，本仓库内可先在 IntegrationTests 中做少量“效率断言”占位。

### 2.3 代码覆盖率（两个项目）

- **工具**：Coverlet（已通过 TestPackages.props 统一版本）。
- **范围**：UnitTests 必跑覆盖率；IntegrationTests 可按需开启（通常只作参考）。
- **目标**：
  - UnitTests：整体 ≥ 70%，Application/Domain 关键类 ≥ 80%。
  - IntegrationTests：覆盖率不作为硬性指标，重点保证关键 API 与流程有用例。

### 2.4 Mock 与测试数据

- **Mock**：仅在 UnitTests 使用 Moq；IntegrationTests 尽量真实依赖（或 Testcontainers），必要时再对部分服务做 Mock。
- **测试数据**：建议集中维护（如 Builders、Fixtures 或 JSON 文件），避免在测试方法内硬编码大段数据；命名体现场景（如 `ValidEmployee`, `InvalidEmail`）。

---

## 3. 包与配置规划

### 3.1 当前已有（TestPackages.props）

- xUnit, xunit.runner.visualstudio  
- Microsoft.NET.Test.Sdk  
- Coverlet.collector  
- FluentAssertions  
- Moq  

### 3.2 计划补充（按需加入 TestPackages.props 与对应项目）

| 用途 | 包 | 项目 |
|------|-----|------|
| 集成测试宿主 | Microsoft.AspNetCore.Mvc.Testing | IntegrationTests |
| 数据库集成测试 | Testcontainers.MsSqlServer（或 Testcontainers 系列） | IntegrationTests |
| 覆盖率报告（可选） | coverlet.reportgenerator | 构建/CI |

---

## 4. 实施计划（建议顺序）

1. **UnitTests**
   - [ ] 为现有 Application Handlers 补全单元测试（Mock 依赖，断言业务与异常）。
   - [ ] 为 Domain 关键逻辑补充用例。
   - [ ] 配置并定期查看 Coverlet 覆盖率，向 70%/80% 目标靠拢。
2. **IntegrationTests**
   - [ ] 引入 WebApplicationFactory，写 1～2 个健康检查或简单 API 的端到端用例。
   - [ ] 按需引入 Testcontainers，为依赖数据库的流程写集成用例。
   - [ ] （可选）为关键接口添加简单性能/耗时断言。
3. **CI / 规范**
   - [ ] 在 CI 中执行 `dotnet test` 并收集覆盖率（Coverlet 输出）。
   - [ ] （可选）配置 ReportGenerator，将覆盖率报告发布为制品或注释到 PR。

---

## 5. 参考命令

```bash
# 仅运行单元测试
dotnet test GeneralWebApi.UnitTests.csproj

# 仅运行集成测试
dotnet test GeneralWebApi.IntegrationTests.csproj

# 单元测试 + 代码覆盖率
dotnet test GeneralWebApi.UnitTests.csproj --collect:"XPlat Code Coverage"

# 运行全部测试
dotnet test
```

---

## 6. 文档与维护

- 本文件位于 `Backend/src/test/TEST_PLAN.md`，随测试类别或包变更一起更新。
- 新增测试类别（如“契约测试”“性能测试项目”）时，在本文档中补充项目名、职责与包依赖。
