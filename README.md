# GeneralWebApi

A modern enterprise management system built with .NET 9 and Angular, featuring employee management, organizational structure, contract management, and role-based access control.

##  Technology Stack

### Backend
- **.NET 9.0** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core 9.0.7** - ORM for database operations
- **SQL Server** - Primary database
- **Redis** - Distributed caching
- **JWT Authentication** - Secure token-based authentication

### Frontend
- **Angular 19** - Modern web framework
- **NgRx** - State management
- **PrimeNG** - UI component library
- **Angular Material** - Material Design components
- **SCSS** - Styling with theme support

##  Key Features

-  **Employee Management** - Comprehensive employee data management
-  **Department & Position Management** - Organizational structure management
-  **Contract Management** - Contract lifecycle and approval workflows
-  **Role-Based Access Control** - Granular permission management
-  **Theme Support** - Light and dark mode
-  **Responsive Design** - Mobile-friendly interface
-  **Multi-language Support** - Internationalization ready
-  **Dashboard & Analytics** - System monitoring and insights

## Project Preview

### Dashboard
![Dashboard](./GeneralWebApi/Preview/dashboard.png)

### Employee Management

#### Employee List View
![Employee List View](./GeneralWebApi/Preview/Employeement_management.png)

#### Employee Card View
![Employee Card View](./GeneralWebApi/Preview/Employees_list_cardView.png)

#### Employee Detail
![Employee Detail](./GeneralWebApi/Preview/Employee_detail.png)

#### Adding Employee
![Adding Employee](./GeneralWebApi/Preview/adding_employee.png)

### Department Management

#### Department Management
![Department Management](./GeneralWebApi/Preview/department_management.png)

#### Department Search
![Department Search](./GeneralWebApi/Preview/department_search.png)

### Contract Management

#### Contract Templates
![Contract Templates](./GeneralWebApi/Preview/contract_templates.png)

#### Contract Approval Detail
![Contract Approval Detail](./GeneralWebApi/Preview/contract_approval_detail.png)

#### Approval Steps
![Approval Steps](./GeneralWebApi/Preview/Approval_steps.png)

### Approval Management
![Approval Management](./GeneralWebApi/Preview/approval_management.png)

### Mobile Views

#### Mobile Example
![Mobile Example](./GeneralWebApi/Preview/Mobile_example.png)

#### Mobile Sidebar
![Mobile Sidebar](./GeneralWebApi/Preview/Mobile_sideBar.png)

### System Features

#### Settings
![Settings](./GeneralWebApi/Preview/Setting.png)

#### System Security
![System Security](./GeneralWebApi/Preview/System_security.png)

#### Audit Logs
![Audit Logs](./GeneralWebApi/Preview/Audit.png)

#### Authentication
![Authentication](./GeneralWebApi/Preview/Authentication.png)

#### Notifications
![Notifications](./GeneralWebApi/Preview/Notification.png)

### User Features

#### User Modal
![User Modal](./GeneralWebApi/Preview/User_modal.png)

#### Reset Password
![Reset Password](./GeneralWebApi/Preview/Reset_password.png)

### UI Components

#### Loading Spinner
![Loading Spinner](./GeneralWebApi/Preview/loading_spinner.png)

#### Todo List
![Todo List](./GeneralWebApi/Preview/Todo.png)

### Backend API Examples
![Backend API Examples](./GeneralWebApi/Preview/Backend%20API%20exmaples.png)

## Quick Start

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+ and npm
- SQL Server
- Redis (optional, for caching)

### Using Docker Compose

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d
```

### Manual Setup

#### Backend
```bash
cd GeneralWebApi/Backend
dotnet restore
dotnet run
```

#### Frontend
```bash
cd GeneralWebApi/Frontend/general-frontend
npm install
ng serve
```

## 📁 Project Structure

```
GeneralWebApi/
├── Backend/              # .NET Web API
│   ├── src/
│   │   ├── 1-Presentation/    # API controllers
│   │   ├── 2-Application/     # Business logic
│   │   ├── 3-Domain/          # Domain models
│   │   ├── 4-Infrastructure/  # Data access & services
│   │   └── 5-Shared/          # Shared utilities
│   └── docs/                  # Backend documentation
├── Frontend/            # Angular application
│   └── general-frontend/
│       ├── src/
│       │   ├── app/           # Application code
│       │   ├── assets/        # Static assets
│       │   └── styles/        # Global styles
│       └── docs/              # Frontend documentation
├── Preview/             # Project screenshots
└── docker-compose.yml   # Docker configuration
```

##  Documentation

- [Backend Documentation](./GeneralWebApi/Backend/README.md)
- [Frontend Documentation](./GeneralWebApi/Frontend/README.md)
- [API Documentation](./GeneralWebApi/Backend/docs/API_Documentation.md)
- [Deployment Guide](./GeneralWebApi/Backend/docs/Deployment_Guide.md)

## 🔧 Development

### Backend Development
- Clean Architecture pattern
- Domain-Driven Design (DDD)
- CQRS implementation
- Repository pattern

### Frontend Development
- Component-based architecture
- NgRx state management
- SCSS with design tokens
- Theme system with CSS variables

##  License

This project is proprietary software.

##  Contributing

This is an internal personal project.

---

**Built with  using .NET 9 and Angular 19**