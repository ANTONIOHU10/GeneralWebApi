# 🚀 部署指南

## Deployment Guide

**项目**: GeneralWebApi - Sistema di Gestione Aziendale Interna  
**版本**: v1.0  
**生成日期**: 2024 年 12 月 19 日

---

## 📋 目录

1. [系统要求](#系统要求)
2. [开发环境部署](#开发环境部署)
3. [生产环境部署](#生产环境部署)
4. [Docker 部署](#docker部署)
5. [数据库配置](#数据库配置)
6. [环境变量配置](#环境变量配置)
7. [SSL 证书配置](#ssl证书配置)
8. [监控和日志](#监控和日志)
9. [故障排除](#故障排除)
10. [维护和更新](#维护和更新)

---

## 💻 系统要求

### 最低要求

- **操作系统**: Windows Server 2019+ 或 Windows 10+
- **.NET Runtime**: .NET 9.0 Runtime
- **数据库**: SQL Server 2019+ 或 SQL Server Express
- **内存**: 4GB RAM (推荐 8GB+)
- **存储**: 20GB 可用空间
- **网络**: 稳定的网络连接

### 推荐配置

- **操作系统**: Windows Server 2022
- **.NET Runtime**: .NET 9.0 Runtime
- **数据库**: SQL Server 2022 Enterprise
- **内存**: 16GB RAM
- **存储**: 100GB SSD
- **网络**: 千兆网络连接

### 可选组件

- **Redis**: 用于缓存和会话存储
- **IIS**: Web 服务器
- **Nginx**: 反向代理和负载均衡
- **Docker**: 容器化部署

---

## 🛠️ 开发环境部署

### 1. 环境准备

#### 安装必要软件

```powershell
# 安装 .NET 9.0 SDK
winget install Microsoft.DotNet.SDK.9

# 安装 SQL Server Express (可选)
winget install Microsoft.SQLServer.2022.Express

# 安装 Visual Studio 2022 (推荐)
winget install Microsoft.VisualStudio.2022.Community
```

#### 安装 Redis (可选)

```powershell
# 使用 Chocolatey 安装 Redis
choco install redis-64

# 或使用 Docker 运行 Redis
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. 项目配置

#### 克隆项目

```bash
git clone https://github.com/your-company/GeneralWebApi.git
cd GeneralWebApi/GeneralWebApi/Backend
```

#### 还原依赖包

```bash
dotnet restore
```

#### 配置数据库连接字符串

编辑 `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GeneralWebApi_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  }
}
```

### 3. 数据库初始化

#### 运行数据库迁移

```bash
# 在项目根目录执行
dotnet ef database update --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi
```

#### 运行种子数据

```bash
# 运行应用程序，种子数据会自动执行
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi
```

### 4. 启动应用程序

#### 使用 Visual Studio

1. 打开 `GeneralWebApi.sln`
2. 设置 `GeneralWebApi.WebApi` 为启动项目
3. 按 F5 启动调试

#### 使用命令行

```bash
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi
```

#### 使用 IIS Express

```bash
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi --launch-profile "IIS Express"
```

---

## 🏭 生产环境部署

### 1. 服务器准备

#### Windows Server 配置

```powershell
# 启用 IIS 功能
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-ASPNET45

# 安装 .NET 9.0 Hosting Bundle
# 下载并安装: https://dotnet.microsoft.com/download/dotnet/9.0
```

#### 安装 SQL Server

```powershell
# 下载并安装 SQL Server 2022
# 配置混合身份验证模式
# 创建数据库用户和权限
```

### 2. 应用程序发布

#### 发布应用程序

```bash
# 发布到文件夹
dotnet publish src/1-Presentation/GeneralWebApi.WebApi -c Release -o ./publish

# 发布到 IIS
dotnet publish src/1-Presentation/GeneralWebApi.WebApi -c Release -o C:\inetpub\wwwroot\GeneralWebApi
```

#### 配置 IIS

1. 打开 IIS 管理器
2. 创建新网站
3. 设置物理路径为发布目录
4. 配置应用程序池为 .NET CLR Version: No Managed Code
5. 设置身份验证

### 3. 数据库配置

#### 创建生产数据库

```sql
-- 创建数据库
CREATE DATABASE GeneralWebApi_Prod;
GO

-- 创建数据库用户
CREATE LOGIN [GeneralWebApiUser] WITH PASSWORD = 'YourSecurePassword123!';
GO

USE GeneralWebApi_Prod;
GO

CREATE USER [GeneralWebApiUser] FOR LOGIN [GeneralWebApiUser];
GO

-- 分配权限
ALTER ROLE db_datareader ADD MEMBER [GeneralWebApiUser];
ALTER ROLE db_datawriter ADD MEMBER [GeneralWebApiUser];
ALTER ROLE db_ddladmin ADD MEMBER [GeneralWebApiUser];
GO
```

#### 运行数据库迁移

```bash
# 设置生产环境连接字符串
$env:ConnectionStrings__DefaultConnection="Server=YourServer;Database=GeneralWebApi_Prod;User Id=GeneralWebApiUser;Password=YourSecurePassword123!;MultipleActiveResultSets=true"

# 运行迁移
dotnet ef database update --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi
```

---

## 🐳 Docker 部署

### 1. Dockerfile 配置

创建 `Dockerfile`:

```dockerfile
# 使用官方 .NET 9.0 运行时镜像
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# 使用官方 .NET 9.0 SDK 镜像进行构建
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 复制项目文件
COPY ["src/1-Presentation/GeneralWebApi.WebApi/GeneralWebApi.WebApi.csproj", "src/1-Presentation/GeneralWebApi.WebApi/"]
COPY ["src/2-Application/GeneralWebApi.Application/GeneralWebApi.Application.csproj", "src/2-Application/GeneralWebApi.Application/"]
COPY ["src/3-Domain/GeneralWebApi.Domain/GeneralWebApi.Domain.csproj", "src/3-Domain/GeneralWebApi.Domain/"]
COPY ["src/4-Infrastructure/GeneralWebApi.Integration/GeneralWebApi.Integration.csproj", "src/4-Infrastructure/GeneralWebApi.Integration/"]

# 还原依赖包
RUN dotnet restore "src/1-Presentation/GeneralWebApi.WebApi/GeneralWebApi.WebApi.csproj"

# 复制所有源代码
COPY . .

# 构建应用程序
WORKDIR "/src/src/1-Presentation/GeneralWebApi.WebApi"
RUN dotnet build "GeneralWebApi.WebApi.csproj" -c Release -o /app/build

# 发布应用程序
FROM build AS publish
RUN dotnet publish "GeneralWebApi.WebApi.csproj" -c Release -o /app/publish

# 最终镜像
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GeneralWebApi.WebApi.dll"]
```

### 2. Docker Compose 配置

创建 `docker-compose.yml`:

```yaml
version: "3.8"

services:
  webapi:
    build: .
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=database;Database=GeneralWebApi_Prod;User Id=sa;Password=YourPassword123!;MultipleActiveResultSets=true
      - Redis__ConnectionString=redis:6379
    depends_on:
      - database
      - redis
    networks:
      - app-network

  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    networks:
      - app-network

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  sqlserver_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 3. 构建和运行

#### 构建镜像

```bash
# 构建应用程序镜像
docker build -t generalwebapi:latest .

# 或使用 Docker Compose
docker-compose build
```

#### 运行容器

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f webapi

# 停止服务
docker-compose down
```

---

## 🗄️ 数据库配置

### 1. 连接字符串配置

#### 开发环境

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GeneralWebApi_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

#### 生产环境

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YourServer;Database=GeneralWebApi_Prod;User Id=YourUser;Password=YourPassword;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

### 2. 数据库优化

#### 索引优化

```sql
-- 为常用查询字段创建索引
CREATE INDEX IX_Employees_EmployeeNumber ON Employees(EmployeeNumber);
CREATE INDEX IX_Employees_DepartmentId ON Employees(DepartmentId);
CREATE INDEX IX_Employees_PositionId ON Employees(PositionId);
CREATE INDEX IX_Employees_Email ON Employees(Email);

-- 为部门表创建索引
CREATE INDEX IX_Departments_ParentDepartmentId ON Departments(ParentDepartmentId);
CREATE INDEX IX_Departments_Level ON Departments(Level);

-- 为权限表创建索引
CREATE INDEX IX_EmployeeRoles_EmployeeId ON EmployeeRoles(EmployeeId);
CREATE INDEX IX_EmployeeRoles_RoleId ON EmployeeRoles(RoleId);
CREATE INDEX IX_RolePermissions_RoleId ON RolePermissions(RoleId);
CREATE INDEX IX_RolePermissions_PermissionId ON RolePermissions(PermissionId);
```

#### 性能优化

```sql
-- 更新统计信息
UPDATE STATISTICS Employees;
UPDATE STATISTICS Departments;
UPDATE STATISTICS Positions;

-- 重建索引
ALTER INDEX ALL ON Employees REBUILD;
ALTER INDEX ALL ON Departments REBUILD;
ALTER INDEX ALL ON Positions REBUILD;
```

---

## ⚙️ 环境变量配置

### 1. 应用程序配置

#### 开发环境 (.env.development)

```env
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5000;https://localhost:5001

ConnectionStrings__DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=GeneralWebApi_Dev;Trusted_Connection=true;MultipleActiveResultSets=true

Redis__ConnectionString=localhost:6379

JWT__SecretKey=YourSecretKeyForDevelopment
JWT__Issuer=GeneralWebApi
JWT__Audience=GeneralWebApi
JWT__ExpiryMinutes=60

Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft=Warning
Logging__LogLevel__System=Warning
```

#### 生产环境 (.env.production)

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80;https://+:443

ConnectionStrings__DefaultConnection=Server=YourServer;Database=GeneralWebApi_Prod;User Id=YourUser;Password=YourPassword;MultipleActiveResultSets=true;TrustServerCertificate=true

Redis__ConnectionString=YourRedisServer:6379

JWT__SecretKey=YourProductionSecretKey
JWT__Issuer=GeneralWebApi
JWT__Audience=GeneralWebApi
JWT__ExpiryMinutes=60

Logging__LogLevel__Default=Warning
Logging__LogLevel__Microsoft=Warning
Logging__LogLevel__System=Warning
```

### 2. 配置管理

#### 使用 appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "#{ConnectionStrings__DefaultConnection}#"
  },
  "Redis": {
    "ConnectionString": "#{Redis__ConnectionString}#"
  },
  "JWT": {
    "SecretKey": "#{JWT__SecretKey}#",
    "Issuer": "#{JWT__Issuer}#",
    "Audience": "#{JWT__Audience}#",
    "ExpiryMinutes": "#{JWT__ExpiryMinutes}#"
  }
}
```

---

## 🔒 SSL 证书配置

### 1. 开发环境 SSL

#### 生成开发证书

```bash
# 生成开发证书
dotnet dev-certs https --trust

# 导出证书
dotnet dev-certs https --export-path ./certificates/development.pfx --password YourPassword
```

### 2. 生产环境 SSL

#### 使用 Let's Encrypt

```bash
# 安装 Certbot
# 生成证书
certbot certonly --standalone -d yourdomain.com

# 配置IIS使用证书
# 在IIS管理器中绑定HTTPS端口443
```

#### 使用商业证书

1. 购买 SSL 证书
2. 生成证书签名请求(CSR)
3. 提交给证书颁发机构
4. 安装证书到 IIS

---

## 📊 监控和日志

### 1. 日志配置

#### Serilog 配置

```json
{
  "Serilog": {
    "Using": [
      "Serilog.Sinks.Console",
      "Serilog.Sinks.File",
      "Serilog.Sinks.MSSqlServer"
    ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      },
      {
        "Name": "MSSqlServer",
        "Args": {
          "connectionString": "#{ConnectionStrings__DefaultConnection}#",
          "sinkOptionsSection": {
            "tableName": "Logs",
            "autoCreateSqlTable": true
          }
        }
      }
    ]
  }
}
```

### 2. 健康检查

#### 配置健康检查

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddRedis(redisConnectionString)
    .AddCheck<CustomHealthCheck>("custom");

app.MapHealthChecks("/health");
```

#### 监控端点

```http
GET /health
GET /health/ready
GET /health/live
```

---

## 🔧 故障排除

### 1. 常见问题

#### 数据库连接问题

```bash
# 检查数据库服务状态
sc query MSSQLSERVER

# 检查连接字符串
dotnet ef database update --verbose

# 测试连接
sqlcmd -S YourServer -U YourUser -P YourPassword
```

#### 应用程序启动问题

```bash
# 检查端口占用
netstat -ano | findstr :5000

# 检查依赖项
dotnet list package

# 清理和重建
dotnet clean
dotnet build
```

#### 权限问题

```bash
# 检查IIS应用程序池身份
# 检查数据库用户权限
# 检查文件系统权限
```

### 2. 日志分析

#### 查看应用程序日志

```bash
# 查看IIS日志
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log | Select-String "ERROR"

# 查看应用程序日志
Get-Content C:\inetpub\wwwroot\GeneralWebApi\logs\*.log | Select-String "ERROR"
```

#### 数据库日志

```sql
-- 查看SQL Server错误日志
EXEC xp_readerrorlog

-- 查看死锁信息
SELECT * FROM sys.dm_tran_locks WHERE request_status = 'WAIT'
```

---

## 🔄 维护和更新

### 1. 定期维护

#### 数据库维护

```sql
-- 更新统计信息
EXEC sp_updatestats

-- 重建索引
ALTER INDEX ALL ON Employees REBUILD

-- 清理日志
DBCC SHRINKFILE('GeneralWebApi_Log', 1)
```

#### 应用程序维护

```bash
# 清理临时文件
dotnet clean

# 更新依赖包
dotnet list package --outdated
dotnet add package PackageName --version LatestVersion
```

### 2. 备份策略

#### 数据库备份

```sql
-- 完整备份
BACKUP DATABASE GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Full.bak'

-- 差异备份
BACKUP DATABASE GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Diff.bak' WITH DIFFERENTIAL

-- 事务日志备份
BACKUP LOG GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Log.trn'
```

#### 应用程序备份

```bash
# 备份应用程序文件
xcopy C:\inetpub\wwwroot\GeneralWebApi C:\Backups\GeneralWebApi\ /E /I /H /Y

# 备份配置文件
copy C:\inetpub\wwwroot\GeneralWebApi\appsettings.json C:\Backups\GeneralWebApi\
```

### 3. 更新流程

#### 应用程序更新

1. 备份当前版本
2. 停止应用程序
3. 部署新版本
4. 运行数据库迁移
5. 启动应用程序
6. 验证功能正常

#### 数据库更新

1. 备份数据库
2. 运行迁移脚本
3. 验证数据完整性
4. 回滚计划准备

---

## 📞 支持和联系

### 技术支持

- **邮箱**: support@company.com
- **电话**: +1-800-123-4567
- **文档**: https://docs.company.com

### 紧急联系

- **24/7 支持**: +1-800-911-HELP
- **紧急邮箱**: emergency@company.com

---

**文档版本**: v1.0  
**最后更新**: 2024 年 12 月 19 日  
**维护者**: 开发团队

