using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="UpdateEmployeeDto"/> to create consistent,
/// readable test data for employee update scenarios.
/// </summary>
public sealed class UpdateEmployeeDtoBuilder
{
    private int _id = 1;
    private string _firstName = "John";
    private string _lastName = "Doe";
    private string _employeeNumber = "EMP-001";
    private string _email = "john.doe@example.com";
    private string _phoneNumber = "+1234567890";
    private int? _departmentId = 10;
    private int? _positionId = 20;
    private int? _managerId = null;
    private DateTime _hireDate = new(2020, 1, 15);
    private DateTime? _terminationDate = null;
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
    private string? _avatar = null;

    public UpdateEmployeeDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public UpdateEmployeeDtoBuilder WithName(string firstName, string lastName)
    {
        _firstName = firstName;
        _lastName = lastName;
        return this;
    }

    public UpdateEmployeeDtoBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UpdateEmployeeDtoBuilder WithEmployeeNumber(string employeeNumber)
    {
        _employeeNumber = employeeNumber;
        return this;
    }

    public UpdateEmployeeDtoBuilder WithTermination(DateTime? terminationDate, string employmentStatus = "Inactive")
    {
        _terminationDate = terminationDate;
        _employmentStatus = employmentStatus;
        return this;
    }

    public UpdateEmployeeDtoBuilder AsManager(bool isManager = true)
    {
        _isManager = isManager;
        return this;
    }

    /// <summary>
    /// Builds an <see cref="UpdateEmployeeDto"/> with the configured values.
    /// </summary>
    public UpdateEmployeeDto Build()
    {
        return new UpdateEmployeeDto
        {
            Id = _id,
            FirstName = _firstName,
            LastName = _lastName,
            EmployeeNumber = _employeeNumber,
            Email = _email,
            PhoneNumber = _phoneNumber,
            DepartmentId = _departmentId,
            PositionId = _positionId,
            ManagerId = _managerId,
            HireDate = _hireDate,
            TerminationDate = _terminationDate,
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
            Avatar = _avatar
        };
    }
}
