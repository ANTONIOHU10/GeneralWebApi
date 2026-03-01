using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="EmployeeDto"/> to create consistent, readable test data
/// and avoid duplication across handler tests.
/// </summary>
public sealed class EmployeeDtoBuilder
{
    private int _id = 1;
    private string _firstName = "John";
    private string _lastName = "Doe";
    private string _employeeNumber = "EMP-001";
    private string _email = "john.doe@example.com";
    private string _phoneNumber = "+1234567890";
    private int? _departmentId = 10;
    private string? _departmentName = "Engineering";
    private int? _positionId = 20;
    private string? _positionTitle = "Software Engineer";
    private int? _managerId = null;
    private string? _managerName = null;
    private DateTime _hireDate = new(2020, 1, 15);
    private DateTime? _terminationDate = null;
    private string _employmentStatus = "Active";
    private string _employmentType = "FullTime";
    private bool _isManager = false;
    private int? _workingHoursPerWeek = 40;
    private decimal? _currentSalary = 60000m;
    private string? _salaryCurrency = "USD";
    private string _address = "123 Main St";
    private string _city = "New York";
    private string _postalCode = "10001";
    private string _country = "USA";
    private DateTime _createdAt = new(2020, 1, 15, 10, 0, 0, DateTimeKind.Utc);
    private string _createdBy = "system";
    private bool _isActive = true;
    private int _version = 1;

    public EmployeeDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public EmployeeDtoBuilder WithName(string firstName, string lastName)
    {
        _firstName = firstName;
        _lastName = lastName;
        return this;
    }

    public EmployeeDtoBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public EmployeeDtoBuilder WithEmployeeNumber(string employeeNumber)
    {
        _employeeNumber = employeeNumber;
        return this;
    }

    public EmployeeDtoBuilder Inactive()
    {
        _isActive = false;
        _employmentStatus = "Inactive";
        _terminationDate = DateTime.UtcNow.AddDays(-1);
        return this;
    }

    /// <summary>
    /// Builds an <see cref="EmployeeDto"/> with the configured values.
    /// </summary>
    public EmployeeDto Build()
    {
        return new EmployeeDto
        {
            Id = _id,
            FirstName = _firstName,
            LastName = _lastName,
            EmployeeNumber = _employeeNumber,
            Email = _email,
            PhoneNumber = _phoneNumber,
            DepartmentId = _departmentId,
            DepartmentName = _departmentName,
            PositionId = _positionId,
            PositionTitle = _positionTitle,
            ManagerId = _managerId,
            ManagerName = _managerName,
            HireDate = _hireDate,
            TerminationDate = _terminationDate,
            EmploymentStatus = _employmentStatus,
            EmploymentType = _employmentType,
            IsManager = _isManager,
            WorkingHoursPerWeek = _workingHoursPerWeek,
            CurrentSalary = _currentSalary,
            SalaryCurrency = _salaryCurrency,
            Address = _address,
            City = _city,
            PostalCode = _postalCode,
            Country = _country,
            EmergencyContactName = string.Empty,
            EmergencyContactPhone = string.Empty,
            EmergencyContactRelation = string.Empty,
            TaxCode = string.Empty,
            CreatedAt = _createdAt,
            CreatedBy = _createdBy,
            UpdatedAt = null,
            UpdatedBy = null,
            IsActive = _isActive,
            Version = _version,
            SortOrder = 0,
            Remarks = null,
            Avatar = null
        };
    }
}
