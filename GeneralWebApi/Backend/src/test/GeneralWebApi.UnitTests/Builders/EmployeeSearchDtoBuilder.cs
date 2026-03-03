using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="EmployeeSearchDto"/> to create consistent test data
/// for paged and search query handler tests.
/// </summary>
public sealed class EmployeeSearchDtoBuilder
{
    private string? _searchTerm;
    private int? _departmentId;
    private int? _positionId;
    private string? _employmentStatus;
    private DateTime? _hireDateFrom;
    private DateTime? _hireDateTo;
    private string? _firstName;
    private string? _lastName;
    private string? _email;
    private string? _employeeNumber;
    private string? _phone;
    private int _pageNumber = 1;
    private int _pageSize = 10;
    private string? _sortBy;
    private bool _sortDescending;

    public EmployeeSearchDtoBuilder WithDepartment(int? departmentId)
    {
        _departmentId = departmentId;
        return this;
    }

    public EmployeeSearchDtoBuilder WithPage(int pageNumber, int pageSize)
    {
        _pageNumber = pageNumber;
        _pageSize = pageSize;
        return this;
    }

    public EmployeeSearchDtoBuilder WithSearchTerm(string? searchTerm)
    {
        _searchTerm = searchTerm;
        return this;
    }

    public EmployeeSearchDtoBuilder WithSort(string? sortBy, bool sortDescending = false)
    {
        _sortBy = sortBy;
        _sortDescending = sortDescending;
        return this;
    }

    /// <summary>
    /// Builds an <see cref="EmployeeSearchDto"/> with the configured values.
    /// </summary>
    public EmployeeSearchDto Build()
    {
        return new EmployeeSearchDto
        {
            SearchTerm = _searchTerm,
            DepartmentId = _departmentId,
            PositionId = _positionId,
            EmploymentStatus = _employmentStatus,
            HireDateFrom = _hireDateFrom,
            HireDateTo = _hireDateTo,
            FirstName = _firstName,
            LastName = _lastName,
            Email = _email,
            EmployeeNumber = _employeeNumber,
            Phone = _phone,
            PageNumber = _pageNumber,
            PageSize = _pageSize,
            SortBy = _sortBy,
            SortDescending = _sortDescending
        };
    }
}
