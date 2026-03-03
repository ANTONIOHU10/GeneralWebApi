using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="CreateEmployeeDto"/> to create consistent,
/// readable test data for employee creation scenarios.
/// </summary>
public sealed class CreateEmployeeDtoBuilder
{
    private string _firstName = "John";
    private string _lastName = "Doe";
    private string? _employeeNumber = "EMP-NEW";
    private string _email = "john.doe@example.com";
    private string _phoneNumber = "+1234567890";
    private int? _departmentId = 10;
    private int? _positionId = 20;
    private int? _managerId = null;
    private DateTime _hireDate = new(2024, 1, 1);
    private string _employmentStatus = "Active";
    private string _employmentType = "FullTime";
    private bool _isManager;
    private decimal? _currentSalary = 60000m;
    private string? _salaryCurrency = "USD";
    private string _address = "123 Main St";
    private string _city = "New York";
    private string _postalCode = "10001";
    private string _country = "USA";
    private string _emergencyContactName = "Jane Doe";
    private string _emergencyContactPhone = "+1987654321";
    private string _emergencyContactRelation = "Spouse";
    private string _taxCode = "TAXCODE123";
    private string? _avatar = null;

    public CreateEmployeeDtoBuilder WithName(string firstName, string lastName)
    {
        _firstName = firstName;
        _lastName = lastName;
        return this;
    }

    public CreateEmployeeDtoBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public CreateEmployeeDtoBuilder WithDepartment(int? departmentId, int? positionId)
    {
        _departmentId = departmentId;
        _positionId = positionId;
        return this;
    }

    public CreateEmployeeDtoBuilder WithEmployeeNumber(string? employeeNumber)
    {
        _employeeNumber = employeeNumber;
        return this;
    }

    public CreateEmployeeDtoBuilder WithTaxCode(string taxCode)
    {
        _taxCode = taxCode;
        return this;
    }

    public CreateEmployeeDtoBuilder AsManager(bool isManager = true)
    {
        _isManager = isManager;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="CreateEmployeeDto"/> with the configured values.
    /// </summary>
    public CreateEmployeeDto Build()
    {
        return new CreateEmployeeDto
        {
            FirstName = _firstName,
            LastName = _lastName,
            EmployeeNumber = _employeeNumber,
            Email = _email,
            PhoneNumber = _phoneNumber,
            DepartmentId = _departmentId,
            PositionId = _positionId,
            ManagerId = _managerId,
            HireDate = _hireDate,
            EmploymentStatus = _employmentStatus,
            EmploymentType = _employmentType,
            IsManager = _isManager,
            CurrentSalary = _currentSalary,
            SalaryCurrency = _salaryCurrency,
            Address = _address,
            City = _city,
            PostalCode = _postalCode,
            Country = _country,
            EmergencyContactName = _emergencyContactName,
            EmergencyContactPhone = _emergencyContactPhone,
            EmergencyContactRelation = _emergencyContactRelation,
            TaxCode = _taxCode,
            Avatar = _avatar
        };
    }
}

