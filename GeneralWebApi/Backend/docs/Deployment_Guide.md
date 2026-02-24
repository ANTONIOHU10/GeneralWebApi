# 🚀 Deployment Guide

**Project**: GeneralWebApi - Enterprise Management System  
**Version**: v1.0  
**Last Updated**: December 19, 2024

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Deployment](#development-environment-deployment)
3. [Production Environment Deployment](#production-environment-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Configuration](#database-configuration)
6. [Environment Variables Configuration](#environment-variables-configuration)
7. [SSL Certificate Configuration](#ssl-certificate-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance and Updates](#maintenance-and-updates)

---

## 💻 System Requirements

### Minimum Requirements

- **Operating System**: Windows Server 2019+ or Windows 10+
- **.NET Runtime**: .NET 9.0 Runtime
- **Database**: SQL Server 2019+ or SQL Server Express
- **Memory**: 4GB RAM (8GB+ recommended)
- **Storage**: 20GB available space
- **Network**: Stable network connection

### Recommended Configuration

- **Operating System**: Windows Server 2022
- **.NET Runtime**: .NET 9.0 Runtime
- **Database**: SQL Server 2022 Enterprise
- **Memory**: 16GB RAM
- **Storage**: 100GB SSD
- **Network**: Gigabit network connection

### Optional Components

- **Redis**: For caching and session storage
- **IIS**: Web server
- **Nginx**: Reverse proxy and load balancing
- **Docker**: Containerized deployment

---

## 🛠️ Development Environment Deployment

### 1. Environment Setup

#### Install Required Software

```powershell
# Install .NET 9.0 SDK
winget install Microsoft.DotNet.SDK.9

# Install SQL Server Express (optional)
winget install Microsoft.SQLServer.2022.Express

# Install Visual Studio 2022 (recommended)
winget install Microsoft.VisualStudio.2022.Community
```

#### Install Redis (Optional)

```powershell
# Install Redis using Chocolatey
choco install redis-64

# Or run Redis using Docker
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. Project Configuration

#### Clone Project

```bash
git clone https://github.com/your-company/GeneralWebApi.git
cd GeneralWebApi/GeneralWebApi/Backend
```

#### Restore Dependencies

```bash
dotnet restore
```

#### Configure Database Connection String

Edit `appsettings.Development.json`:

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

### 3. Database Initialization

#### Run Database Migrations

```bash
# Execute in project root directory
dotnet ef database update --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi
```

#### Run Seed Data

```bash
# Run the application, seed data will execute automatically
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi
```

### 4. Start Application

#### Using Visual Studio

1. Open `GeneralWebApi.sln`
2. Set `GeneralWebApi.WebApi` as startup project
3. Press F5 to start debugging

#### Using Command Line

```bash
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi
```

#### Using IIS Express

```bash
dotnet run --project src/1-Presentation/GeneralWebApi.WebApi --launch-profile "IIS Express"
```

---

## 🏭 Production Environment Deployment

### 1. Server Preparation

#### Windows Server Configuration

```powershell
# Enable IIS features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-ASPNET45

# Install .NET 9.0 Hosting Bundle
# Download and install: https://dotnet.microsoft.com/download/dotnet/9.0
```

#### Install SQL Server

```powershell
# Download and install SQL Server 2022
# Configure mixed authentication mode
# Create database users and permissions
```

### 2. Application Publishing

#### Publish Application

```bash
# Publish to folder
dotnet publish src/1-Presentation/GeneralWebApi.WebApi -c Release -o ./publish

# Publish to IIS
dotnet publish src/1-Presentation/GeneralWebApi.WebApi -c Release -o C:\inetpub\wwwroot\GeneralWebApi
```

#### Configure IIS

1. Open IIS Manager
2. Create new website
3. Set physical path to publish directory
4. Configure application pool to .NET CLR Version: No Managed Code
5. Set authentication

### 3. Database Configuration

#### Create Production Database

```sql
-- Create database
CREATE DATABASE GeneralWebApi_Prod;
GO

-- Create database user
CREATE LOGIN [GeneralWebApiUser] WITH PASSWORD = 'YourSecurePassword123!';
GO

USE GeneralWebApi_Prod;
GO

CREATE USER [GeneralWebApiUser] FOR LOGIN [GeneralWebApiUser];
GO

-- Assign permissions
ALTER ROLE db_datareader ADD MEMBER [GeneralWebApiUser];
ALTER ROLE db_datawriter ADD MEMBER [GeneralWebApiUser];
ALTER ROLE db_ddladmin ADD MEMBER [GeneralWebApiUser];
GO
```

#### Run Database Migrations

```bash
# Set production environment connection string
$env:ConnectionStrings__DefaultConnection="Server=YourServer;Database=GeneralWebApi_Prod;User Id=GeneralWebApiUser;Password=YourSecurePassword123!;MultipleActiveResultSets=true"

# Run migrations
dotnet ef database update --project src/4-Infrastructure/GeneralWebApi.Integration --startup-project src/1-Presentation/GeneralWebApi.WebApi
```

---

## 🐳 Docker Deployment

### 1. Dockerfile Configuration

Create `Dockerfile`:

```dockerfile
# Use official .NET 9.0 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use official .NET 9.0 SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/1-Presentation/GeneralWebApi.WebApi/GeneralWebApi.WebApi.csproj", "src/1-Presentation/GeneralWebApi.WebApi/"]
COPY ["src/2-Application/GeneralWebApi.Application/GeneralWebApi.Application.csproj", "src/2-Application/GeneralWebApi.Application/"]
COPY ["src/3-Domain/GeneralWebApi.Domain/GeneralWebApi.Domain.csproj", "src/3-Domain/GeneralWebApi.Domain/"]
COPY ["src/4-Infrastructure/GeneralWebApi.Integration/GeneralWebApi.Integration.csproj", "src/4-Infrastructure/GeneralWebApi.Integration/"]

# Restore dependencies
RUN dotnet restore "src/1-Presentation/GeneralWebApi.WebApi/GeneralWebApi.WebApi.csproj"

# Copy all source code
COPY . .

# Build application
WORKDIR "/src/src/1-Presentation/GeneralWebApi.WebApi"
RUN dotnet build "GeneralWebApi.WebApi.csproj" -c Release -o /app/build

# Publish application
FROM build AS publish
RUN dotnet publish "GeneralWebApi.WebApi.csproj" -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GeneralWebApi.WebApi.dll"]
```

### 2. Docker Compose Configuration

Create `docker-compose.yml`:

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

### 3. Build and Run

#### Build Image

```bash
# Build application image
docker build -t generalwebapi:latest .

# Or use Docker Compose
docker-compose build
```

#### Run Containers

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f webapi

# Stop services
docker-compose down
```

---

## 🗄️ Database Configuration

### 1. Connection String Configuration

#### Development Environment

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GeneralWebApi_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

#### Production Environment

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YourServer;Database=GeneralWebApi_Prod;User Id=YourUser;Password=YourPassword;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

### 2. Database Optimization

#### Index Optimization

```sql
-- Create indexes for commonly queried fields
CREATE INDEX IX_Employees_EmployeeNumber ON Employees(EmployeeNumber);
CREATE INDEX IX_Employees_DepartmentId ON Employees(DepartmentId);
CREATE INDEX IX_Employees_PositionId ON Employees(PositionId);
CREATE INDEX IX_Employees_Email ON Employees(Email);

-- Create indexes for department table
CREATE INDEX IX_Departments_ParentDepartmentId ON Departments(ParentDepartmentId);
CREATE INDEX IX_Departments_Level ON Departments(Level);

-- Create indexes for permission tables
CREATE INDEX IX_EmployeeRoles_EmployeeId ON EmployeeRoles(EmployeeId);
CREATE INDEX IX_EmployeeRoles_RoleId ON EmployeeRoles(RoleId);
CREATE INDEX IX_RolePermissions_RoleId ON RolePermissions(RoleId);
CREATE INDEX IX_RolePermissions_PermissionId ON RolePermissions(PermissionId);
```

#### Performance Optimization

```sql
-- Update statistics
UPDATE STATISTICS Employees;
UPDATE STATISTICS Departments;
UPDATE STATISTICS Positions;

-- Rebuild indexes
ALTER INDEX ALL ON Employees REBUILD;
ALTER INDEX ALL ON Departments REBUILD;
ALTER INDEX ALL ON Positions REBUILD;
```

---

## ⚙️ Environment Variables Configuration

### 1. Application Configuration

#### Development Environment (.env.development)

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

#### Production Environment (.env.production)

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

### 2. Configuration Management

#### Using appsettings.json

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

## 🔒 SSL Certificate Configuration

### 1. Development Environment SSL

#### Generate Development Certificate

```bash
# Generate development certificate
dotnet dev-certs https --trust

# Export certificate
dotnet dev-certs https --export-path ./certificates/development.pfx --password YourPassword
```

### 2. Production Environment SSL

#### Using Let's Encrypt

```bash
# Install Certbot
# Generate certificate
certbot certonly --standalone -d yourdomain.com

# Configure IIS to use certificate
# Bind HTTPS port 443 in IIS Manager
```

#### Using Commercial Certificate

1. Purchase SSL certificate
2. Generate Certificate Signing Request (CSR)
3. Submit to Certificate Authority
4. Install certificate to IIS

---

## 📊 Monitoring and Logging

### 1. Logging Configuration

#### Serilog Configuration

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

### 2. Health Checks

#### Configure Health Checks

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddRedis(redisConnectionString)
    .AddCheck<CustomHealthCheck>("custom");

app.MapHealthChecks("/health");
```

#### Monitoring Endpoints

```http
GET /health
GET /health/ready
GET /health/live
```

---

## 🔧 Troubleshooting

### 1. Common Issues

#### Database Connection Issues

```bash
# Check database service status
sc query MSSQLSERVER

# Check connection string
dotnet ef database update --verbose

# Test connection
sqlcmd -S YourServer -U YourUser -P YourPassword
```

#### Application Startup Issues

```bash
# Check port usage
netstat -ano | findstr :5000

# Check dependencies
dotnet list package

# Clean and rebuild
dotnet clean
dotnet build
```

#### Permission Issues

```bash
# Check IIS application pool identity
# Check database user permissions
# Check file system permissions
```

### 2. Log Analysis

#### View Application Logs

```bash
# View IIS logs
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log | Select-String "ERROR"

# View application logs
Get-Content C:\inetpub\wwwroot\GeneralWebApi\logs\*.log | Select-String "ERROR"
```

#### Database Logs

```sql
-- View SQL Server error logs
EXEC xp_readerrorlog

-- View deadlock information
SELECT * FROM sys.dm_tran_locks WHERE request_status = 'WAIT'
```

---

## 🔄 Maintenance and Updates

### 1. Regular Maintenance

#### Database Maintenance

```sql
-- Update statistics
EXEC sp_updatestats

-- Rebuild indexes
ALTER INDEX ALL ON Employees REBUILD

-- Clean up logs
DBCC SHRINKFILE('GeneralWebApi_Log', 1)
```

#### Application Maintenance

```bash
# Clean temporary files
dotnet clean

# Update dependencies
dotnet list package --outdated
dotnet add package PackageName --version LatestVersion
```

### 2. Backup Strategy

#### Database Backup

```sql
-- Full backup
BACKUP DATABASE GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Full.bak'

-- Differential backup
BACKUP DATABASE GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Diff.bak' WITH DIFFERENTIAL

-- Transaction log backup
BACKUP LOG GeneralWebApi_Prod TO DISK = 'C:\Backups\GeneralWebApi_Log.trn'
```

#### Application Backup

```bash
# Backup application files
xcopy C:\inetpub\wwwroot\GeneralWebApi C:\Backups\GeneralWebApi\ /E /I /H /Y

# Backup configuration files
copy C:\inetpub\wwwroot\GeneralWebApi\appsettings.json C:\Backups\GeneralWebApi\
```

### 3. Update Process

#### Application Update

1. Backup current version
2. Stop application
3. Deploy new version
4. Run database migrations
5. Start application
6. Verify functionality

#### Database Update

1. Backup database
2. Run migration scripts
3. Verify data integrity
4. Prepare rollback plan

---

## 📞 Support and Contact

### Technical Support

- **Email**: support@company.com
- **Phone**: +1-800-123-4567
- **Documentation**: https://docs.company.com

### Emergency Contact

- **24/7 Support**: +1-800-911-HELP
- **Emergency Email**: emergency@company.com

---

**Document Version**: v1.0  
**Last Updated**: December 19, 2024  
**Maintained by**: Development Team
