# 📚 API Documentation

**Project**: GeneralWebApi - Enterprise Management System  
**Version**: v1.0  
**Last Updated**: December 19, 2024  
**Base URL**: `https://api.company.com/api/v1`

---

## 📋 Table of Contents

1. [Authentication and Authorization](#authentication-and-authorization)
2. [Employee Management API](#employee-management-api)
3. [Department Management API](#department-management-api)
4. [Position Management API](#position-management-api)
5. [Permission Management API](#permission-management-api)
6. [Document Management API](#document-management-api)
7. [Contract Management API](#contract-management-api)
8. [Common Response Format](#common-response-format)
9. [Error Handling](#error-handling)
10. [Status Codes](#status-codes)

---

## 🔐 Authentication and Authorization

### Get Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin@company.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

---

## 👥 Employee Management API

### Get Employee List

```http
GET /api/v1/employees?page=1&pageSize=10&search=john&departmentId=1&sortBy=firstName&sortDescending=false
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)
- `search`: Search keyword (name, employee number, email)
- `departmentId`: Filter by department ID
- `positionId`: Filter by position ID
- `sortBy`: Sort field (firstName, lastName, employeeNumber, hireDate)
- `sortDescending`: Sort in descending order (default: false)

**Response**:

```json
{
  "success": true,
  "message": "Employee list retrieved successfully",
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

### Get Single Employee

```http
GET /api/v1/employees/{id}
Authorization: Bearer {accessToken}
```

**Response**:

```json
{
  "success": true,
  "message": "Employee information retrieved successfully",
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

### Create Employee

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

### Update Employee

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

### Delete Employee

```http
DELETE /api/v1/employees/{id}
Authorization: Bearer {accessToken}
```

---

## 🏢 Department Management API

### Get Department List

```http
GET /api/v1/departments?page=1&pageSize=10&search=it&parentId=1&level=2
Authorization: Bearer {accessToken}
```

### Get Department Hierarchy

```http
GET /api/v1/departments/hierarchy
Authorization: Bearer {accessToken}
```

**Response**:

```json
{
  "success": true,
  "message": "Department hierarchy retrieved successfully",
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

### Get Sub-departments

```http
GET /api/v1/departments/parent/{parentId}
Authorization: Bearer {accessToken}
```

### Create Department

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

### Update Department

```http
PUT /api/v1/departments/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Department",
  "description": "Updated Description"
}
```

### Delete Department

```http
DELETE /api/v1/departments/{id}
Authorization: Bearer {accessToken}
```

---

## 💼 Position Management API

### Get Position List

```http
GET /api/v1/positions?page=1&pageSize=10&departmentId=1&isManagement=false
Authorization: Bearer {accessToken}
```

### Get Single Position

```http
GET /api/v1/positions/{id}
Authorization: Bearer {accessToken}
```

### Create Position

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

### Update Position

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

### Delete Position

```http
DELETE /api/v1/positions/{id}
Authorization: Bearer {accessToken}
```

---

## 🔑 Permission Management API

### Get Permission List

```http
GET /api/v1/permissions?page=1&pageSize=10&category=EmployeeManagement&resource=Employee
Authorization: Bearer {accessToken}
```

### Get Role List

```http
GET /api/v1/roles?page=1&pageSize=10
Authorization: Bearer {accessToken}
```

### Get Employee Roles

```http
GET /api/v1/employees/{employeeId}/roles
Authorization: Bearer {accessToken}
```

### Assign Roles to Employee

```http
POST /api/v1/employees/{employeeId}/roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roleIds": [1, 2, 3]
}
```

### Remove Role from Employee

```http
DELETE /api/v1/employees/{employeeId}/roles/{roleId}
Authorization: Bearer {accessToken}
```

### Get Role Permissions

```http
GET /api/v1/roles/{roleId}/permissions
Authorization: Bearer {accessToken}
```

### Assign Permissions to Role

```http
POST /api/v1/roles/{roleId}/permissions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "permissionIds": [1, 2, 3, 4]
}
```

---

## 📄 Document Management API

### Identity Document Management

#### Get Employee Identity Documents

```http
GET /api/v1/identity-documents/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### Create Identity Document

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

#### Get Expiring Documents

```http
GET /api/v1/identity-documents/expiring?daysFromNow=30
Authorization: Bearer {accessToken}
```

#### Get Expired Documents

```http
GET /api/v1/identity-documents/expired
Authorization: Bearer {accessToken}
```

### Education Background Management

#### Get Employee Education Background

```http
GET /api/v1/educations/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### Create Education Background

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

### Professional Certification Management

#### Get Employee Professional Certifications

```http
GET /api/v1/certifications/employee/{employeeId}
Authorization: Bearer {accessToken}
```

#### Create Professional Certification

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

## 📋 Contract Management API

### Get Contract List

```http
GET /api/v1/contracts?page=1&pageSize=10&status=Active&employeeId=1
Authorization: Bearer {accessToken}
```

### Get Employee Contracts

```http
GET /api/v1/contracts/employee/{employeeId}
Authorization: Bearer {accessToken}
```

### Create Contract

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

### Update Contract

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

### Get Expiring Contracts

```http
GET /api/v1/contracts/expiring?expiryDate=2024-12-31T00:00:00Z
Authorization: Bearer {accessToken}
```

### Get Contracts by Status

```http
GET /api/v1/contracts/status/{status}
Authorization: Bearer {accessToken}
```

---

## 📊 Common Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": null,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved successfully",
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

### Error Response

```json
{
  "success": false,
  "message": "Operation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## ❌ Error Handling

### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Request parameter validation failed",
  "data": null,
  "errors": [
    {
      "field": "firstName",
      "message": "First name cannot be empty"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Unauthorized Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized access",
  "data": null,
  "errors": [
    {
      "field": "authorization",
      "message": "Access token is invalid or expired"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Forbidden Error (403 Forbidden)

```json
{
  "success": false,
  "message": "Access forbidden",
  "data": null,
  "errors": [
    {
      "field": "permission",
      "message": "You do not have permission to perform this operation"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Resource Not Found Error (404 Not Found)

```json
{
  "success": false,
  "message": "Resource not found",
  "data": null,
  "errors": [
    {
      "field": "id",
      "message": "The specified employee does not exist"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Internal Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null,
  "errors": [
    {
      "field": "system",
      "message": "System is temporarily unavailable, please try again later"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 📋 Status Codes

| Status Code | Meaning                 | Description                          |
| ----------- | ----------------------- | ------------------------------------ |
| 200         | OK                      | Request successful                   |
| 201         | Created                 | Resource created successfully        |
| 204         | No Content              | Request successful, no content       |
| 400         | Bad Request             | Invalid request parameters          |
| 401         | Unauthorized            | Not authenticated                    |
| 403         | Forbidden               | No permission                        |
| 404         | Not Found               | Resource does not exist              |
| 409         | Conflict                | Resource conflict                    |
| 422         | Unprocessable Entity    | Valid format but semantic error      |
| 500         | Internal Server Error   | Internal server error                |

---

## 🔧 Usage Examples

### JavaScript/TypeScript Example

```typescript
// Get employee list
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

// Create employee
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

### C# Example

```csharp
// Using HttpClient to call API
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

## 📝 Notes

1. **Authentication**: All API calls require a valid access token in the Header
2. **Pagination**: List queries support pagination by default, recommend setting pageSize appropriately
3. **Search**: Supports multi-field fuzzy search, see specific API documentation for fields
4. **Sorting**: Supports multi-field sorting, see specific API documentation for fields
5. **Filtering**: Supports multi-condition filtering, see specific API documentation for parameters
6. **Version Control**: API supports versioning, current version is v1
7. **Rate Limiting**: API has access frequency limits, please control call frequency appropriately

---

**Document Version**: v1.0  
**Last Updated**: December 19, 2024  
**Maintained by**: Development Team
